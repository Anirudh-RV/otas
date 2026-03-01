from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views import (
    CreateUserViewV1,
    LoginViewV1,
    UserAuthenticateViewV1,
    UserEditViewV1,
    UserPasswordUpdateViewV1,
)

urlpatterns = [
    path('v1/create/', csrf_exempt(CreateUserViewV1.as_view()), name='create_user'),
    path('v1/login/', csrf_exempt(LoginViewV1.as_view()), name='login'),
    path('v1/authenticate/', csrf_exempt(UserAuthenticateViewV1.as_view()), name='authenticate_user'),
    path('v1/edit/', csrf_exempt(UserEditViewV1.as_view()), name='edit_user'),
    path(
        'v1/reset-password/update/',
        csrf_exempt(UserPasswordUpdateViewV1.as_view()),
        name='update_password',
    ),
]
