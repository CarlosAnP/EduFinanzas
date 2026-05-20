import datetime
from django.db import transaction as db_transaction
from django.db.models import Sum
from django.utils import timezone
from .models import UserChallenge, UserGuideRead
from finance.models import Transaction, CategoryBudget, Goal, Subscription
from users.models import Notification


def _evaluate_trigger(trigger_type, user, uc):
    """
    Evalúa si un trigger se cumple. Actualiza uc.progress en su caso.
    Retorna True si el reto debe marcarse como completado.
    """
    today = datetime.date.today()
    total = uc.total

    if trigger_type == 'register_transactions':
        count = Transaction.objects.filter(user=user).count()
        uc.progress = min(count, total)
        return count >= total

    elif trigger_type == 'daily_transaction':
        has_today = Transaction.objects.filter(user=user, date=today).exists()
        if has_today:
            uc.progress = total
        return has_today

    elif trigger_type == 'set_budget':
        count = CategoryBudget.objects.filter(user=user, budget__gt=0).count()
        uc.progress = min(count, total)
        return count >= total

    elif trigger_type == 'create_goal':
        count = Goal.objects.filter(user=user).count()
        uc.progress = min(count, total)
        return count >= total

    elif trigger_type == 'fund_goal':
        # Any goal with at least one aporte (current_amount > 0)
        funded = Goal.objects.filter(user=user, current_amount__gt=0).exists()
        if funded:
            uc.progress = total
        return funded

    elif trigger_type == 'complete_quiz':
        # Evaluated directly by QuizSubmitView — here we just check progress
        return uc.progress >= total

    elif trigger_type == 'read_guide':
        count = UserGuideRead.objects.filter(user=user).count()
        uc.progress = min(count, total)
        return count >= total

    elif trigger_type == 'savings_rate_10':
        return _check_savings_rate(user, min_rate=10, uc=uc)

    elif trigger_type == 'savings_rate_20':
        return _check_savings_rate(user, min_rate=20, uc=uc)

    elif trigger_type == 'emergency_fund_100k':
        has_fund = Goal.objects.filter(user=user, current_amount__gte=100000).exists()
        if has_fund:
            uc.progress = total
        return has_fund

    elif trigger_type == 'no_small_expenses_7':
        seven_days_ago = today - datetime.timedelta(days=7)
        has_entertainment = Transaction.objects.filter(
            user=user,
            transaction_type='gasto',
            category='entretenimiento',
            date__gte=seven_days_ago
        ).exists()
        if not has_entertainment:
            uc.progress = total
        return not has_entertainment

    elif trigger_type == 'add_subscription':
        has_sub = Subscription.objects.filter(user=user).exists()
        if has_sub:
            uc.progress = total
        return has_sub

    elif trigger_type == 'streak_3':
        if user.streak >= 3:
            uc.progress = total
        return user.streak >= 3

    elif trigger_type == 'streak_7':
        if user.streak >= 7:
            uc.progress = total
        return user.streak >= 7

    return False


def _check_savings_rate(user, min_rate, uc):
    today = datetime.date.today()
    income = Transaction.objects.filter(
        user=user, transaction_type='ingreso',
        date__year=today.year, date__month=today.month
    ).aggregate(total=Sum('amount'))['total'] or 0

    expenses = Transaction.objects.filter(
        user=user, transaction_type='gasto',
        date__year=today.year, date__month=today.month
    ).aggregate(total=Sum('amount'))['total'] or 0

    if income <= 0:
        return False

    rate = ((float(income) - float(expenses)) / float(income)) * 100
    if rate >= min_rate:
        uc.progress = uc.total
    return rate >= min_rate


def evaluate_user_challenges(user, trigger_hints=None):
    """
    Evalúa el progreso del usuario en sus misiones activas.
    
    trigger_hints: lista de trigger_types a evaluar preferentemente.
                   Si es None, evalúa todos los activos.
    """
    query = UserChallenge.objects.filter(user=user, status='active').select_related('challenge')

    if trigger_hints:
        query = query.filter(challenge__trigger_type__in=trigger_hints)

    newly_completed = []

    with db_transaction.atomic():
        for uc in query:
            trigger_type = uc.challenge.trigger_type
            was_completed = _evaluate_trigger(trigger_type, user, uc)

            if was_completed and uc.status != 'completed':
                uc.status = 'completed'
                uc.progress = uc.total
                uc.completed_at = timezone.now()

                # Award points
                user.points += uc.challenge.reward_points
                newly_completed.append(uc.challenge)

            uc.save()

        if newly_completed:
            user.save(update_fields=['points'])

            # Create notification for each completed mission
            for challenge in newly_completed:
                Notification.objects.create(
                    user=user,
                    type='success',
                    title=f'¡Misión completada: {challenge.title}!',
                    message=f'Has ganado {challenge.reward_points} puntos. ¡Sigue así!'
                )

    return newly_completed  # Return list so callers can notify frontend
