from django.db import transaction

from apps.finance.services import FinanceService
from apps.inventory.services import InventoryService

from .models import ProcurementOrder


class ProcurementService:
    @staticmethod
    @transaction.atomic
    def create_order(factory, **data):
        order = ProcurementOrder.objects.create(factory=factory, **data)
        InventoryService.create_or_update_inventory(factory, order.product, order.quantity)
        FinanceService.create_expense(factory=factory, amount=order.cost)
        return order

    @staticmethod
    @transaction.atomic
    def update_order(instance: ProcurementOrder, **data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance
