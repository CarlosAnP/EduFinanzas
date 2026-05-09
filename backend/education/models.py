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
