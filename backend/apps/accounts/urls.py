from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import AuthTokenView, ProfileViewSet

urlpatterns = [
    path("token/", AuthTokenView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", ProfileViewSet.as_view({"get": "me"}), name="profile_me"),
]
