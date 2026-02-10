from django.shortcuts import render

# Create your views here.
import json
import jwt
from django.http import JsonResponse, HttpResponseBadRequest
from django.views import View
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Project, UserProjectMapping
User = get_user_model()


def decode_user_jwt(token: str):
    """
    Decode the X-OTAS-USER-TOKEN. Adjust to your JWT secret/algorithm and claims.
    Should return user_id or raise jwt exceptions.
    """
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    # expect payload to include 'user_id'
    return payload


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
            return JsonResponse({"status": 0, "status_description": "project_creation_failed"},
                                status=401)

        # 2) Decode token and load user
        try:
            payload = decode_user_jwt(token)
            user_id = payload.get("user_id") or payload.get("sub")  # support common claim names
            if not user_id:
                raise Exception("no user_id in token")
            user = User.objects.get(pk=user_id)
        except jwt.ExpiredSignatureError:
            return JsonResponse({"status": 0, "status_description": "project_creation_failed"}, status=401)
        except Exception:
            # avoid leaking details
            return JsonResponse({"status": 0, "status_description": "project_creation_failed"}, status=401)

        # 3) Parse JSON body
        try:
            body = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return HttpResponseBadRequest(json.dumps({"status": 0, "status_description": "project_creation_failed"}),
                                          content_type="application/json")


        # 4) Create Project + UserProjectMapping in a single transaction
        try:
            with transaction.atomic():
                project = Project.objects.create(
                    name=req.project_name,
                    description=req.project_description,
                    created_by=user,
                    created_at=timezone.now(),  # models default would set this; explicit for clarity
                )
                # create mapping as Admin
                UserProjectMapping.objects.create(
                    user=user,
                    project=project,
                    privilege=UserProjectMapping.PRIVILEGE_ADMIN,
                    created_at=timezone.now()
                )

            # success response
            resp = {
                "status": 1,
                "status_description": "project_created",
                "Response_body": {
                    "Project": {
                        "ID": str(project.id),
                        "NAME": project.name,
                        "DESCRIPTION": project.description
                    }
                }
            }
            return JsonResponse(resp, status=201)
        except Exception as e:
            # log exception in real app
            return JsonResponse({"status": 0, "status_description": "project_creation_failed"}, status=500)
