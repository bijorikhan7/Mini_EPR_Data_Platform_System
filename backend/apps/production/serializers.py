from rest_framework import serializers

from apps.factories.models import Factory

from .models import ProductionRecord


class ProductionRecordSerializer(serializers.ModelSerializer):
    factory_id = serializers.PrimaryKeyRelatedField(
        source="factory",
        queryset=Factory.objects.all(),
        required=False,
        allow_null=True,
        write_only=True,
    )

    class Meta:
        model = ProductionRecord
        fields = ("id", "factory", "factory_id", "product", "quantity", "date", "created_at", "updated_at")
        read_only_fields = ("id", "factory", "created_at", "updated_at")

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value
