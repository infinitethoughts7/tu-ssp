from rest_framework import serializers
from .models import Dues, FeeStructure, AcademicDues
from core.models import StudentProfile, Department
from core.serializers import StudentProfileSerializer, DepartmentSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
import logging

logger = logging.getLogger(__name__)

class DuesSerializer(serializers.ModelSerializer):
    student_details = StudentProfileSerializer(source='student', read_only=True)
    department_details = DepartmentSerializer(source='department', read_only=True)
    permission_classes = [AllowAny]

    # Override the default field definitions
    student = serializers.CharField(write_only=True)
    department = serializers.CharField(write_only=True)

    class Meta:
        model = Dues
        fields = [
            'id', 'student', 'student_details', 'department', 'department_details',
            'amount', 'due_date', 'description', 'is_paid', 'created_by',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def validate_amount(self, value):
        try:
            return float(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError("Amount must be a valid number")

    def validate(self, data):
        logger.info(f"Validating data: {data}")
        staff = self.context['request'].user.staff_profile
        logger.info(f"Staff department: {staff.department}")
        logger.info(f"Data department: {data['department']}")
        
        # Compare department names instead of objects
        if data['department'] != staff.department.department:
            raise serializers.ValidationError("You can only assign dues for your own department.")
        return data

    def to_internal_value(self, data):
        logger.info(f"Converting data to internal value: {data}")
        internal_data = super().to_internal_value(data)
        logger.info(f"Internal data: {internal_data}")
        return internal_data

    def create(self, validated_data):
        logger.info(f"Creating due with validated data: {validated_data}")
        
        # Get student profile from roll number
        try:
            student_profile = StudentProfile.objects.get(roll_number=validated_data['student'])
            logger.info(f"Found student profile: {student_profile}")
            validated_data['student'] = student_profile
        except StudentProfile.DoesNotExist:
            logger.error(f"Student not found with roll number: {validated_data['student']}")
            raise serializers.ValidationError("Student not found")

        # Get department from name
        try:
            department = Department.objects.get(department=validated_data['department'])
            logger.info(f"Found department: {department}")
            validated_data['department'] = department
        except Department.DoesNotExist:
            logger.error(f"Department not found: {validated_data['department']}")
            raise serializers.ValidationError("Department not found")

        validated_data['created_by'] = self.context['request'].user
        logger.info(f"Final validated data: {validated_data}")
        
        try:
            due = super().create(validated_data)
            logger.info(f"Successfully created due: {due}")
            return due
        except Exception as e:
            logger.error(f"Error creating due: {str(e)}")
            raise

class FeeStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeStructure
        fields = '__all__'

class AcademicDuesSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()
    permission_classes = [AllowAny]

    class Meta:
        model = AcademicDues
        fields = '__all__'

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"

    def get_course_name(self, obj):
        return obj.tuition_fee.course_name 