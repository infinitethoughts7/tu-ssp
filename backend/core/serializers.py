from rest_framework import serializers
from .models import User, StudentProfile, StaffProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'is_student', 'is_staff', 'first_name', 'last_name')

class StudentLoginSerializer(serializers.Serializer):
    username = serializers.CharField()  # Roll number for students
    password = serializers.CharField(write_only=True)

class StaffLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate_email(self, value):
        # Convert email to lowercase for consistency
        return value.lower()

    def validate(self, data):
        # Additional validation can be added here if needed
        return data


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = ('id', 'user', 'course', 'course_name', 'caste', 'gender', 'mobile_number', 'batch')

class StaffProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department_display = serializers.CharField(source='get_department_display', read_only=True)
    
    class Meta:
        model = StaffProfile
        fields = ('id', 'user', 'department', 'department_display', 'gender', 'phone_number', 'join_date') 