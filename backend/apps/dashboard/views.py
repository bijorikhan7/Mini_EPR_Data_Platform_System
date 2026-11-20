from rest_framework import mixins, permissions, viewsets
from rest_framework.response import Response

from .serializers import DashboardSerializer
from .services import DashboardService


class DashboardViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = DashboardSerializer
    queryset = []

    def list(self, request, *args, **kwargs):
        data = DashboardService.get_dashboard_data(request.user.factory)
        serializer = self.get_serializer(data)
        return Response(serializer.data)
