from django.db import models

from apps.core.models import BaseModel


class ProductionRecord(BaseModel):
    product = models.CharField(max_length=120, db_index=True)
    quantity = models.PositiveIntegerField()
    date = models.DateField(db_index=True)

    class Meta(BaseModel.Meta):
        indexes = [models.Index(fields=["factory", "date"]), models.Index(fields=["factory", "product"])]
