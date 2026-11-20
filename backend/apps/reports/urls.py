from rest_framework.routers import DefaultRouter

from .views import ReportExportViewSet

router = DefaultRouter()
router.register("exports", ReportExportViewSet, basename="report-export")

urlpatterns = router.urls
