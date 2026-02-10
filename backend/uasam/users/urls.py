from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views import CreateUserViewV1, LoginViewV1

urlpatterns = [
    path('v1/create/', csrf_exempt(CreateUserViewV1.as_view()), name='create_user'),
    path('v1/login/', csrf_exempt(LoginViewV1.as_view()), name='login'),
]