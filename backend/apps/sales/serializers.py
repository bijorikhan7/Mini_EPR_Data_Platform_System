from rest_framework import serializers

from .models import SalesOrder


class SalesOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesOrder
        fields = ("id", "factory", "customer", "product", "quantity", "status", "created_at", "updated_at")
        read_only_fields = ("id", "factory", "created_at", "updated_at")

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value
