from rest_framework.routers import DefaultRouter

from .views import ProcurementOrderViewSet

router = DefaultRouter()
router.register("", ProcurementOrderViewSet, basename="procurement")

urlpatterns = router.urls
