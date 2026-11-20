from rest_framework.exceptions import ValidationError

from apps.core.views import FactoryScopedViewSet

from .models import SalesOrder
from .serializers import SalesOrderSerializer
from .services import SalesService


class SalesOrderViewSet(FactoryScopedViewSet):
    serializer_class = SalesOrderSerializer
    queryset = SalesOrder.objects.select_related("factory").all()
    filterset_fields = ("status", "customer", "product")
    search_fields = ("customer", "product")
    ordering_fields = ("created_at", "quantity", "status")

    def perform_create(self, serializer):
        try:
            serializer.instance = SalesService.create_order(self.request.user.factory, **serializer.validated_data)
        except ValueError as exc:
            raise ValidationError(str(exc)) from exc

    def perform_update(self, serializer):
        try:
            serializer.instance = SalesService.update_order(serializer.instance, **serializer.validated_data)
        except ValueError as exc:
            raise ValidationError(str(exc)) from exc
