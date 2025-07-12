from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser, BaseUserManager
from utils.constants import (
    COURSE_CHOICES, DURATION_CHOICES,CASTE_CHOICES, 
    GENDER_CHOICES, BATCH_CHOICES, DEPARTMENT_CHOICES, 
)

class Course(models.Model):
    name = models.CharField(max_length=255, unique=True, choices=COURSE_CHOICES)
    course_duration = models.CharField(max_length=1, choices=DURATION_CHOICES)

    def __str__(self):
        return f"{self.name} ({self.course_duration} Years)"
# Custom user manager to handle creating users
class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('Username must be set')
        
        # For staff users, username should be email
        if extra_fields.get('is_staff', False):
            email = self.normalize_email(username)
            extra_fields['email'] = email
        
        user = self.model(
            username=username,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username=username, password=password, **extra_fields)

# Custom User model
class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True)  # Roll number for students, email for staff
    email = models.EmailField(unique=True, null=True, blank=True)
    is_student = models.BooleanField(default=False)

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
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    phone_number = models.CharField(max_length=10)
    join_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_department_display()}"


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    caste = models.CharField(max_length=10, choices=CASTE_CHOICES, blank=True, null=True)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    mobile_number = models.CharField(max_length=11, blank=True, null=True)
    batch = models.CharField(max_length=10, choices=BATCH_CHOICES, blank=True, null=True)
    def __str__(self):
        return f"{self.user.username}"

