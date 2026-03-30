import json
import logging
import uuid
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
from django.db.models import Count

from decorators import agent_user_auth_required
from .models import BackendEvent
from .utils import validate_agent_session_token, verify_sdk_key, build_event_and_save, validate_agent_key, build_agent_event_and_save, Percentile

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
            build_event_and_save(token_data, project_info, body, OPTIONAL_FIELDS)
            return JsonResponse({
                'status': 1,
                'status_description': 'event_captured',
                'response': {
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

        if str(token_data['agent_id']) != str(auth_data['agent_id']):
            return JsonResponse({
                'status': 0,
                'status_description': 'session_agent_mismatch',
            }, status=403)

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
            event = build_agent_event_and_save(
                auth_data,
                body,
                OPTIONAL_FIELDS,
                agent_session_id=token_data['agent_session_id'],
            )
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


@method_decorator(agent_user_auth_required, name="dispatch")
class AgentPathTimeseriesView(View):
    """
    GET /api/v1/agent/path-timeseries/

    Returns a time-series breakdown of event counts grouped by path for a
    specific agent over a given date range. Intended for rendering line graphs
    showing traffic per endpoint over time.

    Authentication:
        Requires the following headers, validated via agent_user_auth_required:
            X-OTAS-USER-TOKEN  : JWT token identifying the user
            X-OTAS-AGENT-ID    : UUID of the agent
            X-OTAS-PROJECT-ID  : UUID of the project the agent belongs to

    Query Parameters:
        start_date (str): Start of the date range in YYYY-MM-DD format (inclusive).
        end_date   (str): End of the date range in YYYY-MM-DD format (inclusive).

    Success Response (200):
        {
            "status": 1,
            "agent_id": "<agent_uuid>",
            "project_id": "<project_uuid>",
            "paths": [
                {
                    "path": "/example/api/",
                    "data": [
                        { "date": "2026-03-01", "count": 10 },
                        { "date": "2026-03-02", "count": 7 }
                    ]
                }
            ]
        }

        Notes:
            - Only dates that have at least one event are included (no zero-fill).
            - Paths are ordered alphabetically.
            - Dates within each path are ordered ascending.

    Error Responses:
        400 - missing_dates        : start_date or end_date not provided.
        400 - invalid_date_format  : Dates are not in YYYY-MM-DD format.
        400 - invalid_date_range   : start_date is after end_date.
        401 - missing_user_token   : X-OTAS-USER-TOKEN header is absent.
        400 - missing_agent_id     : X-OTAS-AGENT-ID header is absent.
        400 - missing_project_id   : X-OTAS-PROJECT-ID header is absent.
        403 - forbidden            : User does not have access to the project.
        404 - agent_not_found      : Agent does not exist or is inactive.
        503 - auth_service_timeout : UASAM auth service did not respond in time.
        503 - auth_service_error   : UASAM auth service is unreachable.
        500 - server_error         : Unexpected internal error.
    """

    def get(self, request):
        try:
            agent_id = request.auth_agent_id
            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")

            if not start_date or not end_date:
                return JsonResponse(
                    {"status": 0, "status_description": "start_date and end_date are required"},
                    status=400,
                )

            try:
                start = datetime.strptime(start_date, "%Y-%m-%d").date()
                end = datetime.strptime(end_date, "%Y-%m-%d").date()
            except ValueError:
                return JsonResponse(
                    {"status": 0, "status_description": "dates must be in YYYY-MM-DD format"},
                    status=400,
                )

            if start > end:
                return JsonResponse(
                    {"status": 0, "status_description": "start_date must be before or equal to end_date"},
                    status=400,
                )

            qs = (
                BackendEvent.objects.filter(
                    agent_id=agent_id,
                    event_date__gte=start,
                    event_date__lte=end,
                )
                .values("path", "event_date")
                .annotate(count=Count("event_id"))
                .order_by("path", "event_date")
            )

            path_map = {}
            for row in qs:
                path = row["path"]
                if path not in path_map:
                    path_map[path] = []
                path_map[path].append({
                    "date": row["event_date"].isoformat(),
                    "count": row["count"],
                })

            result = [
                {"path": path, "data": data}
                for path, data in path_map.items()
            ]

            return JsonResponse(
                {
                    "status": 1,
                    "agent_id": agent_id,
                    "project_id": request.auth_project_id,
                    "paths": result,
                },
                status=200,
            )

        except Exception:
            logger.exception("AgentPathTimeseriesView failed")
            return JsonResponse({"status": 0, "status_description": "server_error"}, status=500)


def _serialize_backend_event(ev: BackendEvent) -> dict:
    return {
        "event_id": str(ev.event_id),
        "event_time": ev.event_time.isoformat(),
        "event_date": ev.event_date.isoformat() if ev.event_date else None,
        "project_id": ev.project_id,
        "agent_id": ev.agent_id,
        "agent_session_id": ev.agent_session_id,
        "path": ev.path,
        "method": ev.method,
        "status_code": ev.status_code,
        "latency_ms": ev.latency_ms,
        "request_size_bytes": ev.request_size_bytes,
        "response_size_bytes": ev.response_size_bytes,
        "request_headers": ev.request_headers,
        "request_body": ev.request_body,
        "query_params": ev.query_params,
        "post_data": ev.post_data,
        "response_headers": ev.response_headers,
        "response_body": ev.response_body,
        "request_content_type": ev.request_content_type,
        "response_content_type": ev.response_content_type,
        "custom_properties": ev.custom_properties,
        "error": ev.error,
        "metadata": ev.metadata,
        "created_at": ev.created_at.isoformat(),
    }


@method_decorator(agent_user_auth_required, name="dispatch")
class AgentSessionEventsView(View):
    """
    GET /api/v1/agent/session/events/

    Lists BackendEvent rows for one agent session, ordered by event_time.

    Headers (via agent_user_auth_required):
        X-OTAS-USER-TOKEN, X-OTAS-AGENT-ID, X-OTAS-PROJECT-ID

    Query:
        session_id (UUID, required) — UASAM AgentSession.id / JWT agent_session_id
        limit (optional, default 200, max 500) — max rows returned
    """

    _DEFAULT_LIMIT = 200
    _MAX_LIMIT = 500

    def get(self, request):
        try:
            session_id = request.GET.get("session_id")
            if not session_id:
                return JsonResponse(
                    {"status": 0, "status_description": "session_id is required"},
                    status=400,
                )
            try:
                uuid.UUID(session_id)
            except ValueError:
                return JsonResponse(
                    {"status": 0, "status_description": "session_id must be a valid UUID"},
                    status=400,
                )

            raw_limit = request.GET.get("limit", str(self._DEFAULT_LIMIT))
            try:
                limit = int(raw_limit)
            except ValueError:
                return JsonResponse(
                    {"status": 0, "status_description": "limit must be an integer"},
                    status=400,
                )
            limit = max(1, min(limit, self._MAX_LIMIT))

            agent_id = str(request.auth_agent_id)
            project_id = str(request.auth_project_id)

            qs = (
                BackendEvent.objects.filter(
                    agent_id=agent_id,
                    project_id=project_id,
                    agent_session_id=session_id,
                )
                .order_by("event_time", "event_id")
                [:limit]
            )

            events = [_serialize_backend_event(ev) for ev in qs]

            return JsonResponse(
                {
                    "status": 1,
                    "status_description": "session_events_listed",
                    "agent_id": agent_id,
                    "project_id": project_id,
                    "session_id": session_id,
                    "count": len(events),
                    "events": events,
                },
                status=200,
            )
        except Exception:
            logger.exception("AgentSessionEventsView failed")
            return JsonResponse(
                {"status": 0, "status_description": "server_error"},
                status=500,
            )
            

@method_decorator(agent_user_auth_required, name="dispatch")
class AgentLatencyPercentilesView(View):
    """
    GET /api/v1/agent/latency-percentiles/

    Returns daily latency percentiles (p50, p95, p99) for a specific agent
    over a given date range. Intended for rendering bar/line graphs showing
    latency distribution over time.

    Authentication:
        Requires the following headers, validated via agent_user_auth_required:
            X-OTAS-USER-TOKEN  : JWT token identifying the user
            X-OTAS-AGENT-ID    : UUID of the agent
            X-OTAS-PROJECT-ID  : UUID of the project the agent belongs to

    Query Parameters:
        start_date (str): Start of the date range in YYYY-MM-DD format (inclusive).
        end_date   (str): End of the date range in YYYY-MM-DD format (inclusive).

    Success Response (200):
        {
            "status": 1,
            "agent_id": "<agent_uuid>",
            "project_id": "<project_uuid>",
            "data": [
                {
                    "date": "2026-03-26",
                    "p50": 142.3,
                    "p95": 489.1,
                    "p99": 1203.7
                },
                ...
            ]
        }

        Notes:
            - Only dates with at least one event are included (no zero-fill).
            - Dates are ordered ascending.
            - All latency values are in milliseconds, rounded to 1 decimal place.
            - Percentiles are computed using Postgres PERCENTILE_CONT (exact interpolation).

    Error Responses:
        400 - missing_dates        : start_date or end_date not provided.
        400 - invalid_date_format  : Dates are not in YYYY-MM-DD format.
        400 - invalid_date_range   : start_date is after end_date.
        401 - missing_user_token   : X-OTAS-USER-TOKEN header is absent.
        400 - missing_agent_id     : X-OTAS-AGENT-ID header is absent.
        400 - missing_project_id   : X-OTAS-PROJECT-ID header is absent.
        403 - forbidden            : User does not have access to the project.
        404 - agent_not_found      : Agent does not exist or is inactive.
        503 - auth_service_timeout : UASAM auth service did not respond in time.
        503 - auth_service_error   : UASAM auth service is unreachable.
        500 - server_error         : Unexpected internal error.
    """

    def get(self, request):
        try:
            agent_id = request.auth_agent_id
            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")

            if not start_date or not end_date:
                return JsonResponse(
                    {"status": 0, "status_description": "start_date and end_date are required"},
                    status=400,
                )

            try:
                start = datetime.strptime(start_date, "%Y-%m-%d").date()
                end = datetime.strptime(end_date, "%Y-%m-%d").date()
            except ValueError:
                return JsonResponse(
                    {"status": 0, "status_description": "dates must be in YYYY-MM-DD format"},
                    status=400,
                )

            if start > end:
                return JsonResponse(
                    {"status": 0, "status_description": "start_date must be before or equal to end_date"},
                    status=400,
                )

            rows = (
                BackendEvent.objects.filter(
                    agent_id=agent_id,
                    event_date__gte=start,
                    event_date__lte=end,
                )
                .values("event_date")
                .annotate(
                    p50=Percentile("latency_ms", 0.50),
                    p95=Percentile("latency_ms", 0.95),
                    p99=Percentile("latency_ms", 0.99),
                )
                .order_by("event_date")
            )

            data = [
                {
                    "date": row["event_date"].isoformat(),
                    "p50": round(row["p50"], 1) if row["p50"] is not None else None,
                    "p95": round(row["p95"], 1) if row["p95"] is not None else None,
                    "p99": round(row["p99"], 1) if row["p99"] is not None else None,
                }
                for row in rows
            ]

            return JsonResponse(
                {
                    "status": 1,
                    "agent_id": agent_id,
                    "project_id": request.auth_project_id,
                    "data": data,
                },
                status=200,
            )

        except Exception:
            logger.exception("AgentLatencyPercentilesView failed")
            return JsonResponse({"status": 0, "status_description": "server_error"}, status=500)
        
        
@method_decorator(agent_user_auth_required, name="dispatch")
class AgentErrorCountView(View):
    """
    GET /api/v1/agent/error-count/

    Returns a daily count of errors for a specific agent over a given date
    range. An error is any event where the error field is non-null/non-empty.
    Intended for rendering a line graph showing error rate over time.

    Authentication:
        Requires the following headers, validated via agent_user_auth_required:
            X-OTAS-USER-TOKEN  : JWT token identifying the user
            X-OTAS-AGENT-ID    : UUID of the agent
            X-OTAS-PROJECT-ID  : UUID of the project the agent belongs to

    Query Parameters:
        start_date (str): Start of the date range in YYYY-MM-DD format (inclusive).
        end_date   (str): End of the date range in YYYY-MM-DD format (inclusive).

    Success Response (200):
        {
            "status": 1,
            "agent_id": "<agent_uuid>",
            "project_id": "<project_uuid>",
            "data": [
                {
                    "date": "2026-03-26",
                    "error_count": 3
                },
                ...
            ]
        }

        Notes:
            - Only dates with at least one error are included (no zero-fill).
            - Dates are ordered ascending.
            - An error is counted when the error field is not null and not empty string.

    Error Responses:
        400 - missing_dates        : start_date or end_date not provided.
        400 - invalid_date_format  : Dates are not in YYYY-MM-DD format.
        400 - invalid_date_range   : start_date is after end_date.
        401 - missing_user_token   : X-OTAS-USER-TOKEN header is absent.
        400 - missing_agent_id     : X-OTAS-AGENT-ID header is absent.
        400 - missing_project_id   : X-OTAS-PROJECT-ID header is absent.
        403 - forbidden            : User does not have access to the project.
        404 - agent_not_found      : Agent does not exist or is inactive.
        503 - auth_service_timeout : UASAM auth service did not respond in time.
        503 - auth_service_error   : UASAM auth service is unreachable.
        500 - server_error         : Unexpected internal error.
    """

    def get(self, request):
        try:
            agent_id = request.auth_agent_id
            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")

            if not start_date or not end_date:
                return JsonResponse(
                    {"status": 0, "status_description": "start_date and end_date are required"},
                    status=400,
                )

            try:
                start = datetime.strptime(start_date, "%Y-%m-%d").date()
                end = datetime.strptime(end_date, "%Y-%m-%d").date()
            except ValueError:
                return JsonResponse(
                    {"status": 0, "status_description": "dates must be in YYYY-MM-DD format"},
                    status=400,
                )

            if start > end:
                return JsonResponse(
                    {"status": 0, "status_description": "start_date must be before or equal to end_date"},
                    status=400,
                )

            rows = (
                BackendEvent.objects.filter(
                    agent_id=agent_id,
                    event_date__gte=start,
                    event_date__lte=end,
                )
                .exclude(error__isnull=True)
                .exclude(error="")
                .values("event_date")
                .annotate(error_count=Count("event_id"))
                .order_by("event_date")
            )

            data = [
                {
                    "date": row["event_date"].isoformat(),
                    "error_count": row["error_count"],
                }
                for row in rows
            ]

            return JsonResponse(
                {
                    "status": 1,
                    "agent_id": agent_id,
                    "project_id": request.auth_project_id,
                    "data": data,
                },
                status=200,
            )

        except Exception:
            logger.exception("AgentErrorCountView failed")
            return JsonResponse({"status": 0, "status_description": "server_error"}, status=500)