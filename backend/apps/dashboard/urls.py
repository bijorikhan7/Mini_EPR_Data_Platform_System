from django.urls import path

from .views import DashboardViewSet

urlpatterns = [
    path("", DashboardViewSet.as_view({"get": "list"}), name="dashboard"),
]
