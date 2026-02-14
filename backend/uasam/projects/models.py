# Create your models here.
import uuid
import secrets
from django.db import models
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from users.models import User


class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)                 # spec said UUID for NAME but treat as human string
    description = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_projects')

    class Meta:
        db_table = 'project'
        indexes = [
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.name} ({self.id})"


class UserProjectMapping(models.Model):
    # PRIVILEGE: 1 = Admin, 2 = Member
    PRIVILEGE_ADMIN = 1
    PRIVILEGE_MEMBER = 2
    PRIVILEGE_CHOICES = (
        (PRIVILEGE_ADMIN, 'Admin'),
        (PRIVILEGE_MEMBER, 'Member'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project_mappings')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='user_mappings')
    privilege = models.PositiveSmallIntegerField(choices=PRIVILEGE_CHOICES, default=PRIVILEGE_MEMBER)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'user_project_mapping'
        unique_together = ('user', 'project')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['project']),
        ]

    def __str__(self):
        return f"{self.user_id} -> {self.project_id} ({self.privilege})"


class BackendAPIKey(models.Model):
    """
    Backend SDK API Key model for project authentication.
    Keys are hashed in the database for security.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prefix = models.CharField(max_length=255, db_index=True)  # Key prefix for identification
    hashed_key = models.TextField()  # Hashed full key
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    last_used_at = models.DateTimeField(blank=True, null=True)
    revoked_at = models.DateTimeField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'backend_api_keys'
        indexes = [
            models.Index(fields=['project_id']),
            models.Index(fields=['prefix']),
            models.Index(fields=['active']),
        ]

    def __str__(self):
        return f"{self.prefix} - {self.project.name}"

    @staticmethod
    def generate_key():
        """
        Generate a new API key with prefix and secret.
        Format: otas_<prefix>_<secret>
        Returns: (full_key, prefix)
        """
        prefix = secrets.token_urlsafe(8)
        secret = secrets.token_urlsafe(32)
        full_key = f"otas_{prefix}_{secret}"
        return full_key, prefix

    def hash_key(self, full_key):
        """Hash and store the full API key."""
        self.hashed_key = make_password(full_key)

    def verify_key(self, full_key):
        """Verify if a given key matches the hashed key."""
        if self.revoked_at or not self.active:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return check_password(full_key, self.hashed_key)
