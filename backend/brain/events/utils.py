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

def validate_agent_key(agent_key):
    """
    Validates an agent key by calling the uasam agent auth verify endpoint.
    Returns agent_id and project_id on success, None on failure.
    """
    try:
        uasam_url = settings.UASAM_BASE_URL
        endpoint = f"{uasam_url}/api/agent/v1/auth/verify/"
        
        headers = {
            'X-OTAS-AGENT-KEY': agent_key,
        }
        
        response = requests.post(endpoint, headers=headers, json={}, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 1:
                agent_data = data.get('response', {})
                return {
                    'agent_id': agent_data.get('agent', {}).get('id'),
                    'project_id': agent_data.get('project_id'),
                    'agent_name': agent_data.get('agent', {}).get('name'),
                    'provider': agent_data.get('agent', {}).get('provider'),
                }
        
        return None
    
    except (requests.RequestException, Exception):
        return None

