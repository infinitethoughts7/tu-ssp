from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import FeeStructure, Academic, HostelDues
from .serializers import  FeeStructureSerializer, AcademicSerializer, HostelDuesSerializer
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



class HostelDuesViewSet(viewsets.ModelViewSet):
    queryset = HostelDues.objects.all()
    serializer_class = HostelDuesSerializer
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
