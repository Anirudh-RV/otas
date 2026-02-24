from django.urls import path
from .views import BackendEventCaptureView

urlpatterns = [
    path('api/events/v1/capture/', BackendEventCaptureView.as_view(), name='event-capture'),
]
