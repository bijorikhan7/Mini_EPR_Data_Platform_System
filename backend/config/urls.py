from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter

from apps.dashboard.views import DashboardViewSet
from apps.factories.views import FactoryViewSet
from apps.finance.views import TransactionViewSet
from apps.inventory.views import InventoryItemViewSet
from apps.procurement.views import ProcurementOrderViewSet
from apps.production.views import ProductionRecordViewSet
from apps.sales.views import SalesOrderViewSet


router = DefaultRouter()
router.register(r"factories", FactoryViewSet, basename="factory")
router.register(r"production", ProductionRecordViewSet, basename="production")
router.register(r"inventory", InventoryItemViewSet, basename="inventory")
router.register(r"sales", SalesOrderViewSet, basename="sales")
router.register(r"procurement", ProcurementOrderViewSet, basename="procurement")
router.register(r"finance", TransactionViewSet, basename="finance")
router.register(r"dashboard", DashboardViewSet, basename="dashboard")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/", include(router.urls)),
    path("api/reports/", include("apps.reports.urls")),
]
