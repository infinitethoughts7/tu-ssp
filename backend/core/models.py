from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser, BaseUserManager

COURSE_CHOICES = [
    ('M.A English', 'M.A English'),
    ('M.A Hindi', 'M.A Hindi'),
    ('M.A Mass Communication', 'M.A Mass Communication'),
    ('M.A Telugu Studies', 'M.A Telugu Studies'),
    ('M.A Urdu', 'M.A Urdu'),
    ('M.A Applied Economics (5 Years Integrated)', 'M.A Applied Economics (5 Years Integrated)'),
    ('M.S.W Social Work', 'M.S.W Social Work'),
    ('M.Com Commerce', 'M.Com Commerce'),
    ('M.Sc Applied Statistics', 'M.Sc Applied Statistics'),
    ('M.Sc Biotechnology', 'M.Sc Biotechnology'),
    ('M.Sc Botany', 'M.Sc Botany'),
    ('M.Sc Geo-Informatics', 'M.Sc Geo-Informatics'),
    ('M.Sc Organic Chemistry', 'M.Sc Organic Chemistry'),
    ('M.Sc Pharmaceutical Chemistry (5 Years Integrated)', 'M.Sc Pharmaceutical Chemistry (5 Years Integrated)'),
    ('M.Sc Physics with Electronics', 'M.Sc Physics with Electronics'),
    ('M.B.A Business Management', 'M.B.A Business Management'),
    ('M.C.A Computer Science & Engineering', 'M.C.A Computer Science & Engineering'),
    ('L.L.B Law', 'L.L.B Law'),
    ('L.L.M Law', 'L.L.M Law'),
    ('M.A Economics', 'M.A Economics'),
    ('M.Sc Mathematics', 'M.Sc Mathematics'),
    ('M.A Public Administration', 'M.A Public Administration'),
    ('M.Sc Pharmaceutical Chemistry', 'M.Sc Pharmaceutical Chemistry'),
    ('I.M.B.A Business Management (5 Years Integrated)', 'I.M.B.A Business Management (5 Years Integrated)'),
    ('M.Ed', 'M.Ed'),
    ('B.Ed', 'B.Ed'),
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

    def __str__(self):
        return f"{self.user.username} - {self.roll_number}"
