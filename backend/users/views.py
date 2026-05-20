from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer, RegisterSerializer, 
    OnboardingProfileSerializer, NotificationSerializer
)
from .models import OnboardingProfile, Notification

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class OnboardingProfileView(generics.CreateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = OnboardingProfileSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    def create(self, request, *args, **kwargs):
        # Prevent multiple onboarding profiles
        if hasattr(request.user, 'onboarding_profile'):
            return Response(
                {"detail": "El usuario ya ha completado el onboarding."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)

class NotificationListView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class MarkNotificationReadView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save(update_fields=['is_read'])
            return Response({"status": "success", "detail": "Notificación marcada como leída."})
        except Notification.DoesNotExist:
            return Response({"detail": "Notificación no encontrada."}, status=status.HTTP_404_NOT_FOUND)

class MarkAllNotificationsReadView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "success", "detail": "Todas las notificaciones han sido marcadas como leídas."})

from .models import ContactMessage
from .serializers import ContactMessageSerializer
class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = ContactMessageSerializer

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = (IsAuthenticated, IsAdminUser)
    serializer_class = UserSerializer

class AdminMessageListView(generics.ListAPIView):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    permission_classes = (IsAuthenticated, IsAdminUser)
    serializer_class = ContactMessageSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def ping_view(request):
    return Response({"status": "ok", "message": "Server is awake"})


class SelfPromoteAdminView(views.APIView):
    """
    🤫 Secret cheat endpoint. Promotes the currently authenticated user to admin/staff.
    This is intentional for demo/free-tier deployments where shell access is unavailable.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        SECRET_PHRASE = request.data.get('phrase', '')
        if SECRET_PHRASE != 'konami-admin-2025':
            return Response({'detail': 'Frase secreta incorrecta.'}, status=status.HTTP_403_FORBIDDEN)

        user = request.user
        user.is_staff = True
        user.is_superuser = True
        user.save(update_fields=['is_staff', 'is_superuser'])

        return Response({
            'detail': '¡Eres admin ahora! Recarga la página.',
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        })
