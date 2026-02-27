import json
import logging
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from .models import BackendEvent
from .utils import validate_agent_session_token, verify_sdk_key, build_event_and_save, validate_agent_key, build_agent_event_and_save

logger = logging.getLogger(__name__)

REQUIRED_FIELDS = ['project_id', 'path', 'method', 'status_code', 'latency_ms']

OPTIONAL_FIELDS = [
    'request_size_bytes', 'response_size_bytes',
    'request_headers', 'request_body', 'query_params', 'post_data',
    'response_headers', 'response_body',
    'request_content_type', 'response_content_type',
    'custom_properties', 'error', 'metadata',
]


@method_decorator(csrf_exempt, name='dispatch')
class BackendEventCaptureView(View):

    def post(self, request, *args, **kwargs):

        sdk_key = request.headers.get('X-OTAS-SDK-KEY')
        if not sdk_key:
            return JsonResponse({
                'status': 0,
                'status_description': 'missing_sdk_key',
            }, status=401)

        project_info = verify_sdk_key(sdk_key)
        if not project_info:
            return JsonResponse({
                'status': 0,
                'status_description': 'invalid_sdk_key',
            }, status=401)

        token = request.headers.get('X-OTAS-AGENT-SESSION-TOKEN')
        if not token:
            return JsonResponse({
                'status': 0,
                'status_description': 'missing_agent_session_token',
            }, status=401)

        token_data = validate_agent_session_token(token)
        if not token_data:
            return JsonResponse({
                'status': 0,
                'status_description': 'invalid_or_expired_token',
            }, status=401)

        try:
            body = json.loads(request.body or '{}')
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 0,
                'status_description': 'invalid_json',
            }, status=400)

        missing = [f for f in REQUIRED_FIELDS if f not in body]
        if missing:
            return JsonResponse({
                'status': 0,
                'status_description': 'missing_required_fields',
                'missing_fields': missing,
            }, status=400)

        try:
            event = build_event_and_save(token_data, project_info, body, OPTIONAL_FIELDS)
            return JsonResponse({
                'status': 1,
                'status_description': 'event_captured',
                'response': {
                    'event_id': str(event.event_id),
                },
            }, status=201)
        except Exception as e:
            logger.exception('Event capture failed')
            return JsonResponse({
                'status': 0,
                'status_description': 'event_capture_failed',
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class AgentEventCaptureView(View):
    """
    OTAS-37: Agent Log API endpoint.
    Agents use this endpoint to send logs/events directly with agent key authentication.
    
    POST /api/v1/backend/log/agent/
    Headers: X-OTAS-AGENT-KEY, X-OTAS-AGENT-SESSION-TOKEN
    """

    def post(self, request, *args, **kwargs):
        agent_key = request.headers.get('X-OTAS-AGENT-KEY')
        if not agent_key:
            return JsonResponse({
                'status': 0,
                'status_description': 'missing_agent_key',
            }, status=401)

        auth_data = validate_agent_key(agent_key)
        if not auth_data:
            return JsonResponse({
                'status': 0,
                'status_description': 'invalid_or_expired_agent_key',
            }, status=401)

        token = request.headers.get('X-OTAS-AGENT-SESSION-TOKEN')
        if not token:
            return JsonResponse({
                'status': 0,
                'status_description': 'missing_agent_session_token',
            }, status=401)

        token_data = validate_agent_session_token(token)
        if not token_data:
            return JsonResponse({
                'status': 0,
                'status_description': 'invalid_or_expired_token',
            }, status=401)

        try:
            body = json.loads(request.body or '{}')
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 0,
                'status_description': 'invalid_json',
            }, status=400)

        missing = [f for f in REQUIRED_FIELDS if f not in body]
        if missing:
            return JsonResponse({
                'status': 0,
                'status_description': 'missing_required_fields',
                'missing_fields': missing,
            }, status=400)

        try:
            event = build_agent_event_and_save(auth_data, body, OPTIONAL_FIELDS)
            return JsonResponse({
                'status': 1,
                'status_description': 'event_captured',
                'response': {
                    'event_id': str(event.event_id),
                },
            }, status=201)
        except Exception as e:
            logger.exception('Agent log capture failed')
            return JsonResponse({
                'status': 0,
                'status_description': 'event_capture_failed',
            }, status=500)
