from rest_framework import serializers
from .models import FeeStructure, Academic, DepartmentDue
from core.models import StudentProfile
from core.serializers import StudentProfileSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
import logging
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)

class FeeStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeStructure
        fields = ['course_name', 'tuition_fee', 'special_fee', 'other_fee', 'exam_fee']

class StudentProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = ['roll_number', 'full_name', 'phone_number']

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()

class AcademicSerializer(serializers.ModelSerializer):
    fee_structure = FeeStructureSerializer(read_only=True)
    student = StudentProfileSerializer(read_only=True)

    class Meta:
        model = Academic
        fields = [
            'id',
            'fee_structure',
            'student',
            'paid_by_govt',
            'paid_by_student',
            'academic_year_label',
            'payment_status',
            'remarks',
        ]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username']

class DepartmentDueSerializer(serializers.ModelSerializer):
    student = StudentProfileSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(queryset=StudentProfile.objects.all(), source="student", write_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = DepartmentDue
        fields = [
            "id", "student", "student_id", "department", "amount", "due_date", "description", "is_paid", "created_by", "created_at"
        ]
        read_only_fields = ("id", "created_by", "created_at", "is_paid") 