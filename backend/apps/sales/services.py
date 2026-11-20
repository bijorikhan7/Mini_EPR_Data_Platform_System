from django.db import transaction

from apps.inventory.services import InventoryService

from .models import SalesOrder


class SalesService:
    @staticmethod
    @transaction.atomic
    def create_order(factory, **data):
        order = SalesOrder.objects.create(factory=factory, **data)
        if order.status in {"confirmed", "delivered"}:
            InventoryService.create_or_update_inventory(factory, order.product, -order.quantity)
        return order

    @staticmethod
    @transaction.atomic
    def update_order(instance: SalesOrder, **data):
        previous_status = instance.status
        previous_quantity = instance.quantity
        previous_product = instance.product
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()

        if previous_status in {"confirmed", "delivered"}:
            InventoryService.create_or_update_inventory(instance.factory, previous_product, previous_quantity)
        if instance.status in {"confirmed", "delivered"}:
            InventoryService.create_or_update_inventory(instance.factory, instance.product, -instance.quantity)
        return instance
