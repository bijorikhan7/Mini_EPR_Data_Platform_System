from apps.core.views import FactoryScopedViewSet

from .models import Transaction
from .serializers import TransactionSerializer


class TransactionViewSet(FactoryScopedViewSet):
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.select_related("factory").all()
    filterset_fields = ("type", "date")
    search_fields = ("type",)
    ordering_fields = ("date", "amount", "created_at")

    def perform_create(self, serializer):
        serializer.save(factory=self.request.user.factory)
