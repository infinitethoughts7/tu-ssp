from rest_framework import serializers
from .models import FeeStructure, AcademicRecords, HostelRecords, LibraryRecords, LegacyAcademicRecords, SportsRecords
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

class HostelDuesSerializer(serializers.ModelSerializer):
    """
    Serializer for hostel dues with year-wise breakdown
    """
    student = StudentProfileSerializer(read_only=True)
    dues = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    due_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = HostelRecords
        fields = ['id', 'student', 'dues', 'total_amount', 'due_amount']
    
    def get_dues(self, obj):
        """Transform hostel records into year-wise dues format"""
        dues = []
        course_name = obj.student.course.name if obj.student.course else "N/A"
        
        try:
            # Import the utility function
            from utils.course_utils import get_relevant_years_for_course
            relevant_years = get_relevant_years_for_course(course_name)
            
            # Create dues for each relevant year
            for year in relevant_years:
                if year == 1:
                    mess_bill = obj.first_year_mess_bill
                    scholarship = obj.first_year_scholarship
                elif year == 2:
                    mess_bill = obj.second_year_mess_bill
                    scholarship = obj.second_year_scholarship
                elif year == 3:
                    mess_bill = obj.third_year_mess_bill
                    scholarship = obj.third_year_scholarship
                elif year == 4:
                    mess_bill = obj.fourth_year_mess_bill
                    scholarship = obj.fourth_year_scholarship
                elif year == 5:
                    mess_bill = obj.fifth_year_mess_bill
                    scholarship = obj.fifth_year_scholarship
                else:
                    continue
                
                # Calculate total and due amounts for this year
                total_amount = mess_bill
                due_amount = mess_bill - scholarship
                
                dues.append({
                    'id': f"{obj.id}_year_{year}",
                    'year_of_study': f"{year}st Year" if year == 1 else f"{year}nd Year" if year == 2 else f"{year}rd Year" if year == 3 else f"{year}th Year",
                    'mess_bill': mess_bill,
                    'scholarship': scholarship,
                    'deposit': obj.deposit if year == 1 else 0,  # Only show deposit for first year
                    'remarks': f"Year {year} hostel dues",
                    'total_amount': total_amount,
                    'due_amount': due_amount,
                    'student': {
                        'roll_number': obj.student.user.username,
                        'full_name': f"{obj.student.user.first_name or ''} {obj.student.user.last_name or ''}".strip() or 'Unknown',
                        'phone_number': obj.student.mobile_number or 'N/A',
                        'caste': obj.student.caste or 'N/A',
                        'course': course_name,
                    }
                })
        except Exception as e:
            print(f"Error in get_dues for record {obj.id}: {str(e)}")
            # Return empty dues list if there's an error
            pass
        
        return dues
    
    def get_total_amount(self, obj):
        """Calculate total mess bill amount"""
        return (obj.first_year_mess_bill + obj.second_year_mess_bill + 
                obj.third_year_mess_bill + obj.fourth_year_mess_bill + 
                obj.fifth_year_mess_bill)
    
    def get_due_amount(self, obj):
        """Calculate total due amount"""
        return obj.total_due


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


class SportsRecordsSerializer(serializers.ModelSerializer):
    student = StudentProfileSerializer(read_only=True)
    
    class Meta:
        model = SportsRecords
        fields = '__all__'
    
    def create(self, validated_data):
        # Handle student field properly during creation
        student_id = self.context.get('student_id')
        if student_id:
            from core.models import StudentProfile
            try:
                student = StudentProfile.objects.get(id=student_id)
                validated_data['student'] = student
            except StudentProfile.DoesNotExist:
                raise serializers.ValidationError("Student not found")
        return super().create(validated_data)
