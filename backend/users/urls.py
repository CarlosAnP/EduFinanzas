from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserProfileView,
    OnboardingProfileView, NotificationListView, ContactMessageCreateView,
    AdminUserListView, AdminMessageListView, ping_view
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile & Features
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('onboarding/', OnboardingProfileView.as_view(), name='onboarding'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    
    # Public
    path('contact/', ContactMessageCreateView.as_view(), name='contact_message'),
    path('ping/', ping_view, name='ping'),
    
    # Admin
    path('admin/users/', AdminUserListView.as_view(), name='admin_users'),
    path('admin/messages/', AdminMessageListView.as_view(), name='admin_messages'),
]
