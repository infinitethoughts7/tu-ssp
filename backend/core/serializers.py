from rest_framework import serializers
from .models import User, StudentProfile, StaffProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'is_student', 'is_staff', 'first_name', 'last_name')

class StudentLoginSerializer(serializers.Serializer):
    roll_number = serializers.CharField()
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
    user = UserSerializer()
    
    class Meta:
        model = StudentProfile
        fields = ('user', 'course', 'course_duration', 'caste', 'gender', 'phone_number')

class StaffProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = StaffProfile
        fields = ('user', 'department', 'designation', 'gender', 'phone_number') 