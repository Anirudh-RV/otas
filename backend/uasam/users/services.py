import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth.hashers import check_password
from .models import User
from .constants import JWT_SECRET, JWT_VALIDITY_DAYS


class UserServices:
    
    @staticmethod
    def create_user(first_name, middle_name, last_name, email, password):
        """
        Create a new user and return user data with JWT token
        """
        try:
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                return {
                    'status': 0,
                    'status_description': 'user_already_exists',
                    'response_body': None
                }
            
            # Create user
            user = User.objects.create(
                first_name=first_name,
                middle_name=middle_name,
                last_name=last_name,
                email=email,
                password=password  # Will be hashed automatically by the model
            )
            
            # Generate JWT token
            jwt_token = UserServices.generate_jwt_token(user)
            
            # Prepare response
            return {
                'status': 1,
                'status_description': 'user_created',
                'response_body': {
                    'user': {
                        'id': str(user.id),
                        'first_name': user.first_name,
                        'middle_name': user.middle_name,
                        'last_name': user.last_name,
                        'email': user.email,
                        'created_at': user.created_at.isoformat(),
                        'updated_at': user.updated_at.isoformat(),
                    },
                    'jwt_token': jwt_token
                }
            }
            
        except Exception as e:
            return {
                'status': 0,
                'status_description': f'error: {str(e)}',
                'response_body': None
            }
    
    @staticmethod
    def login_user(email, password):
        """
        Authenticate user by email and password, return user data with JWT token
        """
        try:
            user = User.objects.filter(email=email).first()

            if not user or not check_password(password, user.password):
                return {
                    'status': 0,
                    'status_description': 'login_failed',
                }

            jwt_token = UserServices.generate_jwt_token(user)

            return {
                'status': 1,
                'status_description': 'login_success',
                'response': {
                    'user': {
                        'id': str(user.id),
                        'first_name': user.first_name,
                        'middle_name': user.middle_name,
                        'last_name': user.last_name,
                        'email': user.email,
                        'created_at': user.created_at.isoformat(),
                        'updated_at': user.updated_at.isoformat(),
                    },
                    'jwt_token': jwt_token
                }
            }

        except Exception as e:
            return {
                'status': 0,
                'status_description': 'login_failed',
            }

    @staticmethod
    def generate_jwt_token(user):
        """
        Generate JWT token for a user
        """
        payload = {
            'user_id': str(user.id),
            'email': user.email,
            'exp': datetime.utcnow() + timedelta(days=JWT_VALIDITY_DAYS),
            'iat': datetime.utcnow()
        }
        
        # Get secret key from settings
        secret_key = JWT_SECRET
        
        token = jwt.encode(payload, secret_key, algorithm='HS256')
        return token
    
    @staticmethod
    def get_user_from_token(token):
        """
        Decode JWT token and return the User object.
        Returns None if token is invalid or user does not exist.
        """
        try:
            # Decode the token using the same secret and algorithm
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            user_id = payload.get('user_id')
            
            # Fetch user from DB
            user = User.objects.get(id=user_id)
            return user
            
        except (jwt.ExpiredSignatureError, jwt.DecodeError, User.DoesNotExist):
            return None

    @staticmethod
    def update_user_profile(user, first_name, middle_name, last_name):
        """
        Update basic user profile fields.
        """
        try:
            user.first_name = first_name
            user.middle_name = middle_name
            user.last_name = last_name
            user.save()

            return {
                'status': 1,
                'status_description': 'user_profile_updated',
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
            }
        except Exception as e:
            return {
                'status': 0,
                'status_description': f'error: {str(e)}',
                'response_body': None
            }

    @staticmethod
    def update_user_password(user, password):
        """
        Update user password (hashes automatically in model save).
        """
        try:
            user.password = password
            user.save()

            return {
                'status': 1,
                'status_description': 'password_updated',
                'response_body': None
            }
        except Exception as e:
            return {
                'status': 0,
                'status_description': f'error: {str(e)}',
                'response_body': None
            }
