from rest_framework.routers import DefaultRouter

from .views import FactoryViewSet

router = DefaultRouter()
router.register("", FactoryViewSet, basename="factory")

urlpatterns = router.urls
