from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from core.models import Department, StudentProfile
from .models import Dues

User = get_user_model()

class DuesAPITests(APITestCase):
    def setUp(self):
        # Create departments
        self.department1 = Department.objects.create(name="Computer Science")
        self.department2 = Department.objects.create(name="Mathematics")

        # Create users
        self.staff_user1 = User.objects.create_user(
            username='staff1',
            password='testpass123',
            is_staff=True
        )
        self.staff_user2 = User.objects.create_user(
            username='staff2',
            password='testpass123',
            is_staff=True
        )
        self.student_user = User.objects.create_user(
            username='student1',
            password='testpass123'
        )

        # Create staff profiles
        self.staff_user1.staff_profile.department = self.department1
        self.staff_user1.staff_profile.save()
        self.staff_user2.staff_profile.department = self.department2
        self.staff_user2.staff_profile.save()

        # Create student
        self.student = StudentProfile.objects.create(
            user=self.student_user,
            department=self.department1
        )

        # Create dues
        self.dues = Dues.objects.create(
            student=self.student,
            department=self.department1,
            amount=1000.00,
            due_date='2024-12-31',
            description='Tuition Fee',
            created_by=self.staff_user1
        )

        # URLs
        self.list_url = reverse('dues-list')
        self.detail_url = reverse('dues-detail', args=[self.dues.id])
        self.mark_paid_url = reverse('dues-mark-as-paid', args=[self.dues.id])

    def test_create_dues(self):
        self.client.force_authenticate(user=self.staff_user1)
        data = {
            'student': self.student.id,
            'department': self.department1.id,
            'amount': 500.00,
            'due_date': '2024-12-31',
            'description': 'Library Fee'
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_cannot_create_dues_for_other_department(self):
        self.client.force_authenticate(user=self.staff_user2)
        data = {
            'student': self.student.id,
            'department': self.department1.id,
            'amount': 500.00,
            'due_date': '2024-12-31',
            'description': 'Library Fee'
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_can_view_own_dues(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_mark_as_paid(self):
        self.client.force_authenticate(user=self.staff_user1)
        response = self.client.post(self.mark_paid_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.dues.refresh_from_db()
        self.assertTrue(self.dues.is_paid) 