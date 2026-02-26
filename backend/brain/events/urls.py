from django.urls import path
from .views import BackendEventCaptureView

urlpatterns = [
    path('api/v1/backend/log/sdk/', BackendEventCaptureView.as_view(), name='event-capture'),
]
