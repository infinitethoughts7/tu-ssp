from django.db import models
from django.conf import settings
from core.models import Department, StudentProfile

COURSE_CHOICES = [
    ("M.A. (Applied Economics - 5 Years)", "M.A. (Applied Economics - 5 Years)"),
    ("M.A. (Economics)", "M.A. (Economics)"),
    ("M.A. (English)", "M.A. (English)"),
    ("M.A. (Hindi)", "M.A. (Hindi)"),
    ("M.A. (Mass Communication)", "M.A. (Mass Communication)"),
    ("M.A. (Public Administration)", "M.A. (Public Administration)"),
    ("M.A. (Telugu Studies)", "M.A. (Telugu Studies)"),
    ("M.A. (Telugu Studies - Comparative Literature)", "M.A. (Telugu Studies - Comparative Literature)"),
    ("M.A. (Urdu)", "M.A. (Urdu)"),
    ("M.A. (History)", "M.A. (History)"),
    ("M.A. (Political Science)", "M.A. (Political Science)"),
    ("M.Com. (e-Commerce)", "M.Com. (e-Commerce)"),
    ("M.Com. (General)", "M.Com. (General)"),
    ("M.S.W", "M.S.W"),
    ("M.Sc. (Applied Statistics)", "M.Sc. (Applied Statistics)"),
    ("M.Sc. (Bio-Technology)", "M.Sc. (Bio-Technology)"),
    ("M.Sc. (Botany)", "M.Sc. (Botany)"),
    ("M.Sc. (Chemistry - 2 Years Course in specialization with Organic Chemistry)", "M.Sc. (Chemistry - 2 Years Course in specialization with Organic Chemistry)"),
    ("M.Sc. (Chemistry - 2 Years with specialization in Pharmaceutical Chemistry)", "M.Sc. (Chemistry - 2 Years with specialization in Pharmaceutical Chemistry)"),
    ("M.Sc. (Chemistry - 5 Years Integrated with specialization in Pharmaceutical Chemistry)", "M.Sc. (Chemistry - 5 Years Integrated with specialization in Pharmaceutical Chemistry)"),
    ("M.Sc. (Computer Science)", "M.Sc. (Computer Science)"),
    ("M.Sc. (Food Science & Technology)", "M.Sc. (Food Science & Technology)"),
    ("M.Sc. (Geo Informatics)", "M.Sc. (Geo Informatics)"),
    ("M.Sc. (Mathematics)", "M.Sc. (Mathematics)"),
    ("M.Sc. (Nutrition & Dietetics)", "M.Sc. (Nutrition & Dietetics)"),
    ("M.Sc. (Physics)", "M.Sc. (Physics)"),
    ("M.Sc. (Physics - 2 Years with specialization in Electronics)", "M.Sc. (Physics - 2 Years with specialization in Electronics)"),
    ("M.Sc. (Statistics)", "M.Sc. (Statistics)"),
    ("M.Sc. (Zoology)", "M.Sc. (Zoology)"),
    ("IMBA (Integrated Master of Business Management) (5 Yrs Integrated)", "IMBA (Integrated Master of Business Management) (5 Yrs Integrated)"),
    ("M.B.A", "M.B.A"),
    ("M.C.A", "M.C.A"),
    ("LL.B (3 Years)", "LL.B (3 Years)"),
    ("LL.M (2 Years)", "LL.M (2 Years)"),
    ("B.Lib.Sc", "B.Lib.Sc"),
    ("B.Ed.", "B.Ed."),
    ("M.Ed.", "M.Ed."),
    ("B.P.Ed.", "B.P.Ed."),
]
DURATION_CHOICES = [
    ("1st Year", "1st Year"),
    ("2nd Year", "2nd Year"),
]
class FeeStructure(models.Model):
    course_name = models.CharField(max_length=100, choices=COURSE_CHOICES)
    academic_year = models.CharField(max_length=10)
    category = models.CharField(max_length=50)
    year = models.PositiveSmallIntegerField()
    tuition_fee = models.IntegerField()
    special_fee = models.IntegerField(null=True, blank=True)
    other_fee = models.IntegerField(null=True, blank=True)
    exam_fee = models.IntegerField(null=True, blank=True)
    first_year_mess_bill = models.IntegerField(null=True, blank=True)
    second_year_mess_bill = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.course_name} - Year {self.year}"

class AcademicDues(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    tuition_fee = models.ForeignKey(FeeStructure, on_delete=models.CASCADE, related_name='tuition_fee_dues')
    special_fee = models.ForeignKey(FeeStructure, on_delete=models.CASCADE, related_name='special_fee_dues')
    paid_by_govt = models.IntegerField(default=0)
    paid_by_student = models.IntegerField(default=0)
    payment_status = models.CharField(max_length=20, choices=[("Processing", "Processing"), ("Unpaid", "Unpaid"), ("Paid", "Paid")])
    year_of_study = models.CharField(max_length=10, choices=DURATION_CHOICES)
    remarks = models.TextField(blank=True, null=True)
    def __str__(self):
        return f"{self.student} - Year {self.year_of_study}"
    
class Dues(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='student_dues')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='department_dues')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    description = models.TextField()
    is_paid = models.BooleanField(default=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_dues')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Dues"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.amount} - {self.due_date}" 
    



    