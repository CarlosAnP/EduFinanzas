from django.urls import path
from .views import DashboardSummaryView, TransactionListCreateView, GoalListCreateView, CategoryBudgetListCreateView, GoalAddFundsView, SubscriptionListCreateView, SubscriptionDetailView, InsightsView

urlpatterns = [
    path('dashboard/', DashboardSummaryView.as_view(), name='dashboard'),
    path('transactions/', TransactionListCreateView.as_view(), name='transactions'),
    path('goals/', GoalListCreateView.as_view(), name='goals'),
    path('goals/<int:pk>/add_funds/', GoalAddFundsView.as_view(), name='goal-add-funds'),
    path('budgets/', CategoryBudgetListCreateView.as_view(), name='budgets'),
    path('subscriptions/', SubscriptionListCreateView.as_view(), name='subscriptions'),
    path('subscriptions/<int:pk>/', SubscriptionDetailView.as_view(), name='subscription-detail'),
    path('insights/', InsightsView.as_view(), name='insights'),
]
