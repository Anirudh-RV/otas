from django.contrib import admin
from .models import Agent, AgentKey, AgentSession


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    pass


@admin.register(AgentKey)
class AgentKeyAdmin(admin.ModelAdmin):
    pass


@admin.register(AgentSession)
class AgentSessionAdmin(admin.ModelAdmin):
    pass