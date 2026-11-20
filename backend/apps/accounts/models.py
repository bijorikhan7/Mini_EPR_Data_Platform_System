from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    factory = models.ForeignKey(
        "factories.Factory",
        on_delete=models.PROTECT,
        related_name="users",
        null=True,
        blank=True,
    )

    class Meta:
        indexes = [models.Index(fields=["username", "email"])]
