from django.db import models


TRIGGER_CHOICES = [
    ('register_transactions', 'Registrar N transacciones (total)'),
    ('daily_transaction',     'Registrar una transacción hoy'),
    ('set_budget',            'Configurar presupuesto en N categorías'),
    ('create_goal',           'Crear N metas de ahorro'),
    ('fund_goal',             'Aportar a una meta de ahorro'),
    ('complete_quiz',         'Completar un quiz'),
    ('read_guide',            'Leer una guía educativa'),
    ('savings_rate_10',       'Lograr tasa de ahorro >= 10% este mes'),
    ('savings_rate_20',       'Lograr tasa de ahorro >= 20% este mes'),
    ('no_small_expenses_7',   'No tener gastos de entretenimiento por 7 días'),
    ('emergency_fund_100k',   'Tener meta con >= $100.000 aportados'),
    ('add_subscription',      'Registrar una suscripción recurrente'),
    ('streak_3',              'Mantener racha de 3 días'),
    ('streak_7',              'Mantener racha de 7 días'),
    ('manual',                'Completar manualmente'),
]


class Challenge(models.Model):
    """
    Modelo para retos/misiones educativas de finanzas personales.
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

    # Auto-completion trigger
    trigger_type = models.CharField(
        'tipo de trigger',
        max_length=30,
        choices=TRIGGER_CHOICES,
        default='manual'
    )
    trigger_total = models.PositiveIntegerField(
        'total requerido',
        default=1,
        help_text='Cantidad de veces que debe cumplirse el trigger.'
    )

    class Meta:
        verbose_name = 'Reto / Misión'
        verbose_name_plural = 'Retos / Misiones'
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
    status = models.CharField('estado', max_length=15, choices=STATUS_CHOICES, default='active')
    progress = models.PositiveIntegerField('progreso', default=0)
    total = models.PositiveIntegerField('total a completar', default=1)
    updated_at = models.DateTimeField('última actualización', auto_now=True)
    completed_at = models.DateTimeField('fecha de completado', null=True, blank=True)

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


class UserGuideRead(models.Model):
    """
    Registra qué guías ha leído cada usuario (para trigger read_guide).
    """
    user = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.CASCADE,
        related_name='guide_reads'
    )
    guide = models.ForeignKey(
        Guide,
        on_delete=models.CASCADE,
        related_name='reads'
    )
    read_at = models.DateTimeField('fecha de lectura', auto_now_add=True)

    class Meta:
        verbose_name = 'Guía Leída'
        verbose_name_plural = 'Guías Leídas'
        unique_together = ('user', 'guide')

    def __str__(self):
        return f'{self.user.email} leyó {self.guide.title}'


class Quiz(models.Model):
    guide = models.OneToOneField(Guide, on_delete=models.CASCADE, related_name='quiz')
    title = models.CharField('título', max_length=200)
    reward_points = models.PositiveIntegerField('puntos de recompensa', default=50)

    class Meta:
        verbose_name = 'Quiz'
        verbose_name_plural = 'Quizzes'

    def __str__(self):
        return f'Quiz: {self.title}'

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.CharField('pregunta', max_length=500)

    def __str__(self):
        return self.text

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField('opción', max_length=200)
    is_correct = models.BooleanField('es correcta', default=False)

    def __str__(self):
        return self.text
