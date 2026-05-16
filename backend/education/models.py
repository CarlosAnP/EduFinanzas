from django.db import models


class Challenge(models.Model):
    """
    Modelo para retos educativos de finanzas personales.
    """
    DIFFICULTY_CHOICES = [
        ('facil', 'Fácil'),
        ('medio', 'Medio'),
        ('dificil', 'Difícil'),
    ]

    title = models.CharField('título', max_length=200)
    description = models.TextField('descripción')
    difficulty = models.CharField(
        'dificultad',
        max_length=10,
        choices=DIFFICULTY_CHOICES,
        default='facil'
    )
    reward_points = models.PositiveIntegerField(
        'puntos de recompensa',
        default=10
    )
    is_active = models.BooleanField('activo', default=True)
    created_at = models.DateTimeField('fecha de creación', auto_now_add=True)

    class Meta:
        verbose_name = 'Reto Educativo'
        verbose_name_plural = 'Retos Educativos'
        ordering = ['difficulty', '-created_at']

    def __str__(self):
        return f'{self.title} ({self.get_difficulty_display()}) - {self.reward_points} pts'


class UserChallenge(models.Model):
    """
    Modelo para seguir el progreso de un usuario en un reto.
    """
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('pending', 'Pendiente'),
        ('completed', 'Completado'),
    ]

    user = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.CASCADE,
        related_name='user_challenges'
    )
    challenge = models.ForeignKey(
        Challenge,
        on_delete=models.CASCADE,
        related_name='user_progress'
    )
    status = models.CharField('estado', max_length=15, choices=STATUS_CHOICES, default='pending')
    progress = models.PositiveIntegerField('progreso', default=0)
    total = models.PositiveIntegerField('total a completar', default=1)
    updated_at = models.DateTimeField('última actualización', auto_now=True)

    class Meta:
        verbose_name = 'Progreso de Reto'
        verbose_name_plural = 'Progresos de Retos'
        unique_together = ('user', 'challenge')

    def __str__(self):
        return f'{self.user.email} - {self.challenge.title} ({self.status})'


class Guide(models.Model):
    """
    Modelo para las guías de educación financiera.
    """
    title = models.CharField('título', max_length=200)
    category = models.CharField('categoría', max_length=50)
    read_time = models.CharField('tiempo de lectura', max_length=20)
    color = models.CharField('color', max_length=20, default='blue')
    content = models.TextField('contenido', blank=True)

    class Meta:
        verbose_name = 'Guía Educativa'
        verbose_name_plural = 'Guías Educativas'

    def __str__(self):
        return self.title
