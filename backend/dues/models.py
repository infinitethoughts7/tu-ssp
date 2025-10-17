from django.db import models
from django.conf import settings
from core.models import StudentProfile, User, StaffProfile
from utils.constants import COURSE_CHOICES, DURATION_CHOICES

class FeeStructure(models.Model):
    course_name = models.CharField(max_length=100, choices=COURSE_CHOICES)
    academic_year = models.CharField(max_length=10)
    category = models.CharField(max_length=50)
    tuition_fee = models.IntegerField()
    special_fee = models.IntegerField(null=True, blank=True)
    other_fee = models.IntegerField(null=True, blank=True)
    exam_fee = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.course_name} - {self.academic_year}"

class AcademicRecords(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE , null=True, blank=True)
    paid_by_govt = models.IntegerField(default=0)
    paid_by_student = models.IntegerField(default=0)
    academic_year_label = models.CharField(max_length=2, choices=[('1', '1st Year'), ('2', '2nd Year')], default="1")
    payment_status = models.CharField(max_length=20, choices=[("Processing", "Processing"), ("Unpaid", "Unpaid"), ("Paid", "Paid")], default="Unpaid")
    remarks = models.TextField(blank=True, null=True)
    def __str__(self):
        return f"{self.student} - Year {self.academic_year_label}"

    @property
    def due_amount(self):
        return (self.fee_structure.tuition_fee or 0) + (self.fee_structure.special_fee or 0) + (self.fee_structure.exam_fee or 0) - (self.paid_by_govt + self.paid_by_student)

class HostelRecords(models.Model):
    """
    Hostel records for passed-out students - one record per student with year-wise columns.
    Maps directly to CSV columns: 1st_yearmessbill, 1st_years/ship, etc.
    """
    student = models.OneToOneField(StudentProfile, on_delete=models.CASCADE, related_name='hostel_records')
    
    # 1st Year Data
    first_year_mess_bill = models.IntegerField(default=0, help_text="1st year mess bill")
    first_year_scholarship = models.IntegerField(default=0, help_text="1st year scholarship")
    
    # 2nd Year Data
    second_year_mess_bill = models.IntegerField(default=0, help_text="2nd year mess bill")
    second_year_scholarship = models.IntegerField(default=0, help_text="2nd year scholarship")
    
    # 3rd Year Data
    third_year_mess_bill = models.IntegerField(default=0, help_text="3rd year mess bill")
    third_year_scholarship = models.IntegerField(default=0, help_text="3rd year scholarship")
    
    # 4th Year Data
    fourth_year_mess_bill = models.IntegerField(default=0, help_text="4th year mess bill")
    fourth_year_scholarship = models.IntegerField(default=0, help_text="4th year scholarship")
    
    # 5th Year Data
    fifth_year_mess_bill = models.IntegerField(default=0, help_text="5th year mess bill")
    fifth_year_scholarship = models.IntegerField(default=0, help_text="5th year scholarship")
    
    # Payment Information (one-time per student)
    deposit = models.IntegerField(default=0, help_text="Initial deposit amount")
    renewal_amount = models.IntegerField(default=0, blank=True, null=True, help_text="Renewal amount")
    f_challan1 = models.IntegerField(default=0, blank=True, null=True, help_text="First installment (f_cha1)")
    f_challan2 = models.IntegerField(default=0, blank=True, null=True, help_text="Second installment (f_cha_2)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.student.user.username} - Hostel Records"
    
    @property
    def total_challan_paid(self):
        """Total challan paid"""
        return (self.f_challan1 or 0) + (self.f_challan2 or 0)
    
    @property
    def total_mess_bill(self):
        """Total mess bill across all years"""
        return (self.first_year_mess_bill + self.second_year_mess_bill + 
                self.third_year_mess_bill + self.fourth_year_mess_bill + 
                self.fifth_year_mess_bill)
    
    @property
    def total_scholarship(self):
        """Total scholarship across all years"""
        return (self.first_year_scholarship + self.second_year_scholarship + 
                self.third_year_scholarship + self.fourth_year_scholarship + 
                self.fifth_year_scholarship)
    
    @property
    def total_due(self):
        """Calculate total due using the equation: deposit + total_challan + total_scholarship - total_mess_bill"""
        return self.deposit + self.total_challan_paid + self.total_scholarship - self.total_mess_bill
    
   


class LibraryRecords(models.Model):
    """
    Model to store individual library book borrowing records.
    Each record represents one book borrowed by one student.
    """
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='library_records')
    book_id = models.CharField(max_length=20, help_text="Book ID (e.g., h171, h1204, t215)")
    borrowing_date = models.DateField(help_text="Date when book was borrowed")
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Fine amount if overdue")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Library Record"
        verbose_name_plural = "Library Records"
        ordering = ['-borrowing_date', 'student__user__username']
    
    def __str__(self):
        status = "Returned" if self.is_returned else "Borrowed"
        return f"{self.student.user.username} - {self.book_id} ({status})"
    
    @property
    def is_returned(self):
        """Placeholder for return status"""
        return False


class LegacyAcademicRecords(models.Model):
    """
    Model to store legacy academic records from Admissions Excel import.
    This model stores the original data structure from the Excel file.
    """
    # Link to existing student profile (if exists)
    student = models.ForeignKey(
        StudentProfile, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='legacy_records',
        help_text="Link to existing student profile if found"
    )
    
    # Financial information
    due_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Amount due from student")
    
    # Administrative information
    tc_number = models.CharField(max_length=20, blank=True, null=True, help_text="Transfer Certificate number")
    tc_issued_date = models.DateField(blank=True, null=True, help_text="Transfer Certificate issued date")
    
    class Meta:
        verbose_name = "Academic Record"
        verbose_name_plural = "Academic Records"
        ordering = ['student__user__username']
    
    def __str__(self):
        if self.student:
            return f"{self.student.user.username} - Due: ₹{self.due_amount}"
        else:
            return f"Unmatched Record - Due: ₹{self.due_amount}"


class SportsRecords(models.Model):
    """
    Model to store individual sports equipment borrowing records.
    Each record represents one equipment borrowed by one student.
    """
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='sports_records')
    equipment_name = models.CharField(max_length=100, help_text="Name of the sports equipment (e.g., Football, Bat, Racket)")
    borrowing_date = models.DateField(help_text="Date when equipment was borrowed")
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Fine amount if not returned/missed submission")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Sports Record"
        verbose_name_plural = "Sports Records"
        ordering = ['-borrowing_date', 'student__user__username']

    def __str__(self):
        status = "Returned" if self.is_returned else "Borrowed"
        return f"{self.student.user.username} - {self.equipment_name} ({status})"

    @property
    def is_returned(self):
        """Placeholder for return status"""
        return False

