from django.db import models

from apps.core.models import BaseModel


class ReportExport(BaseModel):
    report_name = models.CharField(max_length=120)
    file_path = models.CharField(max_length=255)
