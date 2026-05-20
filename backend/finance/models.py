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


class CategoryBudget(models.Model):
    """
    Modelo para establecer el presupuesto mensual por categoría.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='category_budgets',
        verbose_name='usuario'
    )
    category = models.CharField(
        'categoría',
        max_length=20,
        choices=Transaction.CATEGORY_CHOICES
    )
    budget = models.DecimalField(
        'presupuesto',
        max_digits=12,
        decimal_places=2,
        default=0
    )
    color = models.CharField('color', max_length=20, default='blue')

    class Meta:
        verbose_name = 'Presupuesto de Categoría'
        verbose_name_plural = 'Presupuestos de Categorías'
        unique_together = ('user', 'category')

    def __str__(self):
        return f'{self.get_category_display()} - {self.budget} ({self.user.email})'

class Subscription(models.Model):
    """
    Modelo para suscripciones o transacciones recurrentes.
    """
    FREQUENCY_CHOICES = [
        ('weekly', 'Semanal'),
        ('monthly', 'Mensual'),
        ('yearly', 'Anual'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscriptions',
        verbose_name='usuario'
    )
    name = models.CharField('nombre', max_length=200)
    amount = models.DecimalField('monto', max_digits=12, decimal_places=2)
    category = models.CharField('categoría', max_length=20, choices=Transaction.CATEGORY_CHOICES, default='entretenimiento')
    frequency = models.CharField('frecuencia', max_length=10, choices=FREQUENCY_CHOICES, default='monthly')
    start_date = models.DateField('fecha de inicio')
    next_billing_date = models.DateField('próxima fecha de cobro', null=True, blank=True)
    is_active = models.BooleanField('activa', default=True)
    created_at = models.DateTimeField('fecha de creación', auto_now_add=True)

    class Meta:
        verbose_name = 'Suscripción'
        verbose_name_plural = 'Suscripciones'
        ordering = ['next_billing_date']

    def __str__(self):
        return f'{self.name} - ${self.amount} ({self.get_frequency_display()})'


class Credit(models.Model):
    """
    Modelo para representar créditos o préstamos del estudiante.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='credits',
        verbose_name='usuario'
    )
    name = models.CharField('nombre del crédito', max_length=200)
    total_amount = models.DecimalField('monto total prestado', max_digits=12, decimal_places=2)
    remaining_amount = models.DecimalField('saldo pendiente', max_digits=12, decimal_places=2)
    installment_amount = models.DecimalField('valor de la cuota', max_digits=12, decimal_places=2)
    total_installments = models.IntegerField('cuotas totales')
    paid_installments = models.IntegerField('cuotas pagadas', default=0)
    interest_rate = models.DecimalField('tasa de interés mensual (%)', max_digits=5, decimal_places=2, default=0.0)
    start_date = models.DateField('fecha de inicio')
    next_payment_date = models.DateField('próxima fecha de pago', null=True, blank=True)
    category = models.CharField('categoría', max_length=20, choices=Transaction.CATEGORY_CHOICES, default='otro')
    is_active = models.BooleanField('activo', default=True)
    created_at = models.DateTimeField('fecha de creación', auto_now_add=True)

    class Meta:
        verbose_name = 'Crédito'
        verbose_name_plural = 'Créditos'
        ordering = ['next_payment_date']

    def __str__(self):
        return f'{self.name} - Cuota: ${self.installment_amount} ({self.paid_installments}/{self.total_installments})'

