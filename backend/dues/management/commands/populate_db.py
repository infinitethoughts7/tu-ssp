from dues.models import FeeStructure, Academic
# ... existing code ...
# Replace AcademicDues.objects.update_or_create with Academic.objects.update_or_create 
                    # Get the correct FeeStructure
                    fee_structure = FeeStructure.objects.get(
                        course_name=student.course,
                        academic_year="2022-23" if year == "1" else "2023-24",
                        category="University Main Campus"
                    )
                    # Create Academic
                    Academic.objects.update_or_create(
                        student=student,
                        fee_structure=fee_structure,
                        academic_year_label=year,
                        defaults={
                            "paid_by_govt": paid_by_govt,
                            "paid_by_student": paid_by_student,
                        }
                    ) 