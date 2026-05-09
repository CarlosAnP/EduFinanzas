from django.db import models
from django.conf import settings


class Transaction(models.Model):
    """
    Modelo para registrar ingresos y gastos del estudiante.
    """
    TRANSACTION_TYPES = [
        ('ingreso', 'Ingreso'),
        ('gasto', 'Gasto'),
    ]

    CATEGORY_CHOICES = [
        ('alimentacion', 'Alimentación'),
        ('transporte', 'Transporte'),
        ('materiales', 'Materiales académicos'),
        ('fotocopias', 'Fotocopias'),
        ('entretenimiento', 'Entretenimiento'),
        ('salud', 'Salud'),
        ('servicios', 'Servicios'),
        ('mesada', 'Mesada'),
        ('trabajo', 'Trabajo'),
        ('beca', 'Beca'),
        ('otro', 'Otro'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions',
        verbose_name='usuario'
    )
    transaction_type = models.CharField(
        'tipo de transacción',
        max_length=10,
        choices=TRANSACTION_TYPES
    )
    amount = models.DecimalField(
        'monto',
        max_digits=12,
        decimal_places=2
    )
    category = models.CharField(
        'categoría',
        max_length=20,
        choices=CATEGORY_CHOICES
    )
    description = models.CharField(
        'descripción',
        max_length=255,
        blank=True
    )
    date = models.DateField('fecha')
    created_at = models.DateTimeField('fecha de creación', auto_now_add=True)

    class Meta:
        verbose_name = 'Transacción'
        verbose_name_plural = 'Transacciones'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f'{self.get_transaction_type_display()} - ${self.amount} ({self.get_category_display()})'


class Goal(models.Model):
    """
    Modelo para metas de ahorro del estudiante.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='goals',
        verbose_name='usuario'
    )
    title = models.CharField('título', max_length=200)
    description = models.TextField('descripción', blank=True)
    target_amount = models.DecimalField(
        'monto objetivo',
        max_digits=12,
        decimal_places=2
    )
    current_amount = models.DecimalField(
        'progreso actual',
        max_digits=12,
        decimal_places=2,
        default=0
    )
    deadline = models.DateField('fecha límite', null=True, blank=True)
    is_completed = models.BooleanField('completada', default=False)
    created_at = models.DateTimeField('fecha de creación', auto_now_add=True)
    updated_at = models.DateTimeField('última actualización', auto_now=True)

    class Meta:
        verbose_name = 'Meta de Ahorro'
        verbose_name_plural = 'Metas de Ahorro'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} - {self.progress_percentage}%'

    @property
    def progress_percentage(self):
        if self.target_amount == 0:
            return 0
        return min(round((self.current_amount / self.target_amount) * 100, 1), 100)
