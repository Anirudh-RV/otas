import json
import logging
import uuid

from django.http import JsonResponse, HttpResponseBadRequest
from django.views import View
from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Project, UserProjectMapping

logger = logging.getLogger(__name__)
User = get_user_model()


def validate_create_project_payload(payload: dict):
    """
    Inline validator for create project request payload.
    Returns (is_valid: bool, data_or_errors: dict)
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
    elif len(desc) > 300:
        errors.append("project_description max 300 characters")

    if errors:
        return False, {"errors": errors}

    return True, {"project_name": name, "project_description": desc}


class ProjectCreateView(View):
    """
    POST /api/project/v1/create/
    Body: { "project_name": "...", "project_description": "..." }

    DEV NOTE: Currently hardcoding user ID until auth decorator is ready.
    """

    def post(self, request, *args, **kwargs):
        # TEMP: get hardcoded user
        # DEV: get the dev user by username
        try:
            user = User.objects.get(username="")
        except User.DoesNotExist:
            logger.error("Dev user not found")
            return JsonResponse(
                {"status": 0, "status_description": "user_not_found"},
                status=400,
            )


        # Parse JSON body
        try:
            body = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            logger.warning("Invalid JSON in project create request")
            return HttpResponseBadRequest(
                json.dumps({"status": 0, "status_description": "project_creation_failed"}),
                content_type="application/json",
            )

        # 🔹 Debug: log request body
        print("Request body:", body)
        logger.info("Request body: %s", body)

        # Validate payload
        is_valid, result = validate_create_project_payload(body)
        if not is_valid:
            # 🔹 Log validation errors
            logger.info("Project creation validation failed: %s", result["errors"])
            return JsonResponse(
                {
                    "status": 0,
                    "status_description": "project_creation_failed",
                    "errors": result["errors"],  # return exact validation errors
                },
                status=400
            )

        req_name = result["project_name"]
        req_desc = result["project_description"]

        # Create Project + Mapping in single transaction
        try:
            with transaction.atomic():
                project = Project.objects.create(
                    name=req_name,
                    description=req_desc,
                    created_by=user,
                    created_at=timezone.now(),
                )

                UserProjectMapping.objects.create(
                    user=user,
                    project=project,
                    privilege=UserProjectMapping.PRIVILEGE_ADMIN,
                    created_at=timezone.now(),
                )

            # Success response
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

        except Exception as e:
            logger.exception("Failed to create project or mapping")
            return JsonResponse(
                {"status": 0, "status_description": "project_creation_failed"},
                status=500,
            )