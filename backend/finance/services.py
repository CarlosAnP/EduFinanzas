import datetime
from django.utils import timezone
from django.db.models import Sum
from .models import Transaction, Subscription, Credit, CategoryBudget
from users.models import Notification

def add_months(sourcedate, months):
    """
    Suma meses de manera segura a un objeto date/datetime.date puro.
    """
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, [31,
        29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28,
        31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month-1])
    return datetime.date(year, month, day)

def process_recurring_payments(user):
    """
    Evalúa y procesa las suscripciones y créditos vencidos de un usuario en tiempo real.
    Crea transacciones de gastos (gasto) y actualiza sus estados correspondientes.
    """
    today = timezone.localdate()
    transactions_created = False

    # 1. Procesar Suscripciones Activas Vencidas (next_billing_date <= today)
    due_subscriptions = Subscription.objects.filter(
        user=user,
        is_active=True,
        next_billing_date__lte=today
    )

    for sub in due_subscriptions:
        # Registrar el gasto de la suscripción
        Transaction.objects.create(
            user=user,
            transaction_type='gasto',
            amount=sub.amount,
            category=sub.category,
            description=f"Pago recurrente: {sub.name}",
            date=sub.next_billing_date
        )
        transactions_created = True

        # Avanzar fecha de próximo cobro
        current_date = sub.next_billing_date
        if sub.frequency == 'weekly':
            sub.next_billing_date = current_date + datetime.timedelta(weeks=1)
        elif sub.frequency == 'yearly':
            sub.next_billing_date = add_months(current_date, 12)
        else: # monthly
            sub.next_billing_date = add_months(current_date, 1)
        
        sub.save()

    # 2. Procesar Créditos Activos Vencidos (next_payment_date <= today)
    due_credits = Credit.objects.filter(
        user=user,
        is_active=True,
        next_payment_date__lte=today
    )

    for credit in due_credits:
        # Registrar el gasto de la cuota del crédito
        installment_num = credit.paid_installments + 1
        Transaction.objects.create(
            user=user,
            transaction_type='gasto',
            amount=credit.installment_amount,
            category=credit.category,
            description=f"Pago cuota {installment_num}/{credit.total_installments} - Crédito: {credit.name}",
            date=credit.next_payment_date
        )
        transactions_created = True

        # Actualizar datos del crédito
        credit.paid_installments += 1
        credit.remaining_amount = max(0, credit.remaining_amount - credit.installment_amount)

        # Si ya se cubrieron todas las cuotas o se amortizó la deuda por completo, se desactiva
        if credit.paid_installments >= credit.total_installments or credit.remaining_amount <= 0:
            credit.is_active = False
            credit.remaining_amount = 0
            credit.next_payment_date = None
        else:
            # Avanzar la fecha de la cuota por 1 mes
            credit.next_payment_date = add_months(credit.next_payment_date, 1)

        credit.save()

    # 3. Disparar evaluación de retos/misiones si hubo alguna transacción registrada
    if transactions_created:
        try:
            from education.services import evaluate_user_challenges
            evaluate_user_challenges(
                user,
                trigger_hints=[
                    'register_transactions', 
                    'daily_transaction', 
                    'savings_rate_10', 
                    'savings_rate_20', 
                    'no_small_expenses_7'
                ]
            )
        except Exception:
            pass

    # 4. Procesar y evaluar alertas de vencimientos de créditos, suscripciones y gastos mensuales
    try:
        check_and_create_financial_alerts(user)
    except Exception:
        pass

    return transactions_created

def check_and_create_financial_alerts(user):
    """
    Evalúa alertas financieras para un usuario:
    1. Créditos próximos (cuotas que vencen en <= 3 días).
    2. Suscripciones próximas (renovaciones en <= 3 días).
    3. Relación de gastos mensuales alta (gastos del mes >= 85% de ingresos del mes).
    Aplica controles anti-spam estrictos.
    """
    today = timezone.localdate()

    # 1. Créditos Próximos (vencimiento <= 3 días)
    active_credits = Credit.objects.filter(user=user, is_active=True, next_payment_date__isnull=False)
    for credit in active_credits:
        days_left = (credit.next_payment_date - today).days
        if 0 <= days_left <= 3:
            # Check anti-spam: already notified for this payment date?
            notif_exists = Notification.objects.filter(
                user=user,
                type='warning',
                title="Vencimiento de Crédito Próximo",
                message__contains=credit.name
            ).filter(message__contains=str(credit.next_payment_date)).exists()
            
            if not notif_exists:
                Notification.objects.create(
                    user=user,
                    type='warning',
                    title="Vencimiento de Crédito Próximo",
                    message=f"Se aproxima el pago de la cuota de tu crédito '{credit.name}' el próximo {credit.next_payment_date} por un valor de ${credit.installment_amount}."
                )

    # 2. Suscripciones Próximas (vencimiento <= 3 días)
    active_subs = Subscription.objects.filter(user=user, is_active=True, next_billing_date__isnull=False)
    for sub in active_subs:
        days_left = (sub.next_billing_date - today).days
        if 0 <= days_left <= 3:
            # Check anti-spam: already notified for this billing date?
            notif_exists = Notification.objects.filter(
                user=user,
                type='warning',
                title="Vencimiento de Suscripción Próximo",
                message__contains=sub.name
            ).filter(message__contains=str(sub.next_billing_date)).exists()
            
            if not notif_exists:
                Notification.objects.create(
                    user=user,
                    type='warning',
                    title="Vencimiento de Suscripción Próximo",
                    message=f"Se aproxima la renovación de tu suscripción '{sub.name}' el próximo {sub.next_billing_date} por un valor de ${sub.amount}."
                )

    # 3. Relación de gastos mensuales alta (gastos del mes >= 85% de ingresos del mes)
    income = Transaction.objects.filter(
        user=user,
        transaction_type='ingreso',
        date__year=today.year,
        date__month=today.month
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    expenses = Transaction.objects.filter(
        user=user,
        transaction_type='gasto',
        date__year=today.year,
        date__month=today.month
    ).aggregate(total=Sum('amount'))['total'] or 0

    if income > 0:
        ratio = expenses / income
        if ratio >= 0.85:
            # Anti-spam check: one alert per month
            month_year_str = f"{today.month}/{today.year}"
            notif_exists = Notification.objects.filter(
                user=user,
                type='warning',
                title="¡Alerta de Gastos Elevados!",
                message__contains=month_year_str
            ).exists()
            
            if not notif_exists:
                percentage = int(ratio * 100)
                Notification.objects.create(
                    user=user,
                    type='warning',
                    title="¡Alerta de Gastos Elevados!",
                    message=f"Has gastado el {percentage}% de tus ingresos de este mes ({month_year_str}). Te recomendamos revisar tu presupuesto y evitar gastos hormiga."
                )

def evaluate_budget_alerts(user, category):
    """
    Evalúa si los gastos acumulados en una categoría en el mes corriente superan
    el 75% o el 100% de su presupuesto establecido, y crea las notificaciones respectivas.
    """
    today = timezone.localdate()
    budget_obj = CategoryBudget.objects.filter(user=user, category=category).first()
    if not budget_obj or budget_obj.budget <= 0:
        return

    # Total spent in category this month
    spent = Transaction.objects.filter(
        user=user,
        transaction_type='gasto',
        category=category,
        date__year=today.year,
        date__month=today.month
    ).aggregate(total=Sum('amount'))['total'] or 0

    ratio = spent / budget_obj.budget
    category_display = dict(Transaction.CATEGORY_CHOICES).get(category, category)
    month_year_str = f"{today.month}/{today.year}"

    # 1. 100% threshold
    if ratio >= 1.0:
        # Check if 100% notification already exists for this category/month
        notif_exists = Notification.objects.filter(
            user=user,
            type='error',
            title=f"Presupuesto Excedido: {category_display}",
            message__contains=month_year_str
        ).exists()
        
        if not notif_exists:
            Notification.objects.create(
                user=user,
                type='error',
                title=f"Presupuesto Excedido: {category_display}",
                message=f"Has alcanzado o superado el 100% de tu presupuesto para {category_display} este mes. Has gastado ${spent} de un límite de ${budget_obj.budget} ({month_year_str})."
            )
            
    # 2. 75% threshold
    elif ratio >= 0.75:
        # Check if 75% notification already exists for this category/month
        notif_exists = Notification.objects.filter(
            user=user,
            type='warning',
            title=f"Presupuesto al Límite: {category_display}",
            message__contains=month_year_str
        ).exists()
        
        if not notif_exists:
            percentage = int(ratio * 100)
            Notification.objects.create(
                user=user,
                type='warning',
                title=f"Presupuesto al Límite: {category_display}",
                message=f"Has gastado el {percentage}% de tu presupuesto para {category_display} este mes (${spent} de ${budget_obj.budget}) ({month_year_str})."
            )
