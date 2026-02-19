from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from .views import CreateAgentSessionViewV1

urlpatterns = [
    path('v1/session/create', csrf_exempt(CreateAgentSessionViewV1.as_view()), name='agent-session-create'),
]
