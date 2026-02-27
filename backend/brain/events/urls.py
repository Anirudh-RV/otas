from django.urls import path
from .views import BackendEventCaptureView, AgentEventCaptureView

urlpatterns = [
    path('api/v1/backend/log/sdk/', BackendEventCaptureView.as_view(), name='backend-sdk-event-capture'),
    path('api/v1/backend/log/agent/', AgentEventCaptureView.as_view(), name='agent-event-capture'),
]
