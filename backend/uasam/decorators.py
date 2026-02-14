from functools import wraps
from django.http import JsonResponse
from users.services import UserServices
from projects.models import Project, UserProjectMapping
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

