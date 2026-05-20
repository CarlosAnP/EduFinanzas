from rest_framework import generics, views, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Challenge, UserChallenge, Guide, UserGuideRead
from .serializers import UserChallengeSerializer, GuideSerializer
from .services import evaluate_user_challenges


class GuideListView(generics.ListAPIView):
    queryset = Guide.objects.all()
    serializer_class = GuideSerializer
    permission_classes = [IsAuthenticated]


class MarkGuideReadView(views.APIView):
    """
    POST /education/guides/<pk>/read/
    Marca una guía como leída y evalúa triggers de read_guide.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        guide = get_object_or_404(Guide, pk=pk)
        user = request.user

        obj, created = UserGuideRead.objects.get_or_create(user=user, guide=guide)

        completed = evaluate_user_challenges(user, trigger_hints=['read_guide'])
        completed_data = [{'title': c.title, 'points': c.reward_points} for c in completed]

        return Response({
            'already_read': not created,
            'completed_missions': completed_data
        })


class UserChallengeListView(generics.ListAPIView):
    serializer_class = UserChallengeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Auto-assign all active challenges to the user (as 'active' by default)
        all_challenges = Challenge.objects.filter(is_active=True)
        for challenge in all_challenges:
            UserChallenge.objects.get_or_create(
                user=user,
                challenge=challenge,
                defaults={
                    'total': challenge.trigger_total,
                    'status': 'active'
                }
            )

        # Run a full evaluation on load so progress is always fresh
        evaluate_user_challenges(user)

        return UserChallenge.objects.filter(user=user).select_related('challenge').order_by(
            # Sort: active first, then pending, then completed
            'status', 'challenge__difficulty'
        )


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
    """Manual completion (fallback for 'manual' trigger type)."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        user_challenge = get_object_or_404(UserChallenge, pk=pk, user=request.user)
        if user_challenge.status == 'active' and user_challenge.challenge.trigger_type == 'manual':
            with transaction.atomic():
                user_challenge.status = 'completed'
                user_challenge.progress = user_challenge.total
                user_challenge.save()

                user = request.user
                user.points += user_challenge.challenge.reward_points
                user.save()

            return Response({
                'status': 'completed',
                'points_earned': user_challenge.challenge.reward_points
            })
        return Response({'error': 'El reto no puede completarse manualmente'}, status=status.HTTP_400_BAD_REQUEST)


from .models import Quiz, Choice
from users.models import Badge, UserBadge


class QuizSubmitView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        quiz = get_object_or_404(Quiz, pk=pk)
        answers = request.data.get('answers', {})

        correct_count = 0
        total_questions = quiz.questions.count()

        if total_questions == 0:
            return Response({'error': 'Quiz sin preguntas'}, status=status.HTTP_400_BAD_REQUEST)

        for q in quiz.questions.all():
            choice_id = answers.get(str(q.id)) or answers.get(q.id)
            if choice_id:
                try:
                    choice = Choice.objects.get(id=choice_id, question=q)
                    if choice.is_correct:
                        correct_count += 1
                except Choice.DoesNotExist:
                    pass

        score = (correct_count / total_questions) * 100
        passed = score >= 60

        result_data = {
            'score': score,
            'passed': passed,
            'correct_count': correct_count,
            'total_questions': total_questions
        }

        if passed:
            with transaction.atomic():
                user = request.user
                user.points += quiz.reward_points
                user.save()
                result_data['points_earned'] = quiz.reward_points

                # Increment progress on complete_quiz challenges
                for uc in UserChallenge.objects.filter(
                    user=user,
                    status='active',
                    challenge__trigger_type='complete_quiz'
                ):
                    uc.progress = min(uc.progress + 1, uc.total)
                    if uc.progress >= uc.total:
                        uc.status = 'completed'
                        user.points += uc.challenge.reward_points
                        result_data.setdefault('completed_missions', []).append({
                            'title': uc.challenge.title,
                            'points': uc.challenge.reward_points
                        })
                    uc.save()
                user.save()

                # Badge for first quiz
                badge, _ = Badge.objects.get_or_create(
                    name='Estudioso',
                    defaults={
                        'description': 'Has aprobado tu primer quiz.',
                        'icon_name': 'BookOpen',
                        'color': 'blue'
                    }
                )
                user_badge, badge_created = UserBadge.objects.get_or_create(user=user, badge=badge)
                if badge_created:
                    result_data['badge_earned'] = {
                        'name': badge.name,
                        'icon': badge.icon_name
                    }

        return Response(result_data)
