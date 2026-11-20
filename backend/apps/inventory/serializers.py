from rest_framework import serializers

from .models import InventoryItem


class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = ("id", "factory", "product", "quantity", "created_at", "updated_at")
        read_only_fields = ("id", "factory", "created_at", "updated_at")

    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value
