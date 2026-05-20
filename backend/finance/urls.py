from django.urls import path
from .views import (
    DashboardSummaryView, TransactionListCreateView, TransactionDetailView,
    GoalListCreateView, CategoryBudgetListCreateView, GoalAddFundsView,
    SubscriptionListCreateView, SubscriptionDetailView, InsightsView,
    CreditListCreateView, CreditDetailView
)

urlpatterns = [
    path('dashboard/', DashboardSummaryView.as_view(), name='dashboard'),
    path('transactions/', TransactionListCreateView.as_view(), name='transactions'),
    path('transactions/<int:pk>/', TransactionDetailView.as_view(), name='transaction-detail'),
    path('goals/', GoalListCreateView.as_view(), name='goals'),
    path('goals/<int:pk>/add_funds/', GoalAddFundsView.as_view(), name='goal-add-funds'),
    path('budgets/', CategoryBudgetListCreateView.as_view(), name='budgets'),
    path('subscriptions/', SubscriptionListCreateView.as_view(), name='subscriptions'),
    path('subscriptions/<int:pk>/', SubscriptionDetailView.as_view(), name='subscription-detail'),
    path('credits/', CreditListCreateView.as_view(), name='credits'),
    path('credits/<int:pk>/', CreditDetailView.as_view(), name='credit-detail'),
    path('insights/', InsightsView.as_view(), name='insights'),
]
