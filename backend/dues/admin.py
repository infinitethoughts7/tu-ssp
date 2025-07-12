from django.contrib import admin
from .models import FeeStructure, HostelRecords, LibraryRecords, LegacyAcademicRecords, SportsRecords

@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = ['course_name', 'academic_year', 'category', 'tuition_fee']
    list_filter = ['course_name', 'academic_year', 'category']
    search_fields = ['course_name', 'academic_year']



@admin.register(HostelRecords)
class HostelRecordsAdmin(admin.ModelAdmin):
    list_display = ['student_name', 'roll_number', 'year_of_study', 'mess_bill', 'scholarship', 'deposit']
    list_filter = ['year_of_study', 'student__course__name']
    search_fields = ['student__user__username', 'student__user__first_name', 'student__user__last_name']
    readonly_fields = ['student_name', 'roll_number']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student__user', 'student__course')
    
    def student_name(self, obj):
        if obj.student and obj.student.user:
            first_name = obj.student.user.first_name
            if first_name:
                return first_name
        return 'N/A'
    student_name.short_description = 'Student Name'
    student_name.admin_order_field = 'student__user__first_name'
    
    def roll_number(self, obj):
        return obj.student.user.username if obj.student and obj.student.user else 'N/A'
    roll_number.short_description = 'Roll Number'
    roll_number.admin_order_field = 'student__user__username'

@admin.register(LibraryRecords)
class LibraryRecordsAdmin(admin.ModelAdmin):
    list_display = ['student_name', 'roll_number', 'book_id', 'borrowing_date', 'fine_amount']
    list_filter = ['borrowing_date', 'student__course__name']
    search_fields = ['student__user__username', 'student__user__first_name', 'student__user__last_name', 'book_id']
    readonly_fields = ['created_at', 'updated_at', 'student_name', 'roll_number']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student__user', 'student__course')
    
    def student_name(self, obj):
        if obj.student and obj.student.user:
            first_name = obj.student.user.first_name
            if first_name:
                return first_name
        return 'N/A'
    student_name.short_description = 'Student Name'
    student_name.admin_order_field = 'student__user__first_name'
    
    def roll_number(self, obj):
        return obj.student.user.username if obj.student and obj.student.user else 'N/A'
    roll_number.short_description = 'Roll Number'
    roll_number.admin_order_field = 'student__user__username'

@admin.register(LegacyAcademicRecords)
class LegacyAcademicRecordsAdmin(admin.ModelAdmin):
    list_display = [
        'student_name', 'roll_number', 'due_amount', 'tc_number', 'tc_issued_date'
    ]
    list_filter = [
        'tc_number', 'tc_issued_date', 'student__course__name'
    ]
    search_fields = [
        'student__user__username', 'student__user__first_name', 
        'student__user__last_name', 'tc_number'
    ]
    readonly_fields = ['formatted_due_amount', 'student_name', 'roll_number']
    ordering = ['student__user__username']
    
    fieldsets = (
        ('Student Information', {
            'fields': ('student', 'student_name', 'roll_number')
        }),
        ('Financial Information', {
            'fields': ('due_amount', 'formatted_due_amount')
        }),
        ('Transfer Certificate', {
            'fields': ('tc_number', 'tc_issued_date')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'student__user', 'student__course')
    
    def student_name(self, obj):
        if obj.student and obj.student.user:
            first_name = obj.student.user.first_name
            if first_name:
                return first_name
        return 'N/A'
    student_name.short_description = 'Student Name'
    student_name.admin_order_field = 'student__user__first_name'
    
    def roll_number(self, obj):
        return obj.student.user.username if obj.student and obj.student.user else 'N/A'
    roll_number.short_description = 'Roll Number'
    roll_number.admin_order_field = 'student__user__username'
    
    def formatted_due_amount(self, obj):
        return f"₹{obj.due_amount:,.2f}"
    formatted_due_amount.short_description = 'Formatted Due Amount'

@admin.register(SportsRecords)
class SportsRecordsAdmin(admin.ModelAdmin):
    list_display = ['student', 'equipment_name', 'borrowing_date', 'fine_amount']
    list_filter = ['borrowing_date']
    search_fields = ['student__user__username', 'equipment_name']
    readonly_fields = ['created_at', 'updated_at']
