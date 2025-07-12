from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import User, StaffProfile, StudentProfile, Course

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'full_name', 'user_type', 'is_active', 'last_login', 'date_joined')
    list_filter = ('is_student', 'is_staff', 'is_superuser', 'is_active', 'date_joined', 'last_login')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined', 'username')
    readonly_fields = ('last_login', 'date_joined', 'user_type_display')
    
    fieldsets = (
        ('Account Information', {
            'fields': ('username', 'password', 'email')
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name')
        }),
        ('User Type & Status', {
            'fields': ('is_student', 'is_staff', 'is_superuser', 'is_active', 'user_type_display')
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
        ('Permissions', {
            'fields': ('groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_student', 'is_staff', 'is_superuser', 'is_active'),
        }),
    )
    
    def full_name(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return "N/A"
    full_name.short_description = "Full Name"
    full_name.admin_order_field = 'first_name'
    
    def user_type(self, obj):
        if obj.is_superuser:
            return format_html('<span style="color: #d63384; font-weight: bold;">Superuser</span>')
        elif obj.is_staff:
            return format_html('<span style="color: #0d6efd; font-weight: bold;">Staff</span>')
        elif obj.is_student:
            return format_html('<span style="color: #198754; font-weight: bold;">Student</span>')
        else:
            return format_html('<span style="color: #6c757d;">Regular User</span>')
    user_type.short_description = "User Type"
    
    def user_type_display(self, obj):
        return self.user_type(obj)
    user_type_display.short_description = "User Type"

class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'course_duration', 'formatted_duration', 'total_students')
    list_filter = ('course_duration', 'name')
    search_fields = ('name',)
    ordering = ('name',)
    
    def formatted_duration(self, obj):
        return f"{obj.course_duration} Year{'s' if obj.course_duration != '1' else ''}"
    formatted_duration.short_description = "Duration"
    
    def total_students(self, obj):
        count = StudentProfile.objects.filter(course=obj).count()
        return format_html('<span style="color: #198754; font-weight: bold;">{}</span>', count)
    total_students.short_description = "Total Students"

class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ('username', 'full_name', 'department', 'gender', 'phone_number', 'join_date', 'email_link')
    list_filter = ('department', 'gender', 'join_date', 'user__is_active')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'phone_number')
    ordering = ('-join_date', 'user__username')
    readonly_fields = ('join_date', 'user_link')
    raw_id_fields = ('user',)
    
    fieldsets = (
        ('User Account', {
            'fields': ('user', 'user_link')
        }),
        ('Personal Information', {
            'fields': ('department', 'gender', 'phone_number')
        }),
        ('Employment Details', {
            'fields': ('join_date',)
        }),
    )
    
    def username(self, obj):
        return obj.user.username if obj.user else 'N/A'
    username.short_description = "Username"
    username.admin_order_field = 'user__username'
    
    def full_name(self, obj):
        if obj.user:
            if obj.user.first_name and obj.user.last_name:
                return f"{obj.user.first_name} {obj.user.last_name}"
            return obj.user.username
        return 'N/A'
    full_name.short_description = "Full Name"
    full_name.admin_order_field = 'user__first_name'
    
    def email_link(self, obj):
        if obj.user and obj.user.email:
            return format_html('<a href="mailto:{}">{}</a>', obj.user.email, obj.user.email)
        return 'N/A'
    email_link.short_description = "Email"
    
    def user_link(self, obj):
        if obj.user:
            url = reverse('admin:core_user_change', args=[obj.user.id])
            return format_html('<a href="{}">{}</a>', url, obj.user.username)
        return 'N/A'
    user_link.short_description = "User Account"

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['user_roll_number', 'student_name', 'course', 'caste', 'gender', 'mobile_number', 'batch']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'mobile_number']

    def user_roll_number(self, obj):
        return obj.user.username if obj.user else 'N/A'
    user_roll_number.short_description = 'Roll Number'
    user_roll_number.admin_order_field = 'user__username'

    def student_name(self, obj):
        if obj.user and obj.user.first_name:
            return obj.user.first_name
        return 'N/A'
    student_name.short_description = 'Full Name'
    student_name.admin_order_field = 'user__first_name'

# Custom admin site configuration
admin.site.site_header = "Telangana University Student Services Portal"
admin.site.site_title = "TU SSP Admin"
admin.site.index_title = "Welcome to TU SSP Administration"

# Register models with their respective admin classes
admin.site.register(User, CustomUserAdmin)
admin.site.register(Course, CourseAdmin)
admin.site.register(StaffProfile, StaffProfileAdmin)
