from datetime import date

from django.db import transaction
from django.db.models import Sum
from django.db.models.functions import TruncDate

from apps.inventory.services import InventoryService

from .models import ProductionRecord


class ProductionService:
    @staticmethod
    @transaction.atomic
    def create_production(factory, product: str, quantity: int, production_date: date):
        record = ProductionRecord.objects.create(
            factory=factory,
            product=product,
            quantity=quantity,
            date=production_date,
        )
        ProductionService.update_inventory_after_production(factory, product, quantity)
        return record

    @staticmethod
    def update_inventory_after_production(factory, product: str, quantity: int):
        return InventoryService.create_or_update_inventory(factory, product, quantity)

    @staticmethod
    def get_daily_trends(factory):
        return (
            ProductionRecord.objects.filter(factory=factory)
            .annotate(day=TruncDate("date"))
            .values("day")
            .annotate(total_quantity=Sum("quantity"))
            .order_by("day")
        )
