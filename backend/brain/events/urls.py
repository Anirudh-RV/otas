from django.urls import path
from .views import (
    BackendEventCaptureView,
    AgentEventCaptureView,
    AgentPathTimeseriesView,
    AgentSessionEventsView,
    AgentLatencyPercentilesView,
    AgentErrorCountView,
)

urlpatterns = [
    path('api/v1/backend/log/sdk/', BackendEventCaptureView.as_view(), name='backend-sdk-event-capture'),
    path('api/v1/backend/log/agent/', AgentEventCaptureView.as_view(), name='agent-event-capture'),
    path("api/v1/agent/path-timeseries/", AgentPathTimeseriesView.as_view(), name="agent-path-timeseries"),
    path(
        "api/v1/agent/session/events/",
        AgentSessionEventsView.as_view(),
        name="agent-session-events",
    ),
    path("api/v1/agent/latency-percentiles/", AgentLatencyPercentilesView.as_view(), name="agent-latency-percentiles"),
    path("api/v1/agent/error-count/", AgentErrorCountView.as_view(), name="agent-error-count"),
]
