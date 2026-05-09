"""
URL configuration for core project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/finance/', include('finance.urls')),
    path('api/education/', include('education.urls')),
]
