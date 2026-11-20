from decimal import Decimal

from django.db import models

from apps.core.models import BaseModel


class ProcurementOrder(BaseModel):
    supplier = models.CharField(max_length=120, db_index=True)
    product = models.CharField(max_length=120, db_index=True)
    quantity = models.PositiveIntegerField()
    cost = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    class Meta(BaseModel.Meta):
        indexes = [models.Index(fields=["factory", "supplier"]), models.Index(fields=["factory", "product"])]
