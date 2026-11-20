import uuid

from django.conf import settings
from django.db import models


class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    factory = models.ForeignKey(
        "factories.Factory",
        on_delete=models.PROTECT,
        related_name="%(class)ss",
        null=True,
        blank=True,
        db_index=True,
    )

    class Meta:
        abstract = True
        ordering = ("-created_at",)


class TimeStampedActorModel(BaseModel):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="%(class)s_created",
    )

    class Meta:
        abstract = True
