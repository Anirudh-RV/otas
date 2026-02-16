import json
import logging
import uuid

from django.http import JsonResponse, HttpResponseBadRequest
from django.views import View
from django.db import transaction
from django.utils import timezone
from django.utils.decorators import method_decorator

from users.services import UserServices
from .models import Project, UserProjectMapping, BackendAPIKey

from decorators import user_auth_required, user_project_auth_required, sdk_authenticator
from django.utils.decorators import method_decorator


logger = logging.getLogger(__name__)

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


def validate_backend_sdk_key_payload(payload: dict):
    """
    Inline validator for backend SDK key creation request payload.
    Returns (is_valid: bool, data_or_errors: dict)
    """
    errors = []
    if not isinstance(payload, dict):
        return False, {"errors": ["invalid_json"]}

    # validity (required, integer, 1-300 days)
    validity = payload.get("validity")
    if validity is None:
        errors.append("validity is required")
    else:
        if not isinstance(validity, int):
            errors.append("validity must be an integer")
        elif validity < 1 or validity > 300:
            errors.append("validity must be between 1 and 300 days")

    if errors:
        return False, {"errors": errors}

    return True, {"validity": validity}


@method_decorator(user_auth_required, name='dispatch')
class ProjectCreateView(View):
    """
    POST /api/project/v1/create/
    Body: { "project_name": "...", "project_description": "..." }

    DEV NOTE: Currently hardcoding user ID until auth decorator is ready.
    """

    def post(self, request, *args, **kwargs):

        # replace by the decorator
        
        # 1. Get Token from Header
        # token = request.META.get('HTTP_X_OTAS_USER_TOKEN')
        
        # if not token:
        #     return JsonResponse({
        #         "status": 0, 
        #         "status_description": "missing_token"
        #     }, status=400)

        # 2. Authenticate User (The real fix)
        # user = UserServices.get_user_from_token(token)
        
        user = request.user

        if not user:
            return JsonResponse({
                "status": 0, 
                "status_description": "invalid_token"
            }, status=401)


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
        
class UserProjectAuthenticateViewV1(View):
    """
    API endpoint to authenticate user and project membership
    POST /api/user-project/v1/authenticate/
    Headers:
        X-OTAS-USER-TOKEN: <jwt_token>
        X-OTAS-PROJECT-ID: <project_uuid>
    """

    def post(self, request):
        try:
            # 1. Get Headers
            token = request.META.get('HTTP_X_OTAS_USER_TOKEN')
            project_id_str = request.META.get('HTTP_X_OTAS_PROJECT_ID')

            # Validate Headers
            if not token or not project_id_str:
                return JsonResponse({
                    'Status': 0,
                    'Status Description': 'missing_headers',
                    'Response': None
                }, status=400)

            # 2. Authenticate User (Using UserServices from users app)
            user = UserServices.get_user_from_token(token)
            
            if not user:
                return JsonResponse({
                    'Status': 0,
                    'Status Description': 'invalid_token',
                    'Response': None
                }, status=401)

            # 3. Authenticate Project Mapping
            try:
                # Convert string to UUID to match your model
                project_uuid = uuid.UUID(project_id_str)
                
                project = Project.objects.get(id=project_uuid)
                mapping = UserProjectMapping.objects.get(user=user, project=project)

                # 4. Success Response
                return JsonResponse({
                    'Status': 1,
                    'Status Description': 'user_project_mapping_authenticated',
                    'Response': {
                        'UserProjectMapping': {
                            'User': {
                                'id': str(user.id),
                                'first_name': user.first_name,
                                'last_name': user.last_name,
                                'email': user.email
                            },
                            'Project': {
                                'project_id': str(project.id),
                                'name': project.name
                            },
                            'Privilege': mapping.privilege
                        }
                    }
                }, status=200)

            except (ValueError, Project.DoesNotExist, UserProjectMapping.DoesNotExist):
                # ValueError catches invalid UUID strings
                return JsonResponse({
                    'Status': 0,
                    'Status Description': 'user_project_mapping_invalid',
                    'Response': None
                }, status=400)

        except Exception as e:
            logger.exception("Unexpected error in UserProjectAuthenticateViewV1")
            return JsonResponse({
                'Status': 0,
                'Status Description': f'server_error: {str(e)}',
                'Response': None
            }, status=500)

@method_decorator(user_project_auth_required, name='dispatch')
class BackendSDKKeyCreateView(View):
    """
    POST /api/project/v1/sdk/backend/key/create/
    
    Create a new backend SDK API key for a project.
    
    Headers:
    - X-OTAS-USER-TOKEN: User JWT token
    - X-OTAS-PROJECT-ID: Project UUID
    
    Body: { "validity": 30 } (days, max 300)
    
    Response: API key details (raw key shown ONLY ONCE)
    """
    def post(self, request, *args, **kwargs):
        # User and Project are set by user_project_auth_required decorator
        user = request.user
        project = request.project
        privilege = request.privilege

        # Parse JSON body
        try:
            body = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            logger.warning("Invalid JSON in SDK key creation request")
            return JsonResponse(
                {
                    "status": 0,
                    "status_description": "sdk_key_creation_failed"
                },
                status=400
            )

        # Validate request payload
        is_valid, result = validate_backend_sdk_key_payload(body)
        if not is_valid:
            logger.info("SDK key creation validation failed: %s", result["errors"])
            return JsonResponse(
                {
                    "status": 0,
                    "status_description": "sdk_key_creation_failed",
                    "errors": result["errors"]
                },
                status=400
            )

        validity_days = result['validity']

        # Generate API key
        try:
            with transaction.atomic():
                full_key, prefix = BackendAPIKey.generate_key()
                expires_at = timezone.now() + timezone.timedelta(days=validity_days)
                api_key = BackendAPIKey.objects.create(
                    prefix=prefix,
                    project=project,
                    created_at=timezone.now(),
                    expires_at=expires_at,
                    active=True
                )
                api_key.hash_key(full_key)
                api_key.save()

                response_data = {
                    'id': str(api_key.id),
                    'prefix': api_key.prefix,
                    'api_key': full_key,  # Raw key - shown only once
                    'project_id': str(api_key.project_id),
                    'name': api_key.name,
                    'created_at': api_key.created_at.isoformat(),
                    'expires_at': api_key.expires_at.isoformat() if api_key.expires_at else None,
                    'active': api_key.active
                }

                return JsonResponse(
                    {
                        "status": 1,
                        "status_description": "backend_sdk_key_created",
                        "response_body": response_data
                    },
                    status=201
                )

        except Exception as e:
            logger.exception("Failed to create SDK key")
            return JsonResponse(
                {
                    "status": 0,
                    "status_description": "sdk_key_creation_failed"
                },
                status=500
            )
@method_decorator(sdk_authenticator, name='dispatch')
class BackendSDKAuthenticateView(View):
    def post(self, request, *args, **kwargs):
        project = request.project 
        
        return JsonResponse({
            "Status": 1,
            "Status Description": "authenticated",
            "Response": {
                "PROJECT": {
                    "id": str(project.id),
                    "name": project.name,
                    "description": project.description,
                }
            }
        }, status=200)