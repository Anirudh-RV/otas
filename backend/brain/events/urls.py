from django.urls import path
from .views import BackendEventCaptureView, AgentLogCaptureView

urlpatterns = [
    path('api/v1/backend/log/sdk/', BackendEventCaptureView.as_view(), name='backend-event-capture'),
    path('api/v1/backend/log/agent/', AgentLogCaptureView.as_view(), name='agent-log-capture'),
]
