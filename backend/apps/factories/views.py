from apps.core.views import FactoryScopedViewSet

from .models import Factory
from .serializers import FactorySerializer
from .services import FactoryService


class FactoryViewSet(FactoryScopedViewSet):
    serializer_class = FactorySerializer
    queryset = Factory.objects.all()
    filterset_fields = ("code", "location")
    search_fields = ("name", "code", "location")
    ordering_fields = ("name", "created_at")

    def perform_create(self, serializer):
        serializer.instance = FactoryService.create_factory(**serializer.validated_data)

    def perform_update(self, serializer):
        serializer.instance = FactoryService.update_factory(serializer.instance, **serializer.validated_data)
