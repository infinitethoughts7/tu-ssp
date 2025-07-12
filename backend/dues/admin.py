from django.contrib import admin
from .models import FeeStructure, AcademicRecords, HostelRecords, LibraryRecords, LegacyAcademicRecords, SportsRecords

@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = ['course_name', 'academic_year', 'category', 'tuition_fee']
    list_filter = ['course_name', 'academic_year', 'category']
    search_fields = ['course_name', 'academic_year']

@admin.register(AcademicRecords)
class AcademicRecordsAdmin(admin.ModelAdmin):
    list_display = ['student', 'academic_year_label', 'payment_status', 'due_amount']
    list_filter = ['payment_status', 'academic_year_label']
    search_fields = ['student__user__username', 'student__user__first_name']

@admin.register(HostelRecords)
class HostelRecordsAdmin(admin.ModelAdmin):
    list_display = ['student', 'year_of_study', 'mess_bill', 'scholarship', 'deposit']
    list_filter = ['year_of_study']
    search_fields = ['student__user__username', 'student__user__first_name']

@admin.register(LibraryRecords)
class LibraryRecordsAdmin(admin.ModelAdmin):
    list_display = ['student', 'book_id', 'borrowing_date', 'fine_amount']
    list_filter = ['borrowing_date']
    search_fields = ['student__user__username', 'book_id']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(LegacyAcademicRecords)
class LegacyAcademicRecordsAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'due_amount', 'tc_number', 'tc_issued_date'
    ]
    list_filter = [
        'tc_number', 'tc_issued_date', 'student__course__name'
    ]
    search_fields = [
        'student__user__username', 'student__user__first_name', 
        'student__user__last_name', 'tc_number'
    ]
    readonly_fields = ['formatted_due_amount']
    ordering = ['student__user__username']
    
    fieldsets = (
        ('Student Link', {
            'fields': ('student',)
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
    
    def formatted_due_amount(self, obj):
        return f"₹{obj.due_amount:,.2f}"
    formatted_due_amount.short_description = 'Formatted Due Amount'

@admin.register(SportsRecords)
class SportsRecordsAdmin(admin.ModelAdmin):
    list_display = ['student', 'equipment_name', 'borrowing_date', 'fine_amount']
    list_filter = ['borrowing_date']
    search_fields = ['student__user__username', 'equipment_name']
    readonly_fields = ['created_at', 'updated_at']
