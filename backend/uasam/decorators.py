from functools import wraps
from django.http import JsonResponse
from users.services import UserServices
from projects.models import Project, UserProjectMapping, BackendAPIKey 
from agents.models import AgentKey
import uuid

def user_auth_required(view_fuc):
    @wraps(view_fuc)
    def wrapper( request, *args, **kwargs):
        token = request.META.get('HTTP_X_OTAS_USER_TOKEN')

        if not token:
            return JsonResponse({
                "status": 0,
                "status_description": "missing_token"
            }, status=400)

        user = UserServices.get_user_from_token(token)

        if not user:
            return JsonResponse({
                "status": 0,
                "status_description": "invalid_token"
            }, status=401)

        request.user = user
        return view_fuc( request, *args, **kwargs)

    return wrapper


def user_project_auth_required(view_method):
    @wraps(view_method)
    def wrapper(request, *args, **kwargs):
        token = request.META.get('HTTP_X_OTAS_USER_TOKEN')
        project_id_str = request.META.get('HTTP_X_OTAS_PROJECT_ID')

        if not token or not project_id_str:
            return JsonResponse({
                "status": 0,
                "status_description": "missing_headers"
            }, status=400)

        user = UserServices.get_user_from_token(token)

        if not user:
            return JsonResponse({
                "status": 0,
                "status_description": "invalid_token"
            }, status=401)

        try:
            project_uuid = uuid.UUID(project_id_str)
            project = Project.objects.get(id=project_uuid)
            mapping = UserProjectMapping.objects.get(user=user, project=project)
        except (ValueError, Project.DoesNotExist, UserProjectMapping.DoesNotExist):
            return JsonResponse({
                "status": 0,
                "status_description": "user_project_mapping_invalid"
            }, status=403)

        request.user = user
        request.project = project
        request.privilege = mapping.privilege

        return view_method(request, *args, **kwargs)

    return wrapper


def sdk_authenticator(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        full_key = request.headers.get("X-OTAS-SDK-KEY")
        if not full_key:
            return JsonResponse({"error": "SDK Key missing"}, status=401)

        try:
            parts = full_key.split('_', 2)
            if len(parts) != 3:
                return JsonResponse({"error": "Invalid Key Format"}, status=403)
            prefix_candidate = parts[1]
            secret_part = parts[2]

            key_qs = BackendAPIKey.objects.filter(active=True)
            matched_key = None
            for key_obj in key_qs:
                if key_obj.verify_key(full_key):
                    matched_key = key_obj
                    break

            if not matched_key:
                return JsonResponse({"error": "Invalid SDK Key"}, status=403)

            request.project = matched_key.project

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

        return view_func(request, *args, **kwargs)

    return wrapper


def agent_authenticator(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        full_key = request.headers.get("X-OTAS-AGENT-KEY")
        if not full_key:
            return JsonResponse({
                "status": 0,
                "status_description": "invalid_agent_key"
            }, status=401)

        try:
            parts = full_key.split("_", 2)
            if len(parts) != 3 or parts[0] != "agent":
                return JsonResponse({
                    "status": 0,
                    "status_description": "invalid_agent_key"
                }, status=401)

            prefix = parts[1]
            key_qs = AgentKey.objects.filter(active=True, prefix=prefix).select_related("agent")

            matched_key = None
            for key_obj in key_qs:
                if key_obj.verify_key(full_key):
                    matched_key = key_obj
                    break

            if not matched_key:
                return JsonResponse({
                    "status": 0,
                    "status_description": "invalid_agent_key"
                }, status=401)

            request.agent = matched_key.agent
            request.agent_key = matched_key

        except Exception:
            return JsonResponse({
                "status": 0,
                "status_description": "invalid_agent_key"
            }, status=401)

        return view_func(request, *args, **kwargs)

    return wrapper
