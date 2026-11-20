from rest_framework.routers import DefaultRouter

from .views import TransactionViewSet

router = DefaultRouter()
router.register("", TransactionViewSet, basename="finance")

urlpatterns = router.urls
