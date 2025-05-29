from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import FeeStructure, Academic, DepartmentDue
from .serializers import  FeeStructureSerializer, AcademicSerializer, DepartmentDueSerializer
from core.permisions.staff_permistion import IsStaffOfDepartment

from rest_framework.permissions import IsAuthenticated, AllowAny
from core.models import StudentProfile
import logging
from .permissions import IsAdminOrStaff
from django.db.models import Q

logger = logging.getLogger(__name__)


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

class AcademicViewSet(viewsets.ModelViewSet):
    queryset = Academic.objects.all()
    serializer_class = AcademicSerializer
    permission_classes = [AllowAny]  # Allow any user for testing

    def get_queryset(self):
        # Allow staff to see all, students to see their own, unauthenticated to see all (for GET)
        user = self.request.user
        if not user.is_authenticated:
            return Academic.objects.all()
        if hasattr(user, 'is_staff') and user.is_staff:
            return Academic.objects.all()
        if hasattr(user, 'is_student') and user.is_student:
            return Academic.objects.filter(student__user=user)
        return Academic.objects.none()

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required for POST.'}, status=status.HTTP_401_UNAUTHORIZED)
        return super().create(request, *args, **kwargs)

class DepartmentDueViewSet(viewsets.ModelViewSet):
    queryset = DepartmentDue.objects.all()
    serializer_class = DepartmentDueSerializer
    permission_classes = [IsAuthenticated, IsAdminOrStaff]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return DepartmentDue.objects.none()
        if hasattr(user, 'is_staff') and user.is_staff:
            # Get staff profile and department
            staff_profile = getattr(user, 'staffprofile', None)
            if staff_profile:
                return DepartmentDue.objects.filter(department=staff_profile.department)
            return DepartmentDue.objects.none()
        return DepartmentDue.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminOrStaff])
    def mark_as_paid(self, request, pk=None):
        due = self.get_object()
        due.is_paid = True
        due.save()
        return Response({'status': 'marked as paid'})
        
