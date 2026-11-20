from datetime import datetime

from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.utils import export_rows_as_csv, parse_csv_file
from apps.core.views import FactoryScopedViewSet

from .filters import ProductionRecordFilter
from .models import ProductionRecord
from .serializers import ProductionRecordSerializer
from .services import ProductionService


class ProductionRecordViewSet(FactoryScopedViewSet):
    serializer_class = ProductionRecordSerializer
    queryset = ProductionRecord.objects.select_related("factory").all()
    filterset_class = ProductionRecordFilter
    search_fields = ("product",)
    ordering_fields = ("date", "quantity", "created_at")

    def _resolve_factory_for_write(self, request, serializer):
        requested_factory = serializer.validated_data.get("factory")
        if getattr(request.user, "is_superuser", False):
            factory = requested_factory or request.user.factory
            if factory is None:
                return None, Response(
                    {"factory_id": ["Factory is required for superusers without a default factory."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return factory, None
        if requested_factory and requested_factory != request.user.factory:
            return None, Response(
                {"factory_id": ["Only superusers can choose a factory."]},
                status=status.HTTP_403_FORBIDDEN,
            )
        return request.user.factory, None

    @extend_schema(
        examples=[
            OpenApiExample(
                "Create Production",
                value={"product": "Widget A", "quantity": 120, "date": "2026-04-25"},
                request_only=True,
            )
        ]
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        factory, error_response = self._resolve_factory_for_write(request, serializer)
        if error_response:
            return error_response
        record = ProductionService.create_production(
            factory=factory,
            product=serializer.validated_data["product"],
            quantity=serializer.validated_data["quantity"],
            production_date=serializer.validated_data["date"],
        )
        return Response(self.get_serializer(record).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        factory, error_response = self._resolve_factory_for_write(request, serializer)
        if error_response:
            return error_response
        serializer.save(factory=factory)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="import-csv")
    def import_csv(self, request):
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"detail": "CSV file is required."}, status=status.HTTP_400_BAD_REQUEST)
        rows = parse_csv_file(file_obj)
        created = 0
        for row in rows:
            ProductionService.create_production(
                factory=request.user.factory,
                product=row["product"],
                quantity=int(row["quantity"]),
                production_date=datetime.strptime(row["date"], "%Y-%m-%d").date(),
            )
            created += 1
        return Response({"created_records": created}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="export-csv")
    def export_csv(self, request):
        queryset = self.filter_queryset(self.get_queryset()).filter(factory=request.user.factory)
        rows = [[item.product, item.quantity, item.date.isoformat()] for item in queryset]
        return export_rows_as_csv(
            "production_records.csv",
            headers=["product", "quantity", "date"],
            rows=rows,
        )
