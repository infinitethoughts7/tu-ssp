from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Dues
from .serializers import DuesSerializer
from core.permisions.staff_permistion import IsStaffOfDepartment
from .filters import DuesFilter 
from rest_framework.permissions import AllowAny
from core.models import StudentProfile

class DuesViewSet(viewsets.ModelViewSet):
    queryset = Dues.objects.all()
    serializer_class = DuesSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DuesFilter
    search_fields = ['student__user__first_name', 'student__user__last_name', 'description']
    ordering_fields = ['amount', 'due_date', 'created_at']

    def get_queryset(self):
        queryset = Dues.objects.all()
        
        # Filter by student ID if provided
        student_id = self.request.query_params.get('student_id', None)
        if student_id:
            try:
                student = StudentProfile.objects.get(id=student_id)
                queryset = queryset.filter(student=student)
            except StudentProfile.DoesNotExist:
                return Dues.objects.none()
        
        # Filter by department if staff user
        if hasattr(self.request.user, 'is_staff') and self.request.user.is_staff:
            queryset = queryset.filter(department=self.request.user.staff_profile.department)
        # Filter by student if student user
        elif hasattr(self.request.user, 'is_student') and self.request.user.is_student:
            queryset = queryset.filter(student__user=self.request.user)
            
        return queryset

    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        dues = self.get_object()
        dues.is_paid = True
        dues.save()
        return Response({'status': 'marked as paid'})
        
    @action(detail=False, methods=['get'])
    def student_dues(self, request):
        """Get all dues for a specific student"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response({'error': 'student_id parameter is required'}, status=400)
            
        try:
            student = StudentProfile.objects.get(id=student_id)
            dues = Dues.objects.filter(student=student)
            serializer = self.get_serializer(dues, many=True)
            return Response(serializer.data)
        except StudentProfile.DoesNotExist:
            return Response({'error': 'Student not found'}, status=404) 
        
