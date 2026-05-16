from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Challenge, UserChallenge, Guide
from .serializers import UserChallengeSerializer, GuideSerializer

class GuideListView(generics.ListAPIView):
    queryset = Guide.objects.all()
    serializer_class = GuideSerializer
    permission_classes = [IsAuthenticated]

class UserChallengeListView(generics.ListAPIView):
    serializer_class = UserChallengeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Auto-assign active challenges if they don't exist for the user
        all_challenges = Challenge.objects.filter(is_active=True)
        for challenge in all_challenges:
            total = 5 if '5 gastos' in challenge.title.lower() else 1
            UserChallenge.objects.get_or_create(user=user, challenge=challenge, defaults={'total': total})
        
        # Evaluar progreso cada vez que entra al Hub por si algo cambió
        from .services import evaluate_user_challenges
        evaluate_user_challenges(user)
        
        return UserChallenge.objects.filter(user=user).select_related('challenge')

from rest_framework import views, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction

class UserChallengeStartView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        user_challenge = get_object_or_404(UserChallenge, pk=pk, user=request.user)
        if user_challenge.status == 'pending':
            user_challenge.status = 'active'
            user_challenge.save()
            return Response({'status': 'started'})
        return Response({'error': 'El reto no está pendiente'}, status=status.HTTP_400_BAD_REQUEST)

class UserChallengeCompleteView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        user_challenge = get_object_or_404(UserChallenge, pk=pk, user=request.user)
        if user_challenge.status == 'active':
            with transaction.atomic():
                user_challenge.status = 'completed'
                user_challenge.progress = user_challenge.total
                user_challenge.save()
                
                # Add points to user
                user = request.user
                user.points += user_challenge.challenge.reward_points
                user.save()
                
            return Response({'status': 'completed', 'points_earned': user_challenge.challenge.reward_points})
        return Response({'error': 'El reto no está activo'}, status=status.HTTP_400_BAD_REQUEST)
