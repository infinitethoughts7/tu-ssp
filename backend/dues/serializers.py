from rest_framework import serializers
from .models import FeeStructure, Academic, HostelDues
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
        fields = ['roll_number', 'full_name', 'phone_number', 'caste']

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()

class AcademicSerializer(serializers.ModelSerializer):
    fee_structure = FeeStructureSerializer(read_only=True)
    student = StudentProfileSerializer(read_only=True)
    due_amount = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    unpaid_amount = serializers.SerializerMethodField()

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
            'due_amount',
            'total_amount',
            'unpaid_amount',
        ]

    def get_due_amount(self, obj):
        tuition = obj.fee_structure.tuition_fee or 0
        special = obj.fee_structure.special_fee or 0
        paid_student = obj.paid_by_student or 0
        paid_govt = obj.paid_by_govt or 0
        exam = obj.fee_structure.exam_fee or 0
        return (tuition + special + exam) - (paid_student + paid_govt)

    def get_total_amount(self, obj):
        tuition = obj.fee_structure.tuition_fee or 0
        special = obj.fee_structure.special_fee or 0
        exam = obj.fee_structure.exam_fee or 0
        return tuition + special + exam

    def get_unpaid_amount(self, obj):
        tuition = obj.fee_structure.tuition_fee or 0
        special = obj.fee_structure.special_fee or 0
        paid_student = obj.paid_by_student or 0
        paid_govt = obj.paid_by_govt or 0
        exam = obj.fee_structure.exam_fee or 0
        return (tuition + special + exam) - (paid_student + paid_govt)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username']


class HostelDuesSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_caste = serializers.CharField(source='student.caste', read_only=True)
    student_phone = serializers.CharField(source='student.phone_number', read_only=True)
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)

    class Meta:
        model = HostelDues
        fields = ['id', 'student', 'student_name', 'student_roll', 'student_caste', 'student_phone', 
                 'year_of_study', 'mess_bill', 'scholarship', 'deposit', 'remarks']

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}".strip() 