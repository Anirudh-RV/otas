from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from .views import (
    CreateAgentSessionViewV1, 
    AgentCreateView, 
    AgentListView, 
    AgentSessionListView,
    AgentKeyCreateView,
    AgentAuthVerifyView
)

urlpatterns = [
    path('v1/create/', csrf_exempt(AgentCreateView.as_view()), name='agent-create'),
    path('v1/agents/key/create/', csrf_exempt(AgentKeyCreateView.as_view()), name='agent-key-create'), 
    path('v1/session/create/', csrf_exempt(CreateAgentSessionViewV1.as_view()), name='agent-session-create'),
    path('v1/list/', csrf_exempt(AgentListView.as_view()), name='agent-list'),
    path('v1/sessions/list/', csrf_exempt(AgentSessionListView.as_view()), name='agent-session-list'),
    path('v1/auth/verify/', csrf_exempt(AgentAuthVerifyView.as_view()), name='agent-auth-verify'),
]