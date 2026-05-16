from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
import datetime
from .models import Transaction, Goal, CategoryBudget
from .serializers import TransactionSerializer, GoalSerializer, CategoryBudgetSerializer

class DashboardSummaryView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Calculate summary
        income = Transaction.objects.filter(user=user, transaction_type='ingreso').aggregate(total=Sum('amount'))['total'] or 0
        expenses = Transaction.objects.filter(user=user, transaction_type='gasto').aggregate(total=Sum('amount'))['total'] or 0
        balance = income - expenses
        savings_rate = round((income - expenses) / income * 100, 1) if income > 0 else 0

        # Calculate budget usage
        monthly_budget = CategoryBudget.objects.filter(user=user).aggregate(total=Sum('budget'))['total'] or 0
        budget_used = expenses 
        
        # Recent transactions
        recent_txs = Transaction.objects.filter(user=user).order_by('-date', '-created_at')[:6]
        
        # Savings Goals
        goals = Goal.objects.filter(user=user, is_completed=False)[:3]

        # Categories
        categories_data = []
        for cat_choice in Transaction.CATEGORY_CHOICES:
            cat_id = cat_choice[0]
            cat_name = cat_choice[1]
            spent = Transaction.objects.filter(user=user, transaction_type='gasto', category=cat_id).aggregate(total=Sum('amount'))['total'] or 0
            budget_obj = CategoryBudget.objects.filter(user=user, category=cat_id).first()
            budget = budget_obj.budget if budget_obj else 0
            
            if spent > 0 or budget > 0:
                categories_data.append({
                    "id": cat_id,
                    "name": cat_name,
                    "spent": spent,
                    "budget": budget,
                    "color": budget_obj.color if budget_obj else "blue"
                })

        # Calculate monthly data for the last 5 months
        today = datetime.date.today()
        monthly_data = []
        months_es = {1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun', 
                     7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic'}

        for i in range(4, -1, -1):
            m = today.month - i
            y = today.year
            if m <= 0:
                m += 12
                y -= 1
                
            ingresos_mes = Transaction.objects.filter(
                user=user, 
                transaction_type='ingreso',
                date__year=y,
                date__month=m
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            gastos_mes = Transaction.objects.filter(
                user=user, 
                transaction_type='gasto',
                date__year=y,
                date__month=m
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            monthly_data.append({
                "month": months_es[m],
                "ingresos": ingresos_mes,
                "gastos": gastos_mes
            })

        return Response({
            "financialSummary": {
                "balance": balance,
                "totalIncome": income,
                "totalExpenses": expenses,
                "savingsRate": savings_rate,
                "monthlyBudget": monthly_budget,
                "budgetUsed": budget_used
            },
            "recentTransactions": TransactionSerializer(recent_txs, many=True).data,
            "savingsGoals": GoalSerializer(goals, many=True).data,
            "categories": categories_data,
            "monthlyData": monthly_data
        })

class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        try:
            from education.services import evaluate_user_challenges
            evaluate_user_challenges(self.request.user)
        except ImportError:
            pass

from django.shortcuts import get_object_or_404
from django.db import transaction

class GoalListCreateView(generics.ListCreateAPIView):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        try:
            from education.services import evaluate_user_challenges
            evaluate_user_challenges(self.request.user)
        except ImportError:
            pass

from decimal import Decimal, InvalidOperation

class GoalAddFundsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        goal = get_object_or_404(Goal, pk=pk, user=request.user)
        amount = request.data.get('amount')
        
        try:
            amount = Decimal(str(amount))
        except (TypeError, ValueError, InvalidOperation):
            return Response({"error": "Monto inválido"}, status=status.HTTP_400_BAD_REQUEST)
            
        if amount <= 0:
            return Response({"error": "El monto debe ser mayor a 0"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            goal.current_amount += amount
            if goal.current_amount >= goal.target_amount:
                goal.is_completed = True
            goal.save()

            Transaction.objects.create(
                user=request.user,
                transaction_type='gasto',
                amount=amount,
                category='otro',
                description=f"Aporte a meta: {goal.title}",
                date=datetime.date.today()
            )
            
        try:
            from education.services import evaluate_user_challenges
            evaluate_user_challenges(request.user)
        except ImportError:
            pass

        return Response({"status": "success", "current_amount": goal.current_amount})

class CategoryBudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = CategoryBudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CategoryBudget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Update if exists, else create
        category = serializer.validated_data.get('category')
        budget_obj = CategoryBudget.objects.filter(user=self.request.user, category=category).first()
        if budget_obj:
            budget_obj.budget = serializer.validated_data.get('budget')
            budget_obj.color = serializer.validated_data.get('color', budget_obj.color)
            budget_obj.save()
        else:
            serializer.save(user=self.request.user)
            
        try:
            from education.services import evaluate_user_challenges
            evaluate_user_challenges(self.request.user)
        except ImportError:
            pass
