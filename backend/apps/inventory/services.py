from django.db import transaction

from .models import InventoryItem


class InventoryService:
    @staticmethod
    @transaction.atomic
    def create_or_update_inventory(factory, product: str, quantity_delta: int):
        item, _ = InventoryItem.objects.select_for_update().get_or_create(
            factory=factory,
            product=product,
            defaults={"quantity": 0},
        )
        item.quantity += quantity_delta
        if item.quantity < 0:
            raise ValueError("Inventory cannot be negative.")
        item.save(update_fields=["quantity", "updated_at"])
        return item

    @staticmethod
    @transaction.atomic
    def set_inventory(instance: InventoryItem, quantity: int):
        if quantity < 0:
            raise ValueError("Inventory cannot be negative.")
        instance.quantity = quantity
        instance.save(update_fields=["quantity", "updated_at"])
        return instance
