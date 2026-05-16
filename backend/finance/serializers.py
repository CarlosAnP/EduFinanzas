from rest_framework import serializers
from .models import Transaction, Goal, CategoryBudget

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
