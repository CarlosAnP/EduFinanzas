from rest_framework import serializers
from .models import Transaction, Goal, CategoryBudget, Subscription, Credit

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('id', 'transaction_type', 'amount', 'category', 'description', 'date', 'created_at')

class GoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Goal
        fields = ('id', 'title', 'description', 'target_amount', 'current_amount', 'deadline', 'is_completed', 'progress_percentage')

class CategoryBudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryBudget
        fields = ('id', 'category', 'budget', 'color')

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ('id', 'name', 'amount', 'category', 'frequency', 'start_date', 'next_billing_date', 'is_active', 'created_at')

class CreditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Credit
        fields = (
            'id', 'name', 'total_amount', 'remaining_amount', 'installment_amount',
            'total_installments', 'paid_installments', 'interest_rate', 'start_date',
            'next_payment_date', 'category', 'is_active', 'created_at'
        )
        read_only_fields = ('remaining_amount', 'paid_installments', 'next_payment_date', 'is_active')

