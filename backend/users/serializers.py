from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import OnboardingProfile, Notification

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'university', 'career', 'semester', 'streak', 'points', 'is_staff', 'date_joined')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name')

    def validate_email(self, value):
        domain = value.split('@')[-1].lower()
        if not (domain.endswith('.edu') or domain.endswith('.edu.co')):
            raise serializers.ValidationError("Solo se permiten correos institucionales con dominio .edu o .edu.co")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class OnboardingProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingProfile
        fields = ('id', 'monthly_income_level', 'financial_knowledge', 'main_financial_goal', 'completed_at')
        read_only_fields = ('completed_at',)

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'type', 'title', 'message', 'date', 'is_read')
        read_only_fields = ('date',)

from .models import ContactMessage
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ('id', 'name', 'email', 'message', 'created_at')
        read_only_fields = ('created_at',)
