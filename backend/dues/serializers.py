from rest_framework import serializers
from .models import Dues
from core.models import StudentProfile, Department
from core.serializers import StudentProfileSerializer, DepartmentSerializer
from rest_framework.permissions import IsAuthenticated
class DuesSerializer(serializers.ModelSerializer):
    student_details = StudentProfileSerializer(source='student', read_only=True)
    department_details = DepartmentSerializer(source='department', read_only=True)
    permission_classes = [IsAuthenticated]

    class Meta:
        model = Dues
        fields = [
            'id', 'student', 'student_details', 'department', 'department_details',
            'amount', 'due_date', 'description', 'is_paid', 'created_by',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def validate(self, data):
        staff = self.context['request'].user.staff_profile
        if data['department'] != staff.department:
            raise serializers.ValidationError("You can only assign dues for your own department.")
        return data

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data) 