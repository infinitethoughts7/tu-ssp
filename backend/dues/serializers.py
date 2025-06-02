from rest_framework import serializers
from .models import FeeStructure, Academic, HostelDues, Challan
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
        fields = ['roll_number', 'full_name', 'phone_number', 'caste', 'course']

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
    student = StudentProfileSerializer(read_only=True)
    total_amount = serializers.SerializerMethodField()
    due_amount = serializers.SerializerMethodField()

    class Meta:
        model = HostelDues
        fields = [
            'id', 'student', 'year_of_study', 'mess_bill', 'scholarship',
            'deposit', 'remarks', 'total_amount', 'due_amount'
        ]

    def get_total_amount(self, obj):
        return obj.mess_bill or 0

    def get_due_amount(self, obj):
        mess_bill = obj.mess_bill or 0
        scholarship = obj.scholarship or 0
        deposit = obj.deposit or 0
        return mess_bill - (scholarship + deposit)

class ChallanSerializer(serializers.ModelSerializer):
    student_roll_number = serializers.CharField(write_only=True, required=True)
    student = StudentProfileSerializer(read_only=True)

    class Meta:
        model = Challan
        fields = [
            'id', 'student', 'department', 'image', 'amount', 'status', 'uploaded_by', 'verified_by',
            'uploaded_at', 'verified_at', 'remarks', 'student_roll_number'
        ]
        read_only_fields = ['uploaded_by', 'verified_by', 'uploaded_at', 'student']

    def create(self, validated_data):
        student_roll = validated_data.pop('student_roll_number')
        try:
            student = StudentProfile.objects.get(roll_number=student_roll)
            validated_data['student'] = student
        except StudentProfile.DoesNotExist:
            raise serializers.ValidationError({
                'student_roll_number': f'No student found with roll number: {student_roll}'
            })
        
        user = self.context['request'].user
        if user.is_authenticated:
            validated_data['uploaded_by'] = user
        return super().create(validated_data)
