from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, OnboardingProfile


class OnboardingProfileInline(admin.StackedInline):
    model = OnboardingProfile
    can_delete = False
    verbose_name_plural = 'Perfil de Onboarding'


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """Admin para el modelo de usuario personalizado."""
    model = CustomUser
    list_display = ('email', 'first_name', 'last_name', 'university', 'is_active', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'university')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    inlines = [OnboardingProfileInline]

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información personal', {'fields': ('first_name', 'last_name', 'university', 'career', 'semester')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )


@admin.register(OnboardingProfile)
class OnboardingProfileAdmin(admin.ModelAdmin):
    """Admin para perfiles de onboarding - Métricas de Impacto."""
    list_display = ('user', 'monthly_income_level', 'financial_knowledge', 'main_financial_goal', 'completed_at')
    list_filter = ('monthly_income_level', 'financial_knowledge', 'main_financial_goal')
    search_fields = ('user__email', 'user__first_name')
    readonly_fields = ('completed_at',)
