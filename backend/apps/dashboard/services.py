from django.db.models import Sum

from apps.finance.services import FinanceService
from apps.inventory.models import InventoryItem
from apps.production.models import ProductionRecord
from apps.sales.models import SalesOrder


class DashboardService:
    @staticmethod
    def get_dashboard_data(factory):
        total_production = (
            ProductionRecord.objects.filter(factory=factory).aggregate(total=Sum("quantity"))["total"] or 0
        )
        total_sales = SalesOrder.objects.filter(factory=factory).count()
        total_inventory = InventoryItem.objects.filter(factory=factory).aggregate(total=Sum("quantity"))["total"] or 0
        financials = FinanceService.calculate_financial_summary(factory)

        # `date` is already a DateField; grouping directly avoids SQLite
        # `TruncDate` user-defined-function errors in local dev.
        trends_qs = (
            ProductionRecord.objects.filter(factory=factory)
            .values("date")
            .annotate(total_production=Sum("quantity"))
            .order_by("date")
        )

        trends = [
            {"date": item["date"], "total_production": item["total_production"]}
            for item in trends_qs
        ]
        return {
            "total_production": total_production,
            "total_sales": total_sales,
            "total_inventory": total_inventory,
            "total_profit_loss": financials["profit_loss"],
            "trends": trends,
        }
