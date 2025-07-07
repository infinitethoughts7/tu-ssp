from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from .models import User

class CustomAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Try to fetch the user by email or username (roll number)
            user = User.objects.get(
                Q(email=username) | Q(username=username)
            )
            
            # Check if the user exists and password is correct
            if user and user.check_password(password):
                # For staff login (using email)
                if '@' in str(username):
                    if user.is_staff:
                        return user
                    return None  # Email login attempted but user is not staff
                
                # For student login (using roll number stored in username)
                else:
                    if user.is_student:
                        return user
                    return None  # Roll number login attempted but user is not student
            
            return None
        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None 