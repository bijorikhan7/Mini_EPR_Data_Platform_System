from django.db import models

from apps.core.models import BaseModel


class Factory(BaseModel):
    name = models.CharField(max_length=120, db_index=True)
    location = models.CharField(max_length=255)
    code = models.CharField(max_length=32, unique=True, db_index=True)

    class Meta(BaseModel.Meta):
        indexes = [models.Index(fields=["code", "name"])]

    def __str__(self) -> str:
        return f"{self.code} - {self.name}"
