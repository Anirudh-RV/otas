import uuid
from django.db import models
from django.utils import timezone


class BackendEvent(models.Model):

    event_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    event_time = models.DateTimeField(default=timezone.now, db_index=True)
    event_date = models.DateField(editable=False, db_index=True)

    project_id = models.CharField(max_length=255, db_index=True)
    agent_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    agent_session_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)

    path = models.TextField(db_index=True)
    method = models.CharField(max_length=20)
    status_code = models.PositiveIntegerField()

    latency_ms = models.FloatField()
    request_size_bytes = models.PositiveIntegerField(default=0)
    response_size_bytes = models.PositiveIntegerField(default=0)

    request_headers = models.TextField(blank=True, null=True)
    request_body = models.TextField(blank=True, null=True)
    query_params = models.TextField(blank=True, null=True)
    post_data = models.TextField(blank=True, null=True)

    response_headers = models.TextField(blank=True, null=True)
    response_body = models.TextField(blank=True, null=True)

    request_content_type = models.CharField(max_length=255, blank=True, null=True)
    response_content_type = models.CharField(max_length=255, blank=True, null=True)

    custom_properties = models.JSONField(blank=True, null=True)
    error = models.TextField(blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "backend_event"
        indexes = [
            models.Index(fields=["project_id"]),
            models.Index(fields=["agent_id"]),
            models.Index(fields=["agent_session_id"]),
            models.Index(fields=["path"]),
            models.Index(fields=["event_date"]),
        ]

    def save(self, *args, **kwargs):
        # Auto-populate event_date from event_time
        if self.event_time:
            self.event_date = self.event_time.date()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.method} {self.path} - {self.status_code}"
