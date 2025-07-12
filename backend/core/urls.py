from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'student-profiles', views.StudentProfileViewSet)
router.register(r'staff-profiles', views.StaffProfileViewSet)

# API URL patterns for the core app
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/student/login/', views.StudentLoginView.as_view(), name='student-login'),
    path('auth/staff/login/', views.StaffLoginView.as_view(), name='staff-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Get logged-in user's profile (student or staff)
    # GET request returns:
    # - For students: roll number, course, personal details
    # - For staff: department, designation, personal details
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    
    # Staff profile endpoint
    path('staff/profile/', views.staff_profile, name='staff-profile'),
    
    # Student search endpoint
    path('students/search/', views.search_students, name='search-students'),
] 