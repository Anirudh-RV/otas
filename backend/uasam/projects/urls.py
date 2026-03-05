from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views import ProjectCreateView, UserProjectAuthenticateViewV1, BackendSDKKeyCreateView, BackendSDKKeyRevokeView, BackendSDKKeyListView, BackendSDKAuthenticateView, ProjectListView

urlpatterns = [
    path('v1/create/', csrf_exempt(ProjectCreateView.as_view()), name='project-create'),
    path('v1/sdk/backend/key/create/', csrf_exempt(BackendSDKKeyCreateView.as_view()), name='sdk-key-create'),
    path('v1/sdk/backend/key/list/', BackendSDKKeyListView.as_view(), name='sdk-key-list'),
    path('v1/sdk/backend/key/revoke/', csrf_exempt(BackendSDKKeyRevokeView.as_view()), name='sdk-key-revoke'),
    path('v1/authenticate/', csrf_exempt(UserProjectAuthenticateViewV1.as_view()), name='user-project-authenticate'),
    path('v1/sdk/backend/key/authenticate/', csrf_exempt(BackendSDKAuthenticateView.as_view()), name='sdk-authenticate'),
    path('v1/list/', ProjectListView.as_view()),
]