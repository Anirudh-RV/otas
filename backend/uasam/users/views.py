from django.http import JsonResponse
from django.views import View
import json
from .services import UserServices


class CreateUserViewV1(View):
    """
    API endpoint to create a new user
    POST /api/user/v1/create/
    """
    
    def post(self, request):
        try:
            # Parse request body
            body = json.loads(request.body)
                        
            # Validate required fields
            required_fields = ['first_name', 'last_name', 'email', 'password']
            missing_fields = [field for field in required_fields if field not in body]
            
            if missing_fields:
                return JsonResponse({
                    'status': 0,
                    'status_description': f'missing_fields: {", ".join(missing_fields)}',
                    'response_body': None
                }, status=400)
            
            # Extract data
            first_name = body.get('first_name', '').strip()
            middle_name = body.get('middle_name', '').strip()
            last_name = body.get('last_name', '').strip()
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')
            
            # Validate email format (basic validation)
            if '@' not in email:
                return JsonResponse({
                    'status': 0,
                    'status_description': 'invalid_email_format',
                    'response_body': None
                }, status=400)
            
            # Validate password length
            if len(password) < 6:
                return JsonResponse({
                    'status': 0,
                    'status_description': 'password_too_short',
                    'response_body': None
                }, status=400)
            
            # Call service to create user
            result = UserServices.create_user(
                first_name=first_name,
                middle_name=middle_name,
                last_name=last_name,
                email=email,
                password=password
            )
            
            # Return response based on service result
            if result['status'] == 1:
                return JsonResponse(result, status=200)
            else:
                return JsonResponse(result, status=400)
            
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 0,
                'status_description': 'invalid_json',
                'response_body': None
            }, status=400)
        
        except Exception as e:
            return JsonResponse({
                'status': 0,
                'status_description': f'server_error: {str(e)}',
                'response_body': None
            }, status=400)


class LoginViewV1(View):
    """
    API endpoint to login a user
    POST /api/user/v1/login/
    """

    def post(self, request):
        try:
            body = json.loads(request.body)

            email = body.get('email', '').strip().lower()
            password = body.get('Password', '') or body.get('password', '')

            if not email or not password:
                return JsonResponse({
                    'status': 0,
                    'status_description': 'login_failed',
                }, status=401)

            result = UserServices.login_user(email=email, password=password)

            if result['status'] == 1:
                return JsonResponse(result, status=200)
            else:
                return JsonResponse(result, status=401)

        except json.JSONDecodeError:
            return JsonResponse({
                'status': 0,
                'status_description': 'login_failed',
            }, status=401)

        except Exception:
            return JsonResponse({
                'status': 0,
                'status_description': 'login_failed',
            }, status=401)
    
class UserAuthenticateViewV1(View):
    """
    API endpoint to authenticate user via Token
    POST /api/user/v1/authenticate/
    """
    
    def post(self, request):
        try:
            # 1. Get Token from Header 
            # Django converts "X-OTAS-USER-TOKEN" to "HTTP_X_OTAS_USER_TOKEN"
            token = request.META.get('HTTP_X_OTAS_USER_TOKEN')
            
            if not token:
                return JsonResponse({
                    'status': 0,
                    'status_description': 'missing_token',
                    'response_body': None
                }, status=400)
            
            # 2. Validate Token & Get User via Service
            user = UserServices.get_user_from_token(token)
            
            if not user:
                return JsonResponse({
                    'status': 0,
                    'status_description': 'invalid_token',
                    'response_body': None
                }, status=401)
            
            # 3. Success Response
            return JsonResponse({
                'status': 1,
                'status_description': 'user_authenticated',
                'response_body': {
                    'user': {
                        'id': str(user.id),
                        'first_name': user.first_name,
                        'middle_name': user.middle_name,
                        'last_name': user.last_name,
                        'email': user.email,
                        'created_at': user.created_at.isoformat(),
                        'updated_at': user.updated_at.isoformat(),
                    }
                }
            }, status=200)

        except Exception as e:
            return JsonResponse({
                'status': 0,
                'status_description': f'server_error: {str(e)}',
                'response_body': None
            }, status=500)


class UserEditViewV1(View):
    """
    API endpoint to update current user profile
    PUT /api/user/v1/edit/
    Header: X-OTAS-USER-TOKEN
    """

    def put(self, request):
        try:
            token = request.META.get('HTTP_X_OTAS_USER_TOKEN')
            if not token:
                return JsonResponse({
                    'status': 0,
                    'status_description': 'missing_token',
                    'response_body': None
                }, status=400)

            user = UserServices.get_user_from_token(token)
            if not user:
                return JsonResponse({
                    'status': 0,
                    'status_description': 'invalid_token',
                    'response_body': None
                }, status=401)

            body = json.loads(request.body)
            first_name = body.get('first_name', '').strip()
            middle_name = body.get('middle_name', '').strip()
            last_name = body.get('last_name', '').strip()

            if not first_name or not last_name:
                return JsonResponse({
                    'status': 0,
                    'status_description': 'missing_required_fields',
                    'response_body': None
                }, status=400)

            result = UserServices.update_user_profile(
                user=user,
                first_name=first_name,
                middle_name=middle_name,
                last_name=last_name
            )

            if result['status'] == 1:
                return JsonResponse(result, status=200)
            return JsonResponse(result, status=400)

        except json.JSONDecodeError:
            return JsonResponse({
                'status': 0,
                'status_description': 'invalid_json',
                'response_body': None
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'status': 0,
                'status_description': f'server_error: {str(e)}',
                'response_body': None
            }, status=500)


class UserPasswordUpdateViewV1(View):
    """
    API endpoint to update current user password
    PUT /api/user/v1/reset-password/update/
    Header: X-OTAS-USER-TOKEN
    """

    def put(self, request):
        try:
            token = request.META.get('HTTP_X_OTAS_USER_TOKEN')
            if not token:
                return JsonResponse({
                    'status': 0,
                    'status_description': 'missing_token',
                    'response_body': None
                }, status=400)

            user = UserServices.get_user_from_token(token)
            if not user:
                return JsonResponse({
                    'status': 0,
                    'status_description': 'invalid_token',
                    'response_body': None
                }, status=401)

            body = json.loads(request.body)
            password = body.get('password', '')

            if not password:
                return JsonResponse({
                    'status': 0,
                    'status_description': 'missing_password',
                    'response_body': None
                }, status=400)

            if len(password) < 6:
                return JsonResponse({
                    'status': 0,
                    'status_description': 'password_too_short',
                    'response_body': None
                }, status=400)

            result = UserServices.update_user_password(user=user, password=password)
            if result['status'] == 1:
                return JsonResponse(result, status=200)
            return JsonResponse(result, status=400)

        except json.JSONDecodeError:
            return JsonResponse({
                'status': 0,
                'status_description': 'invalid_json',
                'response_body': None
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'status': 0,
                'status_description': f'server_error: {str(e)}',
                'response_body': None
            }, status=500)
