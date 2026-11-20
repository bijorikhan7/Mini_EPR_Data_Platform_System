from rest_framework import serializers

from .models import Factory


class FactorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Factory
        fields = ("id", "name", "location", "code", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_code(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Factory code must be at least 3 chars.")
        return value.upper()
