from django.urls import path
from .views import (
    GuideListView, MarkGuideReadView,
    UserChallengeListView, UserChallengeStartView, UserChallengeCompleteView,
    QuizSubmitView
)

urlpatterns = [
    path('guides/', GuideListView.as_view(), name='guides'),
    path('guides/<int:pk>/read/', MarkGuideReadView.as_view(), name='guide-read'),
    path('challenges/', UserChallengeListView.as_view(), name='user-challenges'),
    path('challenges/<int:pk>/start/', UserChallengeStartView.as_view(), name='challenge-start'),
    path('challenges/<int:pk>/complete/', UserChallengeCompleteView.as_view(), name='challenge-complete'),
    path('quizzes/<int:pk>/submit/', QuizSubmitView.as_view(), name='quiz-submit'),
]
