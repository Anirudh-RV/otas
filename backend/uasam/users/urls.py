from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from otas.backend.uasam.projects.views import ProjectCreateView
from .views import CreateUserViewV1

urlpatterns = [
    path('v1/create/', csrf_exempt(CreateUserViewV1.as_view()), name='create_user'),
    path('api/project/v1/create/', ProjectCreateView.as_view(), name='project-create'),
]