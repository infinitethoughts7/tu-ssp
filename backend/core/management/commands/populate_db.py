from django.core.management.base import BaseCommand
import pandas as pd
from core.models import StudentProfile, User
from dues.models import FeeStructure, Academic
from django.db import transaction
import math

class Command(BaseCommand):
    help = 'Populate database with M.Com dues from CSV'

    def handle(self, *args, **kwargs):
        path = "dues/management/mcom_dues_with_all_phones.csv"  # Updated path
        df = pd.read_csv(path)

        # Update all relevant StudentProfile records to have the correct course
        roll_numbers = df["Admission No"].astype(str).str.strip().tolist()
        StudentProfile.objects.filter(roll_number__in=roll_numbers).update(course="M.Com. (e-Commerce)")

        for _, row in df.iterrows():
            roll_number = str(row["Admission No"]).strip()
            student_name = row["Student Name"].strip()
            category = row["Category"].strip() if not pd.isna(row["Category"]) else "Other"
            phone_number = str(row["Phone Number"]).strip()

            # Create or get User
            user, user_created = User.objects.get_or_create(
                username=roll_number,
                defaults={
                    "roll_number": roll_number,
                    "is_student": True,
                    "first_name": student_name,
                }
            )

            # Create or update StudentProfile
            student_profile, created = StudentProfile.objects.get_or_create(
                user=user,
                defaults={
                    "roll_number": roll_number,
                    "caste": category,
                    "gender": "Other",
                    "phone_number": phone_number,
                    "course": "M.Com. (e-Commerce)",
                    "course_duration": "2 Years",
                    "year_of_study": "2 Years",
                    "is_hostel": False,
                }
            )

            if created:
                self.stdout.write(f"✅ Created student profile for {student_name} with roll number {roll_number}")
            else:
                self.stdout.write(f"ℹ️ Student profile already exists for {student_name} with roll number {roll_number}")

            try:
                for year in ["1", "2"]:
                    year_suffix = "1st" if year == "1" else "2nd"

                    # Extract values from CSV, handle missing values and NaN
                    def safe_int(val):
                        try:
                            if pd.isna(val) or (isinstance(val, float) and math.isnan(val)):
                                return 0
                            return int(val)
                        except Exception:
                            return 0

                    tuition_fee = safe_int(row.get(f"{year_suffix} Year Tuition Fee", 0))
                    special_fee = safe_int(row.get(f"{year_suffix} Year Special Fee", 0))
                    paid_by_govt = safe_int(row.get(f"{year_suffix} Year Paid by Govt", 0))
                    paid_by_student = safe_int(row.get(f"{year_suffix} Year Paid by Student", 0))

                    # Get the correct FeeStructure
                    fee_structure = FeeStructure.objects.get(
                        course_name="M.Com. (e-Commerce)",
                        academic_year="2022-23" if year == "1" else "2023-24",
                        category="University Main Campus"
                    )

                    # Create Academic
                    Academic.objects.update_or_create(
                        student=student_profile,
                        fee_structure=fee_structure,
                        academic_year_label=year,
                        defaults={
                            "paid_by_govt": paid_by_govt,
                            "paid_by_student": paid_by_student,
                        }
                    )
                    self.stdout.write(f"✅ Imported dues for {student_profile.roll_number} - Year {year}")
            except Exception as e:
                self.stdout.write(f"❌ Error for {roll_number}: {str(e)}")

        self.stdout.write(self.style.SUCCESS('Successfully populated database with M.Com dues')) 