from rest_framework.exceptions import ValidationError

from apps.core.views import FactoryScopedViewSet

from .models import InventoryItem
from .serializers import InventoryItemSerializer
from .services import InventoryService


class InventoryItemViewSet(FactoryScopedViewSet):
    serializer_class = InventoryItemSerializer
    queryset = InventoryItem.objects.all()
    filterset_fields = ("product",)
    search_fields = ("product",)
    ordering_fields = ("product", "quantity", "created_at")

    def perform_create(self, serializer):
        serializer.save(factory=self.request.user.factory)

    def perform_update(self, serializer):
        try:
            serializer.instance = InventoryService.set_inventory(
                serializer.instance,
                serializer.validated_data["quantity"],
            )
        except ValueError as exc:
            raise ValidationError(str(exc)) from exc
