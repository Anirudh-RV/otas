from django.urls import path
from django.views.decorators.csrf import csrf_exempt
<<<<<<< HEAD
from .views import ProjectCreateView, BackendSDKKeyCreateView

urlpatterns = [
    path('v1/create/', csrf_exempt(ProjectCreateView.as_view()), name='project-create'),
    path('v1/sdk/backend/key/create/', csrf_exempt(BackendSDKKeyCreateView.as_view()), name='sdk-key-create'),
=======
from .views import ProjectCreateView, UserProjectAuthenticateViewV1

urlpatterns = [
    path('v1/create/', csrf_exempt(ProjectCreateView.as_view()), name='project-create'),
    path('v1/authenticate/', csrf_exempt(UserProjectAuthenticateViewV1.as_view()), name='user-project-authenticate'),
>>>>>>> OTAS-10
]