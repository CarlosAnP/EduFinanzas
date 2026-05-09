from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone


def validate_edu_email(value):
    """Validates that the email domain ends with .edu or .edu.co"""
    domain = value.split('@')[-1].lower()
    if not (domain.endswith('.edu') or domain.endswith('.edu.co')):
        raise ValidationError(
            'Solo se permiten correos institucionales con dominio .edu o .edu.co'
        )


class CustomUserManager(BaseUserManager):
    """Custom manager for CustomUser where email is the unique identifier."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El correo electrónico es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Modelo de usuario personalizado que utiliza el correo electrónico
    como identificador principal en lugar del username.
    """
    email = models.EmailField(
        'correo electrónico',
        unique=True,
        validators=[validate_edu_email],
        help_text='Debe ser un correo institucional (.edu)'
    )
    first_name = models.CharField('nombres', max_length=150, blank=True)
    last_name = models.CharField('apellidos', max_length=150, blank=True)
    university = models.CharField('universidad', max_length=200, blank=True)
    career = models.CharField('carrera', max_length=200, blank=True)
    semester = models.PositiveSmallIntegerField('semestre', null=True, blank=True)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField('fecha de registro', default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()


class OnboardingProfile(models.Model):
    """
    Modelo para almacenar las respuestas de las 3 preguntas iniciales
    del onboarding del usuario.
    """
    INCOME_LEVEL_CHOICES = [
        ('bajo', 'Menos de $500.000'),
        ('medio', '$500.000 - $1.500.000'),
        ('alto', 'Más de $1.500.000'),
    ]

    FINANCIAL_KNOWLEDGE_CHOICES = [
        ('principiante', 'Principiante'),
        ('intermedio', 'Intermedio'),
        ('avanzado', 'Avanzado'),
    ]

    MAIN_GOAL_CHOICES = [
        ('ahorrar', 'Aprender a ahorrar'),
        ('deudas', 'Salir de deudas'),
        ('presupuesto', 'Controlar mi presupuesto'),
        ('invertir', 'Empezar a invertir'),
    ]

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='onboarding_profile',
        verbose_name='usuario'
    )
    monthly_income_level = models.CharField(
        'nivel de ingresos mensual',
        max_length=10,
        choices=INCOME_LEVEL_CHOICES
    )
    financial_knowledge = models.CharField(
        'nivel de conocimiento financiero',
        max_length=15,
        choices=FINANCIAL_KNOWLEDGE_CHOICES
    )
    main_financial_goal = models.CharField(
        'objetivo financiero principal',
        max_length=15,
        choices=MAIN_GOAL_CHOICES
    )
    completed_at = models.DateTimeField('fecha de completado', auto_now_add=True)

    class Meta:
        verbose_name = 'Perfil de Onboarding'
        verbose_name_plural = 'Perfiles de Onboarding'

    def __str__(self):
        return f'Onboarding de {self.user.email}'
