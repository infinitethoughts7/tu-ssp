from rest_framework import permissions

class IsStaffOfDepartment(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.user.is_staff:
            return True
            
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return obj.department == request.user.staff_profile.department
        return obj.student.user == request.user 

class IsAdminOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser) 