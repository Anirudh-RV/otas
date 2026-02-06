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
            missing_fields = [field for field in required_fields if not body.get(field)]
            
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