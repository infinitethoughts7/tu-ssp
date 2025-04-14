from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Department, StaffProfile, StudentProfile

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'roll_number', 'is_student', 'is_staff', 'is_active')
    list_filter = ('is_student', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'roll_number')
    ordering = ('username',)
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('email', 'roll_number')}),
        ('Permissions', {'fields': ('is_active', 'is_student', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'roll_number', 'password1', 'password2', 'is_student', 'is_staff', 'is_active'),
        }),
    )

class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('department', 'designation')
    list_filter = ('department', 'designation')
    search_fields = ('department', 'designation')

class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'department', 'designation', 'gender', 'phone_number', 'join_date')
    list_filter = ('department', 'gender', 'join_date')
    search_fields = ('user__username', 'user__email', 'phone_number', 'designation')
    raw_id_fields = ('user', 'department')

class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('roll_number', 'caste', 'gender', 'course', 'course_duration', 'get_username')
    list_filter = ('caste', 'gender', 'course', 'course_duration')
    search_fields = ('roll_number', 'user__username', 'user__email', 'phone_number')
    raw_id_fields = ('user',)

    def get_username(self, obj):
        return obj.user.username if obj.user else 'No User'
    get_username.short_description = 'Username'
    get_username.admin_order_field = 'user__username'

    fieldsets = (
        ('Student Information', {
            'fields': ('roll_number', 'caste', 'gender', 'phone_number', 'course', 'course_duration')
        }),
        ('User Account (Optional)', {
            'fields': ('user',),
            'classes': ('collapse',),
            'description': 'Link this profile to a user account if needed'
        }),
    )

# Register models with their respective admin classes
admin.site.register(User, CustomUserAdmin)
admin.site.register(Department, DepartmentAdmin)
admin.site.register(StaffProfile, StaffProfileAdmin)
admin.site.register(StudentProfile, StudentProfileAdmin)
