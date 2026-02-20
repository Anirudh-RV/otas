from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from .views import CreateAgentSessionViewV1, AgentCreateView

urlpatterns = [
    path('v1/create/', csrf_exempt(AgentCreateView.as_view()), name='agent-create'),
    path('v1/session/create/', csrf_exempt(CreateAgentSessionViewV1.as_view()), name='agent-session-create'),
]
