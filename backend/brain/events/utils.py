import jwt
from django.conf import settings


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
