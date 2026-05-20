from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
import datetime
from .models import Transaction, Goal, CategoryBudget, Subscription, Credit
from .serializers import (
    TransactionSerializer, GoalSerializer, CategoryBudgetSerializer, 
    SubscriptionSerializer, CreditSerializer
)
from .services import process_recurring_payments, add_months

class DashboardSummaryView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Procesar cobros automáticos en tiempo real
        process_recurring_payments(user)

        
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

        # Subscriptions
        subscriptions = Subscription.objects.filter(user=user, is_active=True)[:3]

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
            "monthlyData": monthly_data,
            "activeSubscriptions": SubscriptionSerializer(subscriptions, many=True).data
        })

from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

class TransactionPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TransactionPagination

    def get_queryset(self):
        # Procesar cobros automáticos en tiempo real
        process_recurring_payments(self.request.user)
        queryset = Transaction.objects.filter(user=self.request.user)
        
        # Filter by type (all, income, expense)
        tx_type = self.request.query_params.get('type')
        if tx_type == 'income':
            queryset = queryset.filter(transaction_type='ingreso')
        elif tx_type == 'expense':
            queryset = queryset.filter(transaction_type='gasto')
            
        # Filter by search term
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(description__icontains=search)
            
        return queryset

    def perform_create(self, serializer):
        instance = serializer.save(user=self.request.user)
        try:
            from .services import evaluate_budget_alerts
            evaluate_budget_alerts(self.request.user, instance.category)
        except Exception:
            pass
        try:
            from education.services import evaluate_user_challenges
            evaluate_user_challenges(
                self.request.user,
                trigger_hints=['register_transactions', 'daily_transaction', 'savings_rate_10', 'savings_rate_20', 'no_small_expenses_7']
            )
        except Exception:
            pass

class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        if timezone.now() - instance.created_at > timedelta(days=2):
            raise ValidationError("No se pueden modificar movimientos registrados hace más de 2 días.")
        instance = serializer.save()
        try:
            from .services import evaluate_budget_alerts
            evaluate_budget_alerts(self.request.user, instance.category)
        except Exception:
            pass
        # Re-evaluate challenges after edit
        try:
            from education.services import evaluate_user_challenges
            evaluate_user_challenges(
                self.request.user,
                trigger_hints=['register_transactions', 'daily_transaction', 'savings_rate_10', 'savings_rate_20', 'no_small_expenses_7']
            )
        except Exception:
            pass

    def perform_destroy(self, instance):
        if timezone.now() - instance.created_at > timedelta(days=2):
            raise ValidationError("No se pueden eliminar movimientos registrados hace más de 2 días.")
        instance.delete()
        # Re-evaluate challenges after deletion
        try:
            from education.services import evaluate_user_challenges
            evaluate_user_challenges(
                self.request.user,
                trigger_hints=['register_transactions', 'daily_transaction', 'savings_rate_10', 'savings_rate_20', 'no_small_expenses_7']
            )
        except Exception:
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
            evaluate_user_challenges(
                self.request.user,
                trigger_hints=['create_goal']
            )
        except Exception:
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
            evaluate_user_challenges(
                request.user,
                trigger_hints=['fund_goal', 'emergency_fund_100k', 'register_transactions']
            )
        except Exception:
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
            evaluate_user_challenges(
                self.request.user,
                trigger_hints=['set_budget']
            )
        except Exception:
            pass

class SubscriptionListCreateView(generics.ListCreateAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        try:
            from education.services import evaluate_user_challenges
            evaluate_user_challenges(
                self.request.user,
                trigger_hints=['add_subscription']
            )
        except Exception:
            pass

class SubscriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)


class CreditListCreateView(generics.ListCreateAPIView):
    serializer_class = CreditSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        process_recurring_payments(self.request.user)
        return Credit.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        total_amount = serializer.validated_data['total_amount']
        installment_amount = serializer.validated_data['installment_amount']
        total_installments = serializer.validated_data['total_installments']
        paid_installments = serializer.validated_data.get('paid_installments', 0)
        skip_disbursement = serializer.validated_data.pop('skip_disbursement', False)
        start_date = serializer.validated_data['start_date']

        is_active = True
        if paid_installments > 0:
            remaining_amount = installment_amount * (total_installments - paid_installments)
            if remaining_amount < 0:
                remaining_amount = 0
            
            # Próxima fecha de cobro: se desplaza por las cuotas ya pagadas + 1
            next_pmt_date = add_months(start_date, paid_installments + 1)
            
            # Si ya se cubrió todo o se pagó todo, se marca como inactivo
            if paid_installments >= total_installments or remaining_amount <= 0:
                is_active = False
                remaining_amount = 0
                next_pmt_date = None
        else:
            remaining_amount = total_amount
            next_pmt_date = add_months(start_date, 1)

        # Guardar crédito inicializando saldo pendiente y primer cobro
        credit = serializer.save(
            user=self.request.user,
            remaining_amount=remaining_amount,
            next_payment_date=next_pmt_date,
            is_active=is_active
        )

        # Generar automáticamente la transacción de ingreso por desembolso (si no se omitió)
        if not skip_disbursement:
            Transaction.objects.create(
                user=self.request.user,
                transaction_type='ingreso',
                amount=total_amount,
                category=serializer.validated_data.get('category', 'otro'),
                description=f"Desembolso de crédito: {credit.name}",
                date=start_date
            )


        # Evaluar misiones
        try:
            from education.services import evaluate_user_challenges
            evaluate_user_challenges(
                self.request.user,
                trigger_hints=['register_transactions', 'daily_transaction']
            )
        except Exception:
            pass


class CreditDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CreditSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Credit.objects.filter(user=self.request.user)


class InsightsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = datetime.date.today()
        cur_y, cur_m = today.year, today.month

        # Previous month
        if cur_m == 1:
            prev_y, prev_m = cur_y - 1, 12
        else:
            prev_y, prev_m = cur_y, cur_m - 1

        months_es = {1:'Enero',2:'Febrero',3:'Marzo',4:'Abril',5:'Mayo',6:'Junio',
                     7:'Julio',8:'Agosto',9:'Septiembre',10:'Octubre',11:'Noviembre',12:'Diciembre'}

        # --- 1. Monthly comparison by category ---
        monthly_comparison = []
        for cat_id, cat_name in Transaction.CATEGORY_CHOICES:
            cur_spent = Transaction.objects.filter(
                user=user, transaction_type='gasto', category=cat_id,
                date__year=cur_y, date__month=cur_m
            ).aggregate(total=Sum('amount'))['total'] or 0

            prev_spent = Transaction.objects.filter(
                user=user, transaction_type='gasto', category=cat_id,
                date__year=prev_y, date__month=prev_m
            ).aggregate(total=Sum('amount'))['total'] or 0

            if cur_spent > 0 or prev_spent > 0:
                diff = float(cur_spent) - float(prev_spent)
                pct_change = round((diff / float(prev_spent)) * 100, 1) if prev_spent > 0 else None
                monthly_comparison.append({
                    'category': cat_id,
                    'name': cat_name,
                    'current': float(cur_spent),
                    'prev': float(prev_spent),
                    'diff': round(diff, 2),
                    'pct_change': pct_change
                })

        monthly_comparison.sort(key=lambda x: x['current'], reverse=True)

        # --- 2. Alerts ---
        alerts = []
        day_of_month = today.day
        days_in_month = 30  # approximation
        month_progress_pct = (day_of_month / days_in_month) * 100

        # Budget alerts
        for cat_id, cat_name in Transaction.CATEGORY_CHOICES:
            budget_obj = CategoryBudget.objects.filter(user=user, category=cat_id).first()
            if not budget_obj or budget_obj.budget <= 0:
                continue
            spent = Transaction.objects.filter(
                user=user, transaction_type='gasto', category=cat_id,
                date__year=cur_y, date__month=cur_m
            ).aggregate(total=Sum('amount'))['total'] or 0
            usage_pct = (float(spent) / float(budget_obj.budget)) * 100
            if usage_pct >= 100:
                alerts.append({
                    'type': 'danger', 'icon': 'AlertTriangle',
                    'title': f'¡Presupuesto de {cat_name} agotado!',
                    'message': f'Ya superaste tu límite mensual de {cat_name}. Considera reducir gastos en esta categoría.'
                })
            elif usage_pct >= 75:
                alerts.append({
                    'type': 'warning', 'icon': 'AlertCircle',
                    'title': f'{cat_name}: {round(usage_pct)}% usado',
                    'message': f'Llevas el {round(usage_pct)}% de tu presupuesto de {cat_name} y el mes lleva {day_of_month} días.'
                })

        # Goal alerts
        goals = Goal.objects.filter(user=user, is_completed=False)
        for goal in goals:
            pct = (float(goal.current_amount) / float(goal.target_amount)) * 100 if goal.target_amount > 0 else 0
            remaining = float(goal.target_amount) - float(goal.current_amount)
            if pct >= 90:
                alerts.append({
                    'type': 'success', 'icon': 'Trophy',
                    'title': f'¡Casi logras tu meta "{goal.title}"!',
                    'message': f'Estás al {round(pct)}% de tu objetivo. Solo faltan ${remaining:,.0f} para completarla. ¡Sigue así!'
                })
            elif pct >= 50:
                alerts.append({
                    'type': 'info', 'icon': 'Target',
                    'title': f'Meta "{goal.title}" a la mitad',
                    'message': f'Llevas el {round(pct)}% de tu meta. Faltan ${remaining:,.0f} para alcanzarla.'
                })

        # Month comparison alert
        total_cur = Transaction.objects.filter(
            user=user, transaction_type='gasto',
            date__year=cur_y, date__month=cur_m
        ).aggregate(total=Sum('amount'))['total'] or 0
        total_prev = Transaction.objects.filter(
            user=user, transaction_type='gasto',
            date__year=prev_y, date__month=prev_m
        ).aggregate(total=Sum('amount'))['total'] or 0

        if total_prev > 0 and total_cur > 0:
            diff_total = float(total_cur) - float(total_prev)
            if diff_total > 0:
                pct_diff = round((diff_total / float(total_prev)) * 100, 1)
                if pct_diff >= 15:
                    alerts.append({
                        'type': 'warning', 'icon': 'TrendingUp',
                        'title': f'Gastos {pct_diff}% más altos que {months_es[prev_m]}',
                        'message': f'Este mes llevas ${diff_total:,.0f} más en gastos en comparación con el mes anterior.'
                    })
            elif diff_total < 0:
                alerts.append({
                    'type': 'success', 'icon': 'TrendingDown',
                    'title': f'¡Gastos más bajos que {months_es[prev_m]}!',
                    'message': f'Este mes llevas ${abs(diff_total):,.0f} menos en gastos. ¡Excelente control!'
                })

        # --- 3. Tip of the day ---
        top_category = monthly_comparison[0] if monthly_comparison else None
        tips_map = {
            'alimentacion': ('Alimentación es tu mayor gasto este mes', 'Cocinar en casa 2 días a la semana puede ahorrarte hasta $80.000 mensuales.'),
            'transporte': ('Transporte ocupa gran parte de tu presupuesto', 'Considera la bicicleta, caminar o compartir transporte para reducir costos.'),
            'entretenimiento': ('Entretenimiento es tu categoría más cara', 'Busca opciones gratuitas o económicas: parques, museos con descuento estudiantil, streaming compartido.'),
            'materiales': ('Inviertes mucho en materiales académicos', 'Revisa bibliotecas universitarias, PDFs gratuitos o grupos de intercambio de libros.'),
            'servicios': ('Los servicios representan tu mayor egreso', 'Revisa si tienes servicios duplicados o suscripciones que no estás usando.'),
        }
        default_tip = ('Sigue monitoreando tus finanzas', 'La clave del éxito financiero es la constancia. Registra cada gasto, por pequeño que sea.')
        if top_category:
            tip_title, tip_msg = tips_map.get(top_category['category'], default_tip)
        else:
            tip_title, tip_msg = default_tip

        tip_of_the_day = {'title': tip_title, 'suggestion': tip_msg, 'icon': 'Lightbulb'}

        # --- 4. Savings trend ---
        cur_income = Transaction.objects.filter(
            user=user, transaction_type='ingreso',
            date__year=cur_y, date__month=cur_m
        ).aggregate(total=Sum('amount'))['total'] or 0
        prev_income = Transaction.objects.filter(
            user=user, transaction_type='ingreso',
            date__year=prev_y, date__month=prev_m
        ).aggregate(total=Sum('amount'))['total'] or 0

        cur_rate = round(((float(cur_income) - float(total_cur)) / float(cur_income)) * 100, 1) if cur_income > 0 else 0
        prev_rate = round(((float(prev_income) - float(total_prev)) / float(prev_income)) * 100, 1) if prev_income > 0 else 0
        trend = 'up' if cur_rate >= prev_rate else 'down'

        return Response({
            'monthly_comparison': monthly_comparison,
            'alerts': alerts[:6],  # max 6 alerts
            'tip_of_the_day': tip_of_the_day,
            'savings_trend': {
                'current_month_rate': cur_rate,
                'prev_month_rate': prev_rate,
                'trend': trend,
                'current_month_name': months_es[cur_m],
                'prev_month_name': months_es[prev_m],
            },
            'top_expense_category': {
                'name': top_category['name'] if top_category else None,
                'amount': top_category['current'] if top_category else 0
            }
        })
