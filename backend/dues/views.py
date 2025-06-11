from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import FeeStructure, Academic, HostelDues, OtherDue
from .serializers import  FeeStructureSerializer, AcademicSerializer, HostelDuesSerializer, OtherDueSerializer
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
    permission_classes = [IsAuthenticated]  # Enforce authentication

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Academic.objects.none()  # Unauthenticated users see nothing
        if hasattr(user, 'is_staff') and user.is_staff:
            return Academic.objects.all()  # Staff see all
        if hasattr(user, 'is_student') and user.is_student:
            return Academic.objects.filter(student__user=user)  # Student sees only their own
        return Academic.objects.none()

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required for POST.'}, status=status.HTTP_401_UNAUTHORIZED)
        return super().create(request, *args, **kwargs)



class HostelDuesViewSet(viewsets.ModelViewSet):
    queryset = HostelDues.objects.select_related('student').all()
    serializer_class = HostelDuesSerializer
    permission_classes = [IsAuthenticated]  # Enforce authentication

    def get_queryset(self):
        user = self.request.user
        qs = HostelDues.objects.select_related('student', 'student__user').all()
        if not user.is_authenticated:
            return HostelDues.objects.none()
        if hasattr(user, 'is_staff') and user.is_staff:
            return qs
        if hasattr(user, 'is_student') and user.is_student:
            return qs.filter(student__user=user)
        return HostelDues.objects.none()

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            
            # Group dues by student
            student_dues = {}
            for due in queryset:
                student_id = due.student.id
                if student_id not in student_dues:
                    student_dues[student_id] = []
                student_dues[student_id].append(due)

            # Calculate totals for each student
            result = []
            for student_id, dues in student_dues.items():
                # Serialize individual dues
                serialized_dues = self.get_serializer(dues, many=True).data
                
                # Calculate totals across all years
                total_mess_bill = sum(due.mess_bill or 0 for due in dues)
                total_scholarship = sum(due.scholarship or 0 for due in dues)
                total_deposit = sum(due.deposit or 0 for due in dues)
                total_due = total_mess_bill - (total_scholarship + total_deposit)

                # Add totals to the first due entry
                if serialized_dues:
                    serialized_dues[0]['total_mess_bill'] = total_mess_bill
                    serialized_dues[0]['total_scholarship'] = total_scholarship
                    serialized_dues[0]['total_deposit'] = total_deposit
                    serialized_dues[0]['total_due'] = total_due
                
                result.extend(serialized_dues)

            return Response(result)
        except Exception as e:
            logger.error(f"Error in list view: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

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

# class ChallanViewSet(viewsets.ModelViewSet):
#     queryset = Challan.objects.all()
#     serializer_class = ChallanSerializer
#     permission_classes = [AllowAny]  # Allow any for development/testing

#     def get_queryset(self):
#         user = self.request.user
#         if not user.is_authenticated:
#             return Challan.objects.none()  # Unauthenticated users see nothing
#         if hasattr(user, 'is_staff') and user.is_staff:
#             return Challan.objects.all()
#         if hasattr(user, 'is_student') and user.is_student:
#             return Challan.objects.filter(student__user=user)
#         return Challan.objects.none()

#     def perform_create(self, serializer):
#         user = self.request.user
#         if user.is_authenticated:
#             serializer.save(uploaded_by=user)
#         else:
#             serializer.save()

class OtherDueViewSet(viewsets.ModelViewSet):
    queryset = OtherDue.objects.all()
    serializer_class = OtherDueSerializer
    permission_classes = [IsAuthenticated]

    CATEGORY_MAP = {
        'librarian': 'library',
        'sports_incharge': 'sports',
        'lab_incharge': 'lab',
    }

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not hasattr(user, 'staff_profile'):
            return OtherDue.objects.none()
        staff = user.staff_profile
        category = self.request.query_params.get('category')
        # If no category is provided, use the staff's department mapping
        if not category:
            category = self.CATEGORY_MAP.get(staff.department, staff.department)
        queryset = OtherDue.objects.filter(category=category)
        return queryset

    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Creating other due with data: {request.data}")
            # Ensure category is set from staff's department if not provided
            if 'category' not in request.data:
                staff = request.user.staff_profile
                request.data['category'] = self.CATEGORY_MAP.get(staff.department, staff.department)
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error creating other due: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.staff_profile)
        
