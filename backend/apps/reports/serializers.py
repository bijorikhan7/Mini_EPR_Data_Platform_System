from rest_framework import serializers

from .models import ReportExport


class ReportExportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportExport
        fields = ("id", "factory", "report_name", "file_path", "created_at", "updated_at")
        read_only_fields = ("id", "factory", "created_at", "updated_at")
