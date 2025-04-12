from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

# API URL patterns for the core app
urlpatterns = [
    # Authentication endpoints
    path('auth/student/login/', views.StudentLoginView.as_view(), name='student-login'),
    path('auth/staff/login/', views.StaffLoginView.as_view(), name='staff-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Get logged-in user's profile (student or staff)
    # GET request returns:
    # - For students: roll number, course, personal details
    # - For staff: department, designation, personal details
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),

 
] 