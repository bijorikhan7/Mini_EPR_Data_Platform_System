from django.db import models

from apps.core.models import BaseModel


class SalesOrder(BaseModel):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    )
    customer = models.CharField(max_length=120, db_index=True)
    product = models.CharField(max_length=120, db_index=True)
    quantity = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending", db_index=True)

    class Meta(BaseModel.Meta):
        indexes = [models.Index(fields=["factory", "status"]), models.Index(fields=["factory", "customer"])]
