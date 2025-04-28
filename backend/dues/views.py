from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Dues
from .serializers import DuesSerializer
from core.permisions.staff_permistion import IsStaffOfDepartment
from .filters import DuesFilter 
from rest_framework.permissions import IsAuthenticated, AllowAny
from core.models import StudentProfile, Department
import logging

logger = logging.getLogger(__name__)

class DuesViewSet(viewsets.ModelViewSet): 
    queryset = Dues.objects.all()
    serializer_class = DuesSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DuesFilter
    search_fields = ['student__user__first_name', 'student__user__last_name', 'description']
    ordering_fields = ['amount', 'due_date', 'created_at']

    def get_queryset(self):
        # Log total dues per department
        logger.info("=== Department Dues Count ===")
        for dept in Department.objects.all():
            count = Dues.objects.filter(department=dept).count()
            logger.info(f"Department: {dept.department}, Total Dues: {count}")
        logger.info("=== End Department Dues Count ===")

        queryset = Dues.objects.all()
        
        # Debug logging
        logger.info("=== DuesViewSet get_queryset ===")
        logger.info(f"Request method: {self.request.method}")
        logger.info(f"Request path: {self.request.path}")
        logger.info(f"Request query params: {self.request.query_params}")
        logger.info(f"User: {self.request.user}")
        logger.info(f"Is authenticated: {self.request.user.is_authenticated}")
        
        # Filter by student ID if provided
        student_id = self.request.query_params.get('student_id', None)
        if student_id:
            try:
                student = StudentProfile.objects.get(id=student_id)
                queryset = queryset.filter(student=student)
                logger.info(f"Filtered by student ID: {student_id}")
            except StudentProfile.DoesNotExist:
                logger.warning(f"Student not found with ID: {student_id}")
                return Dues.objects.none()
        
        # Filter by department if provided in query params
        department_name = self.request.query_params.get('department', None)
        logger.info(f"Department from query params: {department_name}")
        
        if department_name:
            try:
                # Try to get the department by name (case-insensitive)
                department = Department.objects.get(department__iexact=department_name)
                logger.info(f"Found department: {department.department} (ID: {department.id})")
                queryset = queryset.filter(department=department)
                logger.info(f"Filtered by department: {department.department}")
                logger.info(f"Number of dues after filtering: {queryset.count()}")
                
                # Log some sample dues for debugging
                if queryset.exists():
                    logger.info("Sample dues found:")
                    for due in queryset[:3]:  # Log first 3 dues
                        logger.info(f"Due ID: {due.id}, Amount: {due.amount}, Student: {due.student.user.get_full_name()}, Department: {due.department.department}")
            except Department.DoesNotExist:
                logger.warning(f"Department not found: {department_name}")
                return Dues.objects.none()
        # If no department filter and user is authenticated staff, restrict to staff's department
        elif self.request.user.is_authenticated and hasattr(self.request.user, 'is_staff') and self.request.user.is_staff:
            try:
                staff_dept = self.request.user.staff_profile.department
                queryset = queryset.filter(department=staff_dept)
                logger.info(f"Filtered by staff department: {staff_dept.department}")
            except Exception as e:
                logger.error(f"Error filtering by staff department: {str(e)}")
                return Dues.objects.none()
        # Filter by student if student user
        elif self.request.user.is_authenticated and hasattr(self.request.user, 'is_student') and self.request.user.is_student:
            queryset = queryset.filter(student__user=self.request.user)
            logger.info("Filtered by student user")
        
        logger.info(f"Final queryset count: {queryset.count()}")
        logger.info("=== End DuesViewSet get_queryset ===")
        return queryset

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user

        # Restrict staff to only update dues in their own department
        if hasattr(user, 'staff_profile'):
            if instance.department != user.staff_profile.department:
                return Response({"detail": "You do not have permission to update this due."}, status=403)

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
        
