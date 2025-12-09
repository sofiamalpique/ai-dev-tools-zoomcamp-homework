from django.contrib import admin

from .models import Todo


@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ("title", "resolved", "due_date", "created_at", "updated_at")
    list_filter = ("resolved", "due_date")
    search_fields = ("title", "description")
    ordering = ("resolved", "due_date", "-created_at")
