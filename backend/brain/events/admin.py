from django.contrib import admin

# Register your models here.
from .models import BackendEvent


@admin.register(BackendEvent)
class BackendEventAdmin(admin.ModelAdmin):
    ordering = ["-event_time"]
