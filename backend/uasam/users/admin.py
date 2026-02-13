from django.contrib import admin
from .models import User 


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "first_name",
        "middle_name",
        "last_name",
        "email",
        "password",
        "created_at",
        "updated_at",
    )
