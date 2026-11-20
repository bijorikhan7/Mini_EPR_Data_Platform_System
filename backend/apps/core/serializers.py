from rest_framework import serializers


class FactoryScopedSerializerMixin(serializers.ModelSerializer):
    def validate(self, attrs):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            attrs["factory"] = request.user.factory
        return super().validate(attrs)
