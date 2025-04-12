from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Dues
from .serializers import DuesSerializer
from .permissions import IsStaffOfDepartment
from .filters import DuesFilter

class DuesViewSet(viewsets.ModelViewSet):
    queryset = Dues.objects.all()
    serializer_class = DuesSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffOfDepartment]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DuesFilter
    search_fields = ['student__user__first_name', 'student__user__last_name', 'description']
    ordering_fields = ['amount', 'due_date', 'created_at']

    def get_queryset(self):
        if self.request.user.is_staff:
            return Dues.objects.filter(department=self.request.user.staff_profile.department)
        return Dues.objects.filter(student__user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        dues = self.get_object()
        dues.is_paid = True
        dues.save()
        return Response({'status': 'marked as paid'}) 