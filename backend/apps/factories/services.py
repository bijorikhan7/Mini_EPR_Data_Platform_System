from django.db import transaction

from .models import Factory


class FactoryService:
    @staticmethod
    @transaction.atomic
    def create_factory(**data):
        factory = Factory.objects.create(**data)
        if factory.factory_id is None:
            factory.factory = factory
            factory.save(update_fields=["factory", "updated_at"])
        return factory

    @staticmethod
    @transaction.atomic
    def update_factory(instance: Factory, **data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance
