from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import OnboardingProfile, Notification, Badge, UserBadge

User = get_user_model()

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ('id', 'name', 'description', 'icon_name', 'color')

class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    class Meta:
        model = UserBadge
        fields = ('id', 'badge', 'earned_at')

class UserSerializer(serializers.ModelSerializer):
    badges = UserBadgeSerializer(many=True, read_only=True)
    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'university', 'career', 
            'semester', 'streak', 'points', 'is_staff', 'date_joined', 'badges',
            'bio', 'institution_type', 'study_work_status', 'phone_number', 'birth_date'
        )

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, min_length=8, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "La nueva contraseña y la confirmación no coinciden."})
        
        # Opcional: Validar que no sea igual a la anterior
        if data['old_password'] == data['new_password']:
            raise serializers.ValidationError({"new_password": "La nueva contraseña debe ser diferente a la anterior."})
            
        return data

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta.")
        return value

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


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        # Normalizar el email a minúsculas
        return value.lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    password = serializers.CharField(required=True, min_length=8, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Las contraseñas no coinciden."})
        return data

