from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import CustomTokenObtainPairSerializer, UserSerializer
from .services import AccountService


class AuthTokenView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ProfileViewSet(viewsets.ViewSet):
    permission_classes = (permissions.IsAuthenticated,)

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        user = AccountService.get_user_profile(request.user.id)
        return Response(UserSerializer(user).data)
