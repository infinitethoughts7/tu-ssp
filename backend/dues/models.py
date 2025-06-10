from django.db import models
from django.conf import settings
from core.models import StudentProfile, User, StaffProfile

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
    ('1', '1'),
    ('2', '2'),
    ('3', '3'),
    ('5', '5'),
]

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

class Academic(models.Model):
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

class HostelDues(models.Model):
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
        return f"{self.student.roll_number} - Year {self.year_of_study} Hostel Dues"


class OtherDue(models.Model):
    CATEGORY_CHOICES = [
        ('librarian', 'Librarian'),
        ('sports_incharge', 'Sports Incharge'),
        ('lab_incharge', 'Lab Incharge'),
        # Add more as needed
    ]
    student = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name='other_dues', null=True, blank=True
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    remark = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        StaffProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_other_dues'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'category')

    def __str__(self):
        return f"{self.student} - {self.category} - {self.amount}"


    



    