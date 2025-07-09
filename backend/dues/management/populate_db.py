import pandas as pd 
from django.core.management.base import BaseCommand
from core.models import StudentProfile
from dues.models import FeeStructure, Academic
from django.db import transaction

class Command(BaseCommand):
    help = "Import M.Com (e-Commerce) dues from CSV"

    def handle(self, *args, **kwargs):
        path = "mcom_ecommerce_dues_with_special_fee.csv"  # Change if in a different path
        df = pd.read_csv(path)

        for _, row in df.iterrows():
            username = str(row["Admission No"]).strip()  # This is the roll number
            student = StudentProfile.objects.filter(user__username=username).first()

            if not student:
                self.stdout.write(f"❌ Student not found: {username}")
                continue

            try:
                for year in ["1", "2"]:
                    year_suffix = "1st" if year == "1" else "2nd"

                    # Extract values from CSV
                    tuition_fee = int(row[f"{year_suffix} Year Tuition Fee"])
                    special_fee = int(row[f"{year_suffix} Year Special Fee"])
                    paid_by_govt = int(row[f"{year_suffix} Year Paid by Govt"])
                    paid_by_student = int(row[f"{year_suffix} Year Paid by Student"])

                    # Get or create FeeStructure
                    fee_structure, _ = FeeStructure.objects.get_or_create(
                        course_name=student.course,
                        academic_year="2022-23" if year == "1" else "2023-24",
                        year=int(year),
                        category="Main Campus",
                        defaults={
                            "tuition_fee": tuition_fee,
                            "special_fee": special_fee,
                        }
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
                    self.stdout.write(f"✅ Imported dues for {username} - Year {year}")
            except Exception as e:
                self.stdout.write(f"❌ Error for {username}: {str(e)}")
