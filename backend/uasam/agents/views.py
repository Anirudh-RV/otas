import json
import jwt
import logging
import uuid
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.views import View
from django.db import transaction
from django.shortcuts import render
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.shortcuts import render

from decorators import agent_authenticator, user_project_auth_required
from users.constants import JWT_SECRET
from .models import AgentSession, Agent, AgentKey
from projects.models import UserProjectMapping

logger = logging.getLogger(__name__)


@method_decorator(user_project_auth_required, name='dispatch')
class AgentCreateView(View):
    """
    POST /api/agent/v1/create/
    
    Create a new Agent and Agent SDK key for a project.
    
    Headers:
    - X-OTAS-USER-TOKEN: User JWT token
    - X-OTAS-PROJECT-ID: Project UUID
    
    Body: {
            "agnet_name": "backend agent",
            "agent_description": "Does some xyz on some abc",
            "agent_provider": "Anthropic"
            }

    """
    def post(self, request, *args, **kwargs):
        user = request.user
        project = request.project
        privilege = request.privilege

        if privilege != UserProjectMapping.PRIVILEGE_ADMIN:
            return JsonResponse({
                "status": 0,
                "status_description": "forbidden"
            }, status=403)

        try:
            body = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            print("Invalid JSON in request body")
            return JsonResponse({
                "status": 0,
                "status_description": "agent_creation_failed"
            }, status=400)

        name = body.get("agent_name")
        description = body.get("agent_description", "")
        provider = body.get("agent_provider")

        if not name or not provider:
            print("Missing required fields: Name and Provider")
            return JsonResponse({
                "status": 0,
                "status_description": "agent_creation_failed"
            }, status=400)

        try:
            with transaction.atomic():

                agent = Agent.objects.create(
                    name=name.strip(),
                    description=description.strip(),
                    provider=provider.strip(),
                    project=project,
                    created_by=user,
                    created_at=timezone.now(),
                )

                full_key, prefix = AgentKey.generate_key()

                expires_at = timezone.now() + timezone.timedelta(days=30)

                agent_key = AgentKey.objects.create(
                    prefix=prefix,
                    agent=agent,
                    created_at=timezone.now(),
                    expires_at=expires_at,
                    active=True
                )

                agent_key.hash_key(full_key)
                agent_key.save()

            return JsonResponse({
                "status": 1,
                "status_description": "agent_created",
                "response": {
                    "agent": {
                        "id": str(agent.id),
                        "name": agent.name,
                        "description": agent.description,
                        "provider": agent.provider,
                        "project_id": str(project.id),
                        "created_by": str(user.id),
                        "created_at": agent.created_at.isoformat(),
                    },
                    "agent_key": {
                        "id": str(agent_key.id),
                        "prefix": agent_key.prefix,
                        "api_key": full_key,  
                        "agent_id": str(agent.id),
                        "created_at": agent_key.created_at.isoformat(),
                        "expires_at": agent_key.expires_at.isoformat(), # type: ignore
                        "active": agent_key.active
                    }
                }
            }, status=201)

        except Exception:
            logger.exception("Agent creation failed")
            print("Exception during agent creation")
            return JsonResponse({
                "status": 0,
                "status_description": "agent_creation_failed"
            }, status=400)

@method_decorator(agent_authenticator, name='dispatch')
class CreateAgentSessionViewV1(View):
    """
    POST /api/agent/v1/session/create
    Header: X-OTAS-AGENT-KEY
    Body: {"meta": {...}}
    """

    def post(self, request, *args, **kwargs):
        try:
            body = json.loads(request.body) if request.body else {}
        except json.JSONDecodeError:
            return JsonResponse({
                "status": 0,
                "status_description": "invalid_json"
            }, status=400)

        meta = body.get("meta", {})
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

@method_decorator(user_project_auth_required, name='dispatch')
class AgentListView(View):
    """
    POST /api/agent/v1/list/

    Headers:
        X-OTAS-USER-TOKEN
        X-OTAS-PROJECT-ID
    """

    def post(self, request, *args, **kwargs):
        project = request.project

        agents = (
            Agent.objects
            .filter(project=project, is_active=True)
            .prefetch_related("keys")
        )

        agent_list = []

        for agent in agents:
            keys = agent.keys.filter(active=True)

            key_data = []
            for key in keys:
                key_data.append({
                    "id": str(key.id),
                    "prefix": key.prefix,
                    "name": key.name,
                    "created_at": key.created_at.isoformat(),
                    "expires_at": key.expires_at.isoformat() if key.expires_at else None,
                    "active": key.active,
                })

            agent_list.append({
                "id": str(agent.id),
                "name": agent.name,
                "description": agent.description,
                "provider": agent.provider,
                "created_at": agent.created_at.isoformat(),
                "created_by": str(agent.created_by_id),
                "is_active": agent.is_active,
                "agent_keys": key_data,
            })

        return JsonResponse({
            "status": 1,
            "status_description": "agents_listed",
            "response": {
                "project_id": str(project.id),
                "agents": agent_list
            }
        }, status=200)

@method_decorator(user_project_auth_required, name='dispatch')
class AgentSessionListView(View):
    """
    POST /api/agent/v1/sessions/list/

    Body:
    {
        "agent_id": "<uuid>"
    }
    """

    def post(self, request, *args, **kwargs):
        project = request.project

        try:
            body = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({
                "status": 0,
                "status_description": "invalid_json"
            }, status=400)

        agent_id = body.get("agent_id")
        if not agent_id:
            return JsonResponse({
                "status": 0,
                "status_description": "agent_id_required"
            }, status=400)

        try:
            agent_uuid = uuid.UUID(agent_id)
            agent = Agent.objects.get(
                id=agent_uuid,
                project=project,
                is_active=True
            )
        except (ValueError, Agent.DoesNotExist):
            return JsonResponse({
                "status": 0,
                "status_description": "agent_not_found_or_no_access"
            }, status=403)

        sessions = (
            AgentSession.objects
            .filter(agent=agent)
            .select_related("agent_key")
            .order_by("-created_at")
        )

        session_list = []

        for session in sessions:
            session_list.append({
                "id": str(session.id),
                "agent_key_id": str(session.agent_key_id) if session.agent_key else None,
                "created_at": session.created_at.isoformat(),
                "meta": session.meta,
            })

        return JsonResponse({
            "status": 1,
            "status_description": "agent_sessions_listed",
            "response": {
                "agent_id": str(agent.id),
                "sessions": session_list
            }
        }, status=200)
    
@method_decorator(user_project_auth_required, name='dispatch')
class AgentKeyCreateView(View):
    """
    POST /api/agent/v1/agents/key/create/
    
    Generate a new SDK key for an existing Agent.
    
    Headers:
    - X-OTAS-USER-TOKEN: User JWT token
    - X-OTAS-PROJECT-ID: Project UUID
    
    Body: { "agent_id": "<uuid>" }
    """
    def post(self, request, *args, **kwargs):
        user = request.user
        project = request.project
        privilege = request.privilege

        # Ensure only admins can create/renew keys
        if privilege != UserProjectMapping.PRIVILEGE_ADMIN:
            return JsonResponse({
                "status": 0,
                "status_description": "forbidden"
            }, status=403)

        try:
            body = json.loads(request.body or "{}")
            agent_id = body.get("agent_id")
        except json.JSONDecodeError:
            return JsonResponse({
                "status": 0,
                "status_description": "invalid_json"
            }, status=400)

        if not agent_id:
            return JsonResponse({
                "status": 0,
                "status_description": "agent_id_required"
            }, status=400)

        try:
            # Verify the agent exists and belongs to the project
            agent = Agent.objects.get(id=agent_id, project=project, is_active=True)
            
            with transaction.atomic():
                AgentKey.objects.filter(agent=agent, active=True).update(active=False, revoked_at=timezone.now())

                full_key, prefix = AgentKey.generate_key()
                expires_at = timezone.now() + timezone.timedelta(days=30)

                agent_key = AgentKey.objects.create(
                    prefix=prefix,
                    agent=agent,
                    created_at=timezone.now(),
                    expires_at=expires_at,
                    active=True
                )

                agent_key.hash_key(full_key)
                agent_key.save()

            return JsonResponse({
                "status": 1,
                "status_description": "agent_key_created",
                "response": {
                    "agent_id": str(agent.id),
                    "agent_key": {
                        "id": str(agent_key.id),
                        "prefix": agent_key.prefix,
                        "api_key": full_key,
                        "created_at": agent_key.created_at.isoformat(),
                        "expires_at": agent_key.expires_at.isoformat(),
                        "active": agent_key.active
                    }
                }
            }, status=201)

        except Agent.DoesNotExist:
            return JsonResponse({
                "status": 0,
                "status_description": "agent_not_found_or_no_access"
            }, status=404)
        except Exception as e:
            logger.exception("Agent key creation failed")
            return JsonResponse({
                "status": 0,
                "status_description": "server_error"
            }, status=500)