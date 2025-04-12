from django.core.management.base import BaseCommand
from core.models import User, Department, StaffProfile, StudentProfile
from datetime import date
from django.contrib.auth import authenticate

class Command(BaseCommand):
    help = 'Populate database with initial data'

    def handle(self, *args, **kwargs):
        # Create departments
        departments = {
            'LIBRARY': Department.objects.create(department='library', designation='Librarian'),
            'HOSTEL': Department.objects.create(department='hostel', designation='Hostel Superintendent'),
            'ACADEMICS': Department.objects.create(department='accounts', designation='Accounts Officer'),
            'SPORTS': Department.objects.create(department='sports', designation='PE & Sports In-charge'),
            'LAB': Department.objects.create(department='lab', designation='Department / Lab In-charge'),
        }

        # Create staff members with more details
        staff_data = [
            {
                'email': 'librarian@tu.com',
                'password': 'librarian@tu',
                'department': 'LIBRARY',
                'phone_number': '9876543210',
                'designation': 'Librarian',
                'name': 'Dr. Ramesh Kumar',
                'gender': 'Male'
            },
            {
                'email': 'hostel@tu.com',
                'password': 'hostel@tu',
                'department': 'HOSTEL',
                'phone_number': '9876543211',
                'designation': 'Hostel Superintendent',
                'name': 'Mr. Suresh Reddy',
                'gender': 'Male'
            },
            {
                'email': 'academics@tu.com',
                'password': 'academics@tu',
                'department': 'ACADEMICS',
                'phone_number': '9876543212',
                'designation': 'Accounts Officer',
                'name': 'Dr. Priya Sharma',
                'gender': 'Female'
            },
            {
                'email': 'sports@tu.com',
                'password': 'sports@tu',
                'department': 'SPORTS',
                'phone_number': '9876543213',
                'designation': 'PE & Sports In-charge',
                'name': 'Mr. Arjun Singh',
                'gender': 'Male'
            },
            {
                'email': 'lab@tu.com',
                'password': 'lab@tu',
                'department': 'LAB',
                'phone_number': '9876543214',
                'designation': 'Department / Lab In-charge',
                'name': 'Dr. Meera Patel',
                'gender': 'Female'
            }
        ]

        for staff in staff_data:
            user = self.create_staff(staff, departments[staff['department']])
            self.stdout.write(self.style.SUCCESS(f'Created staff member: {staff["name"]} ({staff["email"]})'))

        # Create sample students with more details
        student_data = [
            {
                'roll_number': '5000000001',
                'name': 'Aarav Sharma',
                'email': 'aarav.sharma@tu.com',
                'phone': '9876540001',
                'course': 'M.Tech Computer Science',
                'duration': '2 Years',
                'caste': 'OC',
                'gender': 'Male',
                'is_active': True
            },
            {
                'roll_number': '5000000002',
                'name': 'Priya Patel',
                'email': 'priya.patel@tu.com',
                'phone': '9876540002',
                'course': 'M.Sc Biotechnology',
                'duration': '2 Years',
                'caste': 'SC',
                'gender': 'Female',
                'is_active': True
            },
            {
                'roll_number': '5000000003',
                'name': 'Rahul Verma',
                'email': 'rahul.verma@tu.com',
                'phone': '9876540003',
                'course': 'M.A English',
                'duration': '2 Years',
                'caste': 'BC-A',
                'gender': 'Male',
                'is_active': True
            },
            {
                'roll_number': '5000000004',
                'name': 'Sneha Reddy',
                'email': 'sneha.reddy@tu.com',
                'phone': '9876540004',
                'course': 'M.Com Commerce',
                'duration': '2 Years',
                'caste': 'BC-B',
                'gender': 'Female',
                'is_active': True
            },
            {
                'roll_number': '5000000005',
                'name': 'Vikram Singh',
                'email': 'vikram.singh@tu.com',
                'phone': '9876540005',
                'course': 'M.B.A Business Management',
                'duration': '2 Years',
                'caste': 'OC',
                'gender': 'Male',
                'is_active': True
            },
            {
                'roll_number': '5000000006',
                'name': 'Ananya Gupta',
                'email': 'ananya.gupta@tu.com',
                'phone': '9876540006',
                'course': 'M.Sc Mathematics',
                'duration': '2 Years',
                'caste': 'BC-C',
                'gender': 'Female',
                'is_active': True
            },
            {
                'roll_number': '5000000007',
                'name': 'Karthik Kumar',
                'email': 'karthik.kumar@tu.com',
                'phone': '9876540007',
                'course': 'M.C.A Computer Science & Engineering',
                'duration': '2 Years',
                'caste': 'BC-D',
                'gender': 'Male',
                'is_active': True
            },
            {
                'roll_number': '5000000008',
                'name': 'Divya Mishra',
                'email': 'divya.mishra@tu.com',
                'phone': '9876540008',
                'course': 'M.A Economics',
                'duration': '2 Years',
                'caste': 'ST',
                'gender': 'Female',
                'is_active': True
            },
            {
                'roll_number': '5000000009',
                'name': 'Aditya Joshi',
                'email': 'aditya.joshi@tu.com',
                'phone': '9876540009',
                'course': 'M.Sc Physics with Electronics',
                'duration': '2 Years',
                'caste': 'OC',
                'gender': 'Male',
                'is_active': True
            },
            {
                'roll_number': '5000000010',
                'name': 'Neha Kapoor',
                'email': 'neha.kapoor@tu.com',
                'phone': '9876540010',
                'course': 'M.A Mass Communication',
                'duration': '2 Years',
                'caste': 'OC',
                'gender': 'Female',
                'is_active': False  # Graduated student
            }
        ]

        for student in student_data:
            user = self.create_student(student)
            self.stdout.write(self.style.SUCCESS(f'Created student: {student["name"]} ({student["roll_number"]})'))

        self.stdout.write(self.style.SUCCESS('Successfully populated database'))

    def create_student(self, student_data):
        user = User.objects.create_user(
            roll_number=student_data['roll_number'],
            password='tu@123',
            first_name=student_data['name'],
            is_student=True
        )
        
        StudentProfile.objects.create(
            user=user,
            roll_number=student_data['roll_number'],
            phone_number=student_data['phone'],
            course=student_data['course'],
            course_duration=student_data['duration'],
            caste=student_data['caste'],
            gender=student_data['gender']
        )
        return user

    def create_staff(self, staff_data, department):
        # Create user with email as username for staff
        user = User.objects.create_user(
            username=staff_data['email'],  # Set username same as email for staff
            email=staff_data['email'],
            password=staff_data['password'],
            first_name=staff_data['name'],
            is_staff=True
        )
        
        StaffProfile.objects.create(
            user=user,
            department=department,
            designation=department.designation,
            phone_number=staff_data['phone_number'],
            gender=staff_data['gender']
        )
        
        # Verify the user can authenticate
        test_user = authenticate(None, username=staff_data['email'], password=staff_data['password'])
        if test_user:
            self.stdout.write(self.style.SUCCESS(f'Successfully verified authentication for {staff_data["email"]}'))
        else:
            self.stdout.write(self.style.ERROR(f'Failed to verify authentication for {staff_data["email"]}'))
        
        return user 