import uuid
import secrets

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password

User = settings.AUTH_USER_MODEL


class Agent(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	name = models.TextField()
	description = models.TextField(blank=True)
	provider = models.TextField(blank=True, db_index=True)
	project = models.ForeignKey('uasam.projects.Project', on_delete=models.CASCADE, related_name='agents')
	created_at = models.DateTimeField(default=timezone.now)
	updated_at = models.DateTimeField(auto_now=True)
	created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_agents')
	is_active = models.BooleanField(default=True)

	class Meta:
		db_table = 'agent'
		indexes = [
			models.Index(fields=['project_id']),
			models.Index(fields=['provider']),
		]

	def __str__(self):
		return f"{self.name} ({self.id})"


class AgentKey(models.Model):
	"""Agent-specific API/key model. Keys are hashed in DB for safety."""
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	prefix = models.CharField(max_length=255, db_index=True)
	hashed_key = models.TextField()
	agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='keys')
	name = models.CharField(max_length=255, blank=True, null=True)
	created_at = models.DateTimeField(default=timezone.now)
	last_used_at = models.DateTimeField(blank=True, null=True)
	revoked_at = models.DateTimeField(blank=True, null=True)
	expires_at = models.DateTimeField(blank=True, null=True)
	active = models.BooleanField(default=True, db_index=True)

	class Meta:
		db_table = 'agent_key'
		indexes = [
			models.Index(fields=['agent_id']),
			models.Index(fields=['prefix']),
			models.Index(fields=['active']),
		]

	def __str__(self):
		return f"{self.prefix} - {self.agent.name}"

	@staticmethod
	def generate_key():
		prefix = secrets.token_urlsafe(8)
		secret = secrets.token_urlsafe(32)
		full_key = f"agent_{prefix}_{secret}"
		return full_key, prefix

	def hash_key(self, full_key):
		self.hashed_key = make_password(full_key)

	def verify_key(self, full_key):
		if self.revoked_at or not self.active:
			return False
		if self.expires_at and self.expires_at < timezone.now():
			return False
		return check_password(full_key, self.hashed_key)

\
class AgentSession(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='sessions')
	agent_key = models.ForeignKey(AgentKey, on_delete=models.SET_NULL, null=True, blank=True, related_name='sessions')
	created_at = models.DateTimeField(default=timezone.now)
	meta = models.JSONField(default=dict, blank=True)

	class Meta:
		db_table = 'agent_session'
		indexes = [
			models.Index(fields=['agent_id']),
		]

	def __str__(self):
		return f"session {self.id} - agent {self.agent_id}"
