from .models import ReportExport


class ReportService:
    @staticmethod
    def create_export(factory, report_name, file_path):
        return ReportExport.objects.create(factory=factory, report_name=report_name, file_path=file_path)
