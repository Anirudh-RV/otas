import json
import jwt
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.views import View

from decorators import agent_authenticator
from users.constants import JWT_SECRET
from .models import AgentSession


class CreateAgentSessionViewV1(View):
    """
    POST /api/agent/v1/session/create
    Header: X-OTAS-AGENT-KEY
    Body: {"Meta": {...}}
    """

    @agent_authenticator
    def post(self, request):
        try:
            body = json.loads(request.body) if request.body else {}
        except json.JSONDecodeError:
            return JsonResponse({
                "status": 0,
                "status_description": "invalid_json"
            }, status=400)

        meta = body.get("Meta", {})
        if meta is None:
            meta = {}

        try:
            agent_session = AgentSession.objects.create(
                agent=request.agent,
                agent_key=request.agent_key,
                meta=meta,
            )

            payload = {
                "agent_session_id": str(agent_session.id),
                "agent_id": str(request.agent.id),
                "exp": datetime.utcnow() + timedelta(days=30),
                "iat": datetime.utcnow(),
            }
            jwt_token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

            return JsonResponse({
                "status": 1,
                "status_description": "agent_session_created",
                "response": {
                    "Header_value": "X-OTAS-AGENT-SESSION-TOKEN",
                    "jwt_token": jwt_token,
                }
            }, status=200)
        except Exception as e:
            return JsonResponse({
                "status": 0,
                "status_description": f"server_error: {str(e)}"
            }, status=500)
