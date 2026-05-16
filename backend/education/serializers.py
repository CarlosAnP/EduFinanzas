from rest_framework import serializers
from .models import Challenge, UserChallenge, Guide

class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = '__all__'

class UserChallengeSerializer(serializers.ModelSerializer):
    challenge = ChallengeSerializer(read_only=True)
    
    class Meta:
        model = UserChallenge
        fields = ('id', 'challenge', 'status', 'progress', 'total')

class GuideSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guide
        fields = '__all__'
