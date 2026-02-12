from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views import ProjectCreateView

urlpatterns = [
    path('v1/create/', csrf_exempt(ProjectCreateView.as_view()), name='project-create'),
]