from django_filters import rest_framework as filters
from .models import Dues
from core.models import Department

class DuesFilter(filters.FilterSet):
    min_amount = filters.NumberFilter(field_name='amount', lookup_expr='gte')
    max_amount = filters.NumberFilter(field_name='amount', lookup_expr='lte')
    due_date_before = filters.DateFilter(field_name='due_date', lookup_expr='lte')
    due_date_after = filters.DateFilter(field_name='due_date', lookup_expr='gte')
    department = filters.CharFilter(method='filter_department')

    def filter_department(self, queryset, name, value):
        try:
            department = Department.objects.get(department__iexact=value)
            return queryset.filter(department=department)
        except Department.DoesNotExist:
            return queryset.none()

    class Meta:
        model = Dues
        fields = {
            'student': ['exact'],
            'is_paid': ['exact'],
            'created_by': ['exact'],
        } 