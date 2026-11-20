from typing import Any

from django.db import transaction


class BaseService:
    @staticmethod
    @transaction.atomic
    def create(model_cls, **kwargs: Any):
        return model_cls.objects.create(**kwargs)

    @staticmethod
    @transaction.atomic
    def update(instance, **kwargs: Any):
        for key, value in kwargs.items():
            setattr(instance, key, value)
        instance.save(update_fields=list(kwargs.keys()) + ["updated_at"])
        return instance
