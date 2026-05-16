from django.urls import path
from .views import GuideListView, UserChallengeListView, UserChallengeStartView, UserChallengeCompleteView

urlpatterns = [
    path('guides/', GuideListView.as_view(), name='guides'),
    path('challenges/', UserChallengeListView.as_view(), name='user-challenges'),
    path('challenges/<int:pk>/start/', UserChallengeStartView.as_view(), name='challenge-start'),
    path('challenges/<int:pk>/complete/', UserChallengeCompleteView.as_view(), name='challenge-complete'),
]
