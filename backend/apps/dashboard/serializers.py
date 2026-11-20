from rest_framework import serializers


class DashboardSerializer(serializers.Serializer):
    total_production = serializers.IntegerField()
    total_sales = serializers.IntegerField()
    total_inventory = serializers.IntegerField()
    total_profit_loss = serializers.DecimalField(max_digits=12, decimal_places=2)
    trends = serializers.ListField()
