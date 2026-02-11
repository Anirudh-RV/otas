# apps/projects/views.py
import json
import logging
import jwt

from django.http import JsonResponse, HttpResponseBadRequest
from django.views import View
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Project, UserProjectMapping

logger = logging.getLogger(__name__)
User = get_user_model()


def decode_user_jwt(token: str):
    """
    Decode the X-OTAS-USER-TOKEN. Adjust to your JWT secret/algorithm and claims.
    Returns the payload dict or raises jwt exceptions.
    """
    return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])


def validate_create_project_payload(payload: dict):
    """
    Inline validator for create project request payload.
    Returns (is_valid: bool, data_or_errors: dict)
    On success data_or_errors will be {'project_name': str, 'project_description': str}
    On failure it will be {'errors': ['msg1', 'msg2', ...]}
    """
    errors = []
    if not isinstance(payload, dict):
        return False, {"errors": ["invalid_json"]}

    # project_name
    name = payload.get("project_name")
    if name is None:
        errors.append("project_name is required")
    else:
        if not isinstance(name, str):
            errors.append("project_name must be a string")
        else:
            name = name.strip()
            if not name:
                errors.append("project_name is required")
            elif len(name) > 255:
                errors.append("project_name too long (max 255)")

    # project_description (optional)
    desc = payload.get("project_description", "")
    if desc is None:
        desc = ""
    if not isinstance(desc, str):
        errors.append("project_description must be a string")
    else:
        if len(desc) > 300:
            errors.append("project_description max 300 characters")

    if errors:
        return False, {"errors": errors}

    return True, {"project_name": name, "project_description": desc}


class ProjectCreateView(View):
    """
    POST /api/project/v1/create/
    Header: X-OTAS-USER-TOKEN: <jwt_token>
    Body: { "project_name": "...", "project_description": "..." }
    """

    def post(self, request, *args, **kwargs):
        # 1) Header check
        token = request.headers.get("X-OTAS-USER-TOKEN")
        if not token:
            return JsonResponse(
                {"status": 0, "status_description": "project_creation_failed"},
                status=401,
            )

        # 2) Decode token and load user
        try:
            payload = decode_user_jwt(token)
            # common claim names: user_id or sub
            user_id = payload.get("user_id") or payload.get("sub")
            if not user_id:
                logger.warning("JWT missing user identifier: payload=%s", payload)
                return JsonResponse({"status": 0, "status_description": "project_creation_failed"}, status=401)
            try:
                user = User.objects.get(pk=user_id)
            except User.DoesNotExist:
                logger.warning("User not found from token: user_id=%s", user_id)
                return JsonResponse({"status": 0, "status_description": "project_creation_failed"}, status=401)
        except jwt.ExpiredSignatureError:
            logger.info("Expired token used for project create")
            return JsonResponse({"status": 0, "status_description": "project_creation_failed"}, status=401)
        except Exception as e:
            logger.exception("Error decoding token or loading user")
            return JsonResponse({"status": 0, "status_description": "project_creation_failed"}, status=401)

        # 3) Parse JSON body
        try:
            body = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            logger.warning("Invalid JSON in project create request")
            return HttpResponseBadRequest(
                json.dumps({"status": 0, "status_description": "project_creation_failed"}),
                content_type="application/json",
            )

        # 4) Validate inline
        is_valid, result = validate_create_project_payload(body)
        if not is_valid:
            # For security/consistency we return the same failure format, but log errors for debugging.
            logger.info("Project creation validation failed: %s", result["errors"])
            return JsonResponse({"status": 0, "status_description": "project_creation_failed"}, status=400)

        req_name = result["project_name"]
        req_desc = result["project_description"]

        # 5) Create Project + UserProjectMapping in a single transaction
        try:
            with transaction.atomic():
                project = Project.objects.create(
                    name=req_name,
                    description=req_desc,
                    created_by=user,
                    created_at=timezone.now(),  # model default will set this anyway
                )
                # create mapping as Admin (privilege = 1)
                UserProjectMapping.objects.create(
                    user=user,
                    project=project,
                    privilege=UserProjectMapping.PRIVILEGE_ADMIN,
                    created_at=timezone.now(),
                )

            # success response (capitalized keys per your convention)
            resp = {
            "status": 1,
            "status_description": "project_created",
            "response_body": {
                "project": {
                    "id": str(project.id),
                    "name": project.name,
                    "description": project.description,
                }
            },
        }

            return JsonResponse(resp, status=201)
        except Exception:
            # log full exception, but return generic failure to caller
            logger.exception("Failed to create project or mapping - transaction rolled back")
            return JsonResponse({"status": 0, "status_description": "project_creation_failed"}, status=500)
