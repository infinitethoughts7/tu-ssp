from django.shortcuts import render
from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .models import StudentProfile, StaffProfile, User
from .serializers import (
    StudentLoginSerializer,
    StaffLoginSerializer,
    StudentProfileSerializer,
    StaffProfileSerializer,
    UserSerializer
)
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
import logging
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q

logger = logging.getLogger(__name__)

# Create your views here.

class StudentLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            serializer = StudentLoginSerializer(data=request.data)
            if serializer.is_valid():
                username = serializer.validated_data['username']  # This is the roll number
                password = serializer.validated_data['password']
                
                # Check if user exists
                try:
                    user = User.objects.get(username=username)
                except User.DoesNotExist:
                    return Response(
                        {'error': 'Invalid username or password'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                # Authenticate user
                user = authenticate(
                    request,
                    username=username,
                    password=password
                )
                
                if user and user.is_student:
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    })
                else:
                    return Response(
                        {'error': 'Invalid username or password'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            else:
                return Response(
                    {'error': 'Please provide a valid username and password'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {'error': 'An error occurred during login'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class StaffLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = StaffLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # Use email as username for staff authentication
            user = authenticate(
                request,
                username=email,  # Use email as username
                password=password
            )
            
            if user and user.is_staff:
                refresh = RefreshToken.for_user(user)
                # Get staff profile and department
                staff_profile = StaffProfile.objects.get(user=user)
                department = staff_profile.department
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'department': department,
                })
            else:
                return Response(
                    {'error': 'Invalid email or password for staff login'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        else:
            return Response(
                {'error': 'Please provide a valid email and password'},
                status=status.HTTP_400_BAD_REQUEST
            )

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if hasattr(user, 'student_profile'):
            serializer = StudentProfileSerializer(user.student_profile)
            return Response({
                'type': 'student',
                'profile': serializer.data
            })
        elif hasattr(user, 'staff_profile'):
            serializer = StaffProfileSerializer(user.staff_profile)
            return Response({
                'type': 'staff',
                'profile': serializer.data
            })
        return Response(
            {'error': 'Profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )

# ViewSets for better API coverage
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = User.objects.all()
        user_type = self.request.query_params.get('type', None)
        if user_type == 'student':
            queryset = queryset.filter(is_student=True)
        elif user_type == 'staff':
            queryset = queryset.filter(is_staff=True)
        return queryset

class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = StudentProfile.objects.all()
        username = self.request.query_params.get('username', None)
        if username:
            queryset = queryset.filter(user__username__icontains=username)
        return queryset

class StaffProfileViewSet(viewsets.ModelViewSet):
    queryset = StaffProfile.objects.all()
    serializer_class = StaffProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = StaffProfile.objects.all()
        department = self.request.query_params.get('department', None)
        if department:
            queryset = queryset.filter(department=department)
        return queryset

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_profile(request):
    print("Staff profile request received")
    print("User:", request.user)
    print("Is authenticated:", request.user.is_authenticated)
    print("Has staff_profile:", hasattr(request.user, 'staff_profile'))
    
    if not hasattr(request.user, 'staff_profile'):
        print("User is not a staff member")
        return Response({'error': 'User is not a staff member'}, status=403)
    
    try:
        staff_profile = request.user.staff_profile
        print("Staff profile found:", staff_profile)
        print("Department:", staff_profile.department)
        
        response_data = {
            'id': request.user.id,
            'email': request.user.email,
            'username': request.user.username,
            'name': request.user.get_full_name(),
            'user_type': 'staff',
            'department': staff_profile.department,
            'phone_number': staff_profile.phone_number
        }
        print("Response data:", response_data)
        return Response(response_data)
    except Exception as e:
        print("Error in staff_profile view:", str(e))
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_students(request):
    query = request.GET.get('q', '')
    if not query:
        return Response({'error': 'Search query is required'}, status=400)
    
    try:
        # Search by username (roll number) or name
        students = StudentProfile.objects.filter(
            Q(user__username__icontains=query) |
            Q(user__first_name__icontains=query) |
            Q(user__last_name__icontains=query)
        )[:5]  # Limit to 5 results
        
        results = []
        for student in students:
            results.append({
                'id': student.id,  # Add student ID
                'username': student.user.username,  # This is the roll number
                'name': f"{student.user.first_name} {student.user.last_name}",
                'course': student.course.name if student.course else None,
                'caste': student.caste,
                'phone_number': student.mobile_number
            })
        
        return Response(results)
    except Exception as e:
        logger.error(f"Error searching students: {str(e)}")
        return Response({'error': 'Error searching students'}, status=500)
