import datetime
from django.utils import timezone
from .models import Transaction, Subscription, Credit

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

    return transactions_created
