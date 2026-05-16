from .models import UserChallenge
from finance.models import Transaction, CategoryBudget, Goal
from django.db import transaction

def evaluate_user_challenges(user):
    active_challenges = UserChallenge.objects.filter(user=user, status='active').select_related('challenge')
    
    with transaction.atomic():
        for uc in active_challenges:
            was_completed = False
            title = uc.challenge.title.lower()
            
            if '5 gastos' in title:
                count = Transaction.objects.filter(user=user).count()
                uc.progress = min(count, uc.total)
                if count >= uc.total:
                    was_completed = True
                    
            elif 'presupuesto' in title:
                has_budget = CategoryBudget.objects.filter(user=user).exists()
                if has_budget:
                    uc.progress = uc.total
                    was_completed = True
                    
            elif 'fondo de emergencia' in title:
                has_fund = Goal.objects.filter(user=user, current_amount__gte=100000).exists()
                if has_fund:
                    uc.progress = uc.total
                    was_completed = True
            
            elif 'ahorra el 10%' in title:
                has_goals = Goal.objects.filter(user=user).exists()
                if has_goals:
                    uc.progress = uc.total
                    was_completed = True

            elif 'gastos hormiga' in title:
                # We can complete this when they have at least 1 budget and 1 transaction
                if CategoryBudget.objects.filter(user=user).exists() and Transaction.objects.filter(user=user).exists():
                    uc.progress = uc.total
                    was_completed = True

            if was_completed and uc.status != 'completed':
                uc.status = 'completed'
                user.points += uc.challenge.reward_points
                user.save()
            
            uc.save()
