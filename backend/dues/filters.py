from django_filters import rest_framework as filters
from .models import Dues

class DuesFilter(filters.FilterSet):
    min_amount = filters.NumberFilter(field_name='amount', lookup_expr='gte')
    max_amount = filters.NumberFilter(field_name='amount', lookup_expr='lte')
    due_date_before = filters.DateFilter(field_name='due_date', lookup_expr='lte')
    due_date_after = filters.DateFilter(field_name='due_date', lookup_expr='gte')

    class Meta:
        model = Dues
        fields = {
            'department': ['exact'],
            'student': ['exact'],
            'is_paid': ['exact'],
            'created_by': ['exact'],
        } 