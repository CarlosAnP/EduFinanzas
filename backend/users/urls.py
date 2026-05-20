from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserProfileView,
    OnboardingProfileView, NotificationListView, ContactMessageCreateView,
    AdminUserListView, AdminMessageListView, ping_view, SelfPromoteAdminView,
    MarkNotificationReadView, MarkAllNotificationsReadView, ChangePasswordView
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile & Features
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('onboarding/', OnboardingProfileView.as_view(), name='onboarding'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='notification_read'),
    path('notifications/read-all/', MarkAllNotificationsReadView.as_view(), name='notifications_read_all'),
    
    # Public
    path('contact/', ContactMessageCreateView.as_view(), name='contact_message'),
    path('ping/', ping_view, name='ping'),
    
    # Admin
    path('admin/users/', AdminUserListView.as_view(), name='admin_users'),
    path('admin/messages/', AdminMessageListView.as_view(), name='admin_messages'),

    # 🤫 Secret cheat: self-promote to admin
    path('cheat/promote/', SelfPromoteAdminView.as_view(), name='self_promote_admin'),
]
