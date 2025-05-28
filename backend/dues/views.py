from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Dues, FeeStructure, AcademicDues
from .serializers import DuesSerializer, FeeStructureSerializer, AcademicDuesSerializer
from core.permisions.staff_permistion import IsStaffOfDepartment
from .filters import DuesFilter 
from rest_framework.permissions import IsAuthenticated, AllowAny
from core.models import StudentProfile, Department
import logging
from .permissions import IsAdminOrStaff
from django.db.models import Q

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
        
    def create(self, request, *args, **kwargs):
        logger.info("=== Creating new due ===")
        logger.info(f"Request data: {request.data}")
        logger.info(f"User: {request.user}")
        logger.info(f"Is authenticated: {request.user.is_authenticated}")
        
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                logger.info("Serializer is valid")
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                logger.error("Serializer validation errors:")
                logger.error(serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating due: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST) 
        

class FeeStructureViewSet(viewsets.ModelViewSet):
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer
    permission_classes = [IsAuthenticated, IsAdminOrStaff]

    def get_queryset(self):
        queryset = FeeStructure.objects.all()
        course_name = self.request.query_params.get('course_name', None)
        academic_year = self.request.query_params.get('academic_year', None)
        year = self.request.query_params.get('year', None)

        if course_name:
            queryset = queryset.filter(course_name=course_name)
        if academic_year:
            queryset = queryset.filter(academic_year=academic_year)
        if year:
            queryset = queryset.filter(year=year)

        return queryset

class AcademicDuesViewSet(viewsets.ModelViewSet):
    queryset = AcademicDues.objects.all()
    serializer_class = AcademicDuesSerializer
    permission_classes = [AllowAny]  # Allow any user for testing

    def get_queryset(self):
        queryset = AcademicDues.objects.all()
        if self.request.user.is_authenticated:
            if not self.request.user.is_staff:
                queryset = queryset.filter(student__user=self.request.user)
        else:
            # Return an empty queryset for unauthenticated users
            return AcademicDues.objects.none()
        
        payment_status = self.request.query_params.get('payment_status', None)
        year_of_study = self.request.query_params.get('year_of_study', None)

        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        if year_of_study:
            queryset = queryset.filter(year_of_study=year_of_study)

        return queryset

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error creating academic due: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
