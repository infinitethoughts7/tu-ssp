from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser, BaseUserManager

COURSE_CHOICES = [
    # 2-Year Programs
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
    ("M.Sc. (Computer Science)", "M.Sc. (Computer Science)"),
    ("M.Sc. (Food Science & Technology)", "M.Sc. (Food Science & Technology)"),
    ("M.Sc. (Geo Informatics)", "M.Sc. (Geo Informatics)"),
    ("M.Sc. (Mathematics)", "M.Sc. (Mathematics)"),
    ("M.Sc. (Nutrition & Dietetics)", "M.Sc. (Nutrition & Dietetics)"),
    ("M.Sc. (Physics)", "M.Sc. (Physics)"),
    ("M.Sc. (Physics - 2 Years with specialization in Electronics)", "M.Sc. (Physics - 2 Years with specialization in Electronics)"),
    ("M.Sc. (Statistics)", "M.Sc. (Statistics)"),
    ("M.Sc. (Zoology)", "M.Sc. (Zoology)"),
    ("M.B.A", "M.B.A"),
    ("M.C.A", "M.C.A"),
    ("LL.M (2 Years)", "LL.M (2 Years)"),
    ("M.Ed.", "M.Ed."),
    
    # 3-Year Programs
    ("LL.B (3 Years)", "LL.B (3 Years)"),
    
    # 5-Year Programs
    ("M.A. (Applied Economics - 5 Years)", "M.A. (Applied Economics - 5 Years)"),
    ("M.Sc. (Chemistry - 5 Years Integrated with specialization in Pharmaceutical Chemistry)", "M.Sc. (Chemistry - 5 Years Integrated with specialization in Pharmaceutical Chemistry)"),
    ("IMBA (Integrated Master of Business Management) (5 Yrs Integrated)", "IMBA (Integrated Master of Business Management) (5 Yrs Integrated)"),
    
    # Other Programs (Duration not specified)
    ("B.Lib.Sc", "B.Lib.Sc"),
    ("B.Ed.", "B.Ed."),
    ("B.P.Ed.", "B.P.Ed."),
]

DURATION_CHOICES = [
    ('2 Years', '2 Years'),
    ('5 Years', '5 Years'),
]

CASTE_CHOICES = [
    ('SC', 'SC'),
    ('ST', 'ST'),
    ('BC-A', 'BC-A'),
    ('BC-B', 'BC-B'),
    ('BC-C', 'BC-C'),
    ('BC-D', 'BC-D'),
    ('BC-E', 'BC-E'),
    ('OC', 'OC'),
    ('Other', 'Other'),
]

GENDER_CHOICES = [
    ('Male', 'Male'),
    ('Female', 'Female'),
    ('Other', 'Other'),
]
DEPARTMENT_CHOICES = [
    ('accountant', 'Accountant'),
    ('hostel_superintendent', 'Hostel Superintendent'),
    ('librarian', 'Librarian'),
    ('lab_incharge', 'Lab In-charge'),
    ('sports_incharge', 'PE & Sports In-charge'),
]
DESIGNATION_CHOICES = [
    ('Accountant', 'Accountant'),
    ('Hostel Superintendent', 'Hostel Superintendent'),
    ('Librarian', 'Librarian'),
    ('Lab In-charge', 'Lab In-charge'),
    ('PE & Sports In-charge', 'PE & Sports In-charge'),
]

# Custom user manager to handle creating users without username
class CustomUserManager(BaseUserManager):
    def create_user(self, email=None, roll_number=None, password=None, **extra_fields):
        if not (email or roll_number):
            raise ValueError('Either email or roll number must be set')
        
        if email:
            email = self.normalize_email(email)
        
        # Set username as roll_number for students, email for staff
        if 'username' not in extra_fields:
            extra_fields['username'] = roll_number if roll_number else email
        
        user = self.model(
            email=email,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email=username, password=password, **extra_fields)

# Custom User model without username
class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True)  # Keep username field
    email = models.EmailField(unique=True, null=True, blank=True)
    is_student = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    
    objects = CustomUserManager()

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'core_user'

class StaffProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES)
    designation = models.CharField(max_length=50, choices=DESIGNATION_CHOICES)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    phone_number = models.CharField(max_length=10)
    join_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_department_display()}"


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    caste = models.CharField(max_length=10, choices=CASTE_CHOICES)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    phone_number = models.CharField(max_length=15)
    course = models.CharField(max_length=100, choices=COURSE_CHOICES)
    course_duration = models.CharField(max_length=10, choices=DURATION_CHOICES)
    year_of_study = models.CharField(max_length=10, choices=DURATION_CHOICES)
    is_hostel = models.BooleanField(default=False)
    def __str__(self):
        return f"{self.user.username}"
