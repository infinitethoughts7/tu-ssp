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
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    year_of_study = models.CharField(max_length=1, choices=DURATION_CHOICES)
    mess_bill = models.IntegerField(default=0)
    scholarship = models.IntegerField(default=0)
    deposit = models.IntegerField(default=0)
    # renewal_amount = models.IntegerField(default=0, null=True, blank=True)
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('student', 'year_of_study')  # Ensure one entry per year per student

    def __str__(self):
        return f"{self.student.user.username} - Year {self.year_of_study} Hostel Dues"


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
        verbose_name = "Legacy Academic Record"
        verbose_name_plural = "Legacy Academic Records"
        ordering = ['student__user__username']
    
    def __str__(self):
        if self.student:
            return f"{self.student.user.username} - Due: ₹{self.due_amount}"
        else:
            return f"Unmatched Record - Due: ₹{self.due_amount}"

