from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser, BaseUserManager

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
DEPARTMENT_CHOICES = [
    ('accounts', 'Accounts / Academic Section'),
    ('hostel', 'Hostel Section'),
    ('library', 'Library'),
    ('lab', 'Department / Lab'),
    ('sports', 'PE & Sports'),
]
DESIGNATION_CHOICES = [
    ('Librarian', 'Librarian'),
    ('Hostel Superintendent', 'Hostel Superintendent'),
    ('PE & Sports In-charge', 'PE & Sports In-charge'),
    ('Accounts Officer', 'Accounts Officer'),
    ('Department / Lab In-charge', 'Department / Lab In-charge'),
]
GENDER_CHOICES = [
    ('Male', 'Male'),
    ('Female', 'Female'),
    ('Other', 'Other'),
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
            roll_number=roll_number,
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
    roll_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    is_student = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    
    objects = CustomUserManager()

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'core_user'

class Department(models.Model):
    department = models.CharField(max_length=100 , choices=DEPARTMENT_CHOICES)  # eg: Library, Hostel, Academics
    designation = models.CharField(max_length=100, choices=DESIGNATION_CHOICES)

    def __str__(self):  
        return f"{self.department} - {self.designation}"

class StaffProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    phone_number = models.CharField(max_length=10)
    designation = models.CharField(max_length=100, blank=True)
    join_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.department.department}"

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    roll_number = models.CharField(max_length=20, unique=True)
    caste = models.CharField(max_length=10, choices=CASTE_CHOICES)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    phone_number = models.CharField(max_length=15)
    course = models.CharField(max_length=100, choices=COURSE_CHOICES)
    course_duration = models.CharField(max_length=10, choices=DURATION_CHOICES)
    year_of_study = models.CharField(max_length=10, choices=DURATION_CHOICES)
    is_hostel = models.BooleanField(default=False)
    def __str__(self):
        return f"{self.user.username} - {self.roll_number}"
