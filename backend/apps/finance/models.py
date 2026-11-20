from django.db import models

from apps.core.models import BaseModel


class Transaction(BaseModel):
    TYPE_CHOICES = (("income", "Income"), ("expense", "Expense"))
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField(db_index=True)

    class Meta(BaseModel.Meta):
        indexes = [models.Index(fields=["factory", "type"]), models.Index(fields=["factory", "date"])]
