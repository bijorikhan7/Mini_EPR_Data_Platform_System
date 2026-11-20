import django_filters

from .models import ProductionRecord


class ProductionRecordFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name="date", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="date", lookup_expr="lte")

    class Meta:
        model = ProductionRecord
        fields = ("product", "factory", "date")
