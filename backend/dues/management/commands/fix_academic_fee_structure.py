from django.core.management.base import BaseCommand
import pandas as pd
from core.models import StudentProfile
from dues.models import Academic, FeeStructure

class Command(BaseCommand):
    help = 'Fix Academic.fee_structure to point to correct M.Com. (e-Commerce) FeeStructure for each year.'

    def handle(self, *args, **kwargs):
        path = "dues/management/mcom_dues_with_all_phones.csv"
        df = pd.read_csv(path)
        usernames = df["Admission No"].astype(str).str.strip().tolist()
        updated = 0
        for username in usernames:
            try:
                student = StudentProfile.objects.get(user__username=username)
                for year, academic_year in [("1", "2022-23"), ("2", "2023-24")]:
                    academics = Academic.objects.filter(student=student, academic_year_label=year)
                    fee_structure = None
                    try:
                        fee_structure = FeeStructure.objects.get(
                            course_name="M.Com. (e-Commerce)",
                            academic_year=academic_year,
                            category="University Main Campus"
                        )
                    except FeeStructure.DoesNotExist:
                        self.stdout.write(f"❌ FeeStructure not found for {username} year {year}")
                        continue
                    for academic in academics:
                        if academic.fee_structure != fee_structure:
                            academic.fee_structure = fee_structure
                            academic.save()
                            updated += 1
                            self.stdout.write(f"✅ Updated Academic for {username} year {year}")
                    if not academics:
                        self.stdout.write(f"❌ Academic record not found for {username} year {year}")
            except StudentProfile.DoesNotExist:
                self.stdout.write(f"❌ Student not found: {username}")
        self.stdout.write(f"✅ Updated {updated} Academic records") 