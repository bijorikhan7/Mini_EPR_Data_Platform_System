from rest_framework import serializers

from .models import ProcurementOrder


class ProcurementOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcurementOrder
        fields = ("id", "factory", "supplier", "product", "quantity", "cost", "created_at", "updated_at")
        read_only_fields = ("id", "factory", "created_at", "updated_at")

    def validate_cost(self, value):
        if value < 0:
            raise serializers.ValidationError("Cost cannot be negative.")
        return value
