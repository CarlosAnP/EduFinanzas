from django.contrib import admin
from .models import Challenge


@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    """Admin para retos educativos."""
    list_display = ('title', 'difficulty', 'reward_points', 'is_active', 'created_at')
    list_filter = ('difficulty', 'is_active')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)
