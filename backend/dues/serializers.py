from rest_framework import serializers
from .models import FeeStructure, AcademicRecords, HostelRecords, LibraryRecords, LegacyAcademicRecords
from core.serializers import StudentProfileSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
import logging
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)

class FeeStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeStructure
        fields = '__all__'

class AcademicRecordsSerializer(serializers.ModelSerializer):
    student = StudentProfileSerializer(read_only=True)
    due_amount = serializers.ReadOnlyField()
    
    class Meta:
        model = AcademicRecords
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username']


class HostelRecordsSerializer(serializers.ModelSerializer):
    student = StudentProfileSerializer(read_only=True)
    
    class Meta:
        model = HostelRecords
        fields = '__all__'


class LibraryRecordsSerializer(serializers.ModelSerializer):
    student = StudentProfileSerializer(read_only=True)
    
    class Meta:
        model = LibraryRecords
        fields = '__all__'

class LegacyAcademicRecordsSerializer(serializers.ModelSerializer):
    student = StudentProfileSerializer(read_only=True)
    formatted_due_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = LegacyAcademicRecords
        fields = '__all__'
    
    def get_formatted_due_amount(self, obj):
        return f"₹{obj.due_amount:,.2f}"
