from apps.core.views import FactoryScopedViewSet

from .models import ProcurementOrder
from .serializers import ProcurementOrderSerializer
from .services import ProcurementService


class ProcurementOrderViewSet(FactoryScopedViewSet):
    serializer_class = ProcurementOrderSerializer
    queryset = ProcurementOrder.objects.select_related("factory").all()
    filterset_fields = ("supplier", "product")
    search_fields = ("supplier", "product")
    ordering_fields = ("created_at", "quantity", "cost")

    def perform_create(self, serializer):
        serializer.instance = ProcurementService.create_order(self.request.user.factory, **serializer.validated_data)

    def perform_update(self, serializer):
        serializer.instance = ProcurementService.update_order(serializer.instance, **serializer.validated_data)
