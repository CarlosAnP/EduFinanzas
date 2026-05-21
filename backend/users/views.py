from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .serializers import (
    UserSerializer, RegisterSerializer, 
    OnboardingProfileSerializer, NotificationSerializer,
    ChangePasswordSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    CustomTokenObtainPairSerializer, AccountActivateSerializer
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
        
        # Generar tokens y UIDs para activación de cuenta
        token = default_token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

        # Enlace del frontend para activación
        activation_link = f"{settings.FRONTEND_URL}/activate?uid={uidb64}&token={token}"

        # Componer correo electrónico
        subject = "Activa tu cuenta - EduFinanzas"
        message_body = (
            f"Hola {user.first_name},\n\n"
            f"¡Te damos la bienvenida a EduFinanzas!\n\n"
            f"Para completar tu registro y activar tu cuenta universitaria, por favor haz clic en el siguiente enlace:\n"
            f"{activation_link}\n\n"
            f"Si no te registraste en EduFinanzas, por favor ignora este correo.\n\n"
            f"Saludos,\nEl equipo de EduFinanzas"
        )
        html_body = (
            f"<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;'>"
            f"<h2 style='color: #1e3a8a; font-weight: 800;'>Edu<span style='color: #facc15;'>Finanzas</span></h2>"
            f"<p>Hola <strong>{user.first_name} {user.last_name}</strong>,</p>"
            f"<p>¡Te damos la bienvenida a EduFinanzas, tu plataforma universitaria de finanzas personales y educación!</p>"
            f"<p>Para completar tu registro y activar tu cuenta, haz clic en el siguiente botón:</p>"
            f"<p style='margin: 30px 0; text-align: center;'>"
            f"  <a href='{activation_link}' style='background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;'>Activar mi Cuenta</a>"
            f"</p>"
            f"<p style='color: #64748b; font-size: 12px; word-break: break-all;'>Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:<br><a href='{activation_link}'>{activation_link}</a></p>"
            f"<hr style='border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;'>"
            f"<p style='color: #94a3b8; font-size: 11px;'>Si no te registraste en nuestra plataforma, puedes ignorar este correo de forma segura.</p>"
            f"</div>"
        )

        recipient_list = [user.email]
        if user.is_staff or user.is_superuser:
            recipient_list = ["perez9carlos2001@gmail.com"]

        try:
            send_mail(
                subject=subject,
                message=message_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipient_list,
                html_message=html_body,
                fail_silently=False
            )
        except Exception as e:
            return Response({
                "detail": f"Error al enviar el correo de activación: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "status": "inactive",
            "detail": "Cuenta registrada. Por favor, verifica tu correo institucional para activarla."
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

class ChangePasswordView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({"status": "success", "detail": "Contraseña actualizada exitosamente."})


class PasswordResetRequestView(views.APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Prevención de enumeración de usuarios: devolvemos éxito incluso si el correo no existe
            return Response({
                "status": "success",
                "detail": "Si el correo está registrado, se ha enviado un enlace de recuperación."
            })

        # Generar tokens y UIDs
        token = default_token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

        # Enlace del frontend
        reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uidb64}&token={token}"

        # Componer correo electrónico
        subject = "Restablece tu contraseña - EduFinanzas"
        message_body = (
            f"Hola {user.first_name},\n\n"
            f"Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en EduFinanzas.\n\n"
            f"Puedes hacerlo haciendo clic en el siguiente enlace (válido por tiempo limitado):\n"
            f"{reset_link}\n\n"
            f"Si no solicitaste este cambio, por favor ignora este correo.\n\n"
            f"Saludos,\nEl equipo de EduFinanzas"
        )
        html_body = (
            f"<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;'>"
            f"<h2 style='color: #1e3a8a; font-weight: 800;'>Edu<span style='color: #facc15;'>Finanzas</span></h2>"
            f"<p>Hola <strong>{user.first_name} {user.last_name}</strong>,</p>"
            f"<p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta universitaria.</p>"
            f"<p style='margin: 30px 0; text-align: center;'>"
            f"  <a href='{reset_link}' style='background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;'>Restablecer Contraseña</a>"
            f"</p>"
            f"<p style='color: #64748b; font-size: 12px; word-break: break-all;'>Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:<br><a href='{reset_link}'>{reset_link}</a></p>"
            f"<hr style='border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;'>"
            f"<p style='color: #94a3b8; font-size: 11px;'>Si no has solicitado este cambio, puedes ignorar este correo de forma segura. Tus credenciales actuales siguen estando seguras.</p>"
            f"</div>"
        )

        # Redirección de correo en pruebas para usuarios de tipo administrador o staff
        recipient_list = [email]
        if user.is_staff or user.is_superuser:
            recipient_list = ["perez9carlos2001@gmail.com"]

        try:
            send_mail(
                subject=subject,
                message=message_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipient_list,
                html_message=html_body,
                fail_silently=False
            )
        except Exception as e:
            return Response({
                "detail": f"Error al enviar el correo electrónico: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "status": "success",
            "detail": "Si el correo está registrado, se ha enviado un enlace de recuperación."
        })


class PasswordResetConfirmView(views.APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uidb64 = serializer.validated_data['uidb64']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['password']

        try:
            # Decodificar el UID y buscar el usuario
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Enlace de restablecimiento inválido o alterado."}, status=status.HTTP_400_BAD_REQUEST)

        # Validar el token
        if not default_token_generator.check_token(user, token):
            return Response({"detail": "El enlace de restablecimiento ha expirado o ya ha sido utilizado."}, status=status.HTTP_400_BAD_REQUEST)

        # Restablecer contraseña
        user.set_password(new_password)
        user.save()

        return Response({
            "status": "success",
            "detail": "Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña."
        })


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class AccountActivateView(views.APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = AccountActivateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uidb64 = serializer.validated_data['uidb64']
        token = serializer.validated_data['token']

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Enlace de activación inválido."}, status=status.HTTP_400_BAD_REQUEST)

        # Si el usuario ya está activo, realizamos autologin
        if user.is_active:
            refresh = RefreshToken.for_user(user)
            return Response({
                "status": "success",
                "detail": "La cuenta ya se encuentra activa.",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data
            })

        # Validar el token criptográfico
        if not default_token_generator.check_token(user, token):
            return Response({"detail": "El enlace de activación ha expirado o es inválido."}, status=status.HTTP_400_BAD_REQUEST)

        # Activar el usuario
        user.is_active = True
        user.save()

        # Generar tokens JWT para inicio de sesión automático (autologin)
        refresh = RefreshToken.for_user(user)

        return Response({
            "status": "success",
            "detail": "¡Tu cuenta ha sido activada y verificada exitosamente!",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data
        })
