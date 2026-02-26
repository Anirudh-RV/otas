from .models import BackendEvent
import jwt
import requests
from django.conf import settings

SDK_AUTH_URL = getattr(settings, 'SDK_AUTH_URL', 'http://uasam-backend:8000/api/project/v1/sdk/backend/key/authenticate/')

def validate_agent_session_token(token):
    """
    Gets and validates an agent session JWT token.
    Returns with agent_session_id and agent_id on success, None on failure.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])

        agent_session_id = payload.get('agent_session_id')
        agent_id = payload.get('agent_id')

        if not agent_session_id or not agent_id:
            return None

        return {
            'agent_session_id': agent_session_id,
            'agent_id': agent_id,
        }

    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def verify_sdk_key(sdk_key):
    """
    Calls the UASAM service to verify the SDK key.
    Returns project info dict if valid, None if invalid.
    """
    try:
        headers = {"X-OTAS-SDK-KEY": sdk_key}
        resp = requests.post(SDK_AUTH_URL, headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status") == 1:
                return data["response"]["project"]
        return None
    except Exception:
        return None

def build_event_and_save(token_data, project_info, body, OPTIONAL_FIELDS):
    """
    Builds event_kwargs and saves to DB. Returns the event object.
    """
    event_kwargs = {
        'agent_session_id': token_data['agent_session_id'],
        'agent_id': token_data['agent_id'],
        'project_id': project_info['id'],
        'path': body['path'],
        'method': body['method'],
        'status_code': body['status_code'],
        'latency_ms': body['latency_ms'],
    }
    for field in OPTIONAL_FIELDS:
        if field in body:
            event_kwargs[field] = body[field]
    return BackendEvent.objects.create(**event_kwargs)