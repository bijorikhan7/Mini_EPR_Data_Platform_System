from apps.core.views import FactoryScopedViewSet

from .models import ReportExport
from .serializers import ReportExportSerializer
from .services import ReportService


class ReportExportViewSet(FactoryScopedViewSet):
    serializer_class = ReportExportSerializer
    queryset = ReportExport.objects.select_related("factory").all()
    filterset_fields = ("report_name",)
    search_fields = ("report_name",)
    ordering_fields = ("created_at",)

    def perform_create(self, serializer):
        serializer.instance = ReportService.create_export(self.request.user.factory, **serializer.validated_data)
