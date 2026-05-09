from django.contrib import admin
from .models import Transaction, Goal


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Admin para transacciones - Métricas de Impacto financiero."""
    list_display = ('user', 'transaction_type', 'amount', 'category', 'date', 'created_at')
    list_filter = ('transaction_type', 'category', 'date')
    search_fields = ('user__email', 'description')
    date_hierarchy = 'date'
    ordering = ('-date',)


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    """Admin para metas de ahorro - Métricas de progreso."""
    list_display = ('user', 'title', 'target_amount', 'current_amount', 'progress_percentage', 'is_completed', 'deadline')
    list_filter = ('is_completed', 'created_at')
    search_fields = ('user__email', 'title')
    readonly_fields = ('progress_percentage',)

    def progress_percentage(self, obj):
        return f'{obj.progress_percentage}%'
    progress_percentage.short_description = 'Progreso'
