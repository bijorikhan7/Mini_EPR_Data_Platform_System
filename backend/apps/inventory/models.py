from django.db import models

from apps.core.models import BaseModel


class InventoryItem(BaseModel):
    product = models.CharField(max_length=120, db_index=True)
    quantity = models.PositiveIntegerField(default=0)

    class Meta(BaseModel.Meta):
        constraints = [
            models.UniqueConstraint(fields=["factory", "product"], name="uniq_factory_product_inventory")
        ]
        indexes = [models.Index(fields=["factory", "product"])]

    def __str__(self) -> str:
        return f"{self.product} ({self.quantity})"
