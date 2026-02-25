from django.contrib import admin
from .models import Project, UserProjectMapping, BackendAPIKey


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'is_active', 'created_at', 'domain')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('Basic Info', {
            'fields': ('id', 'name', 'description', 'domain')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Ownership', {
            'fields': ('created_by',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(UserProjectMapping)
class UserProjectMappingAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'privilege', 'is_active', 'created_at')
    list_filter = ('privilege', 'is_active', 'created_at')
    search_fields = ('user__email', 'project__name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(BackendAPIKey)
class BackendAPIKeyAdmin(admin.ModelAdmin):
    list_display = ('prefix', 'project', 'active', 'created_at', 'expires_at', 'revoked_at')
    list_filter = ('active', 'created_at', 'expires_at', 'revoked_at')
    search_fields = ('prefix', 'project__name', 'name')
    readonly_fields = ('id', 'prefix', 'hashed_key', 'created_at', 'last_used_at')
    fieldsets = (
        ('Key Info', {
            'fields': ('id', 'prefix', 'project', 'name')
        }),
        ('Security', {
            'fields': ('hashed_key', 'active'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'last_used_at', 'expires_at', 'revoked_at')
        }),
    )

    def has_add_permission(self, request):
        """Prevent direct addition from admin - use API instead."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Prevent deletion - keys should be revoked instead."""
        return False

