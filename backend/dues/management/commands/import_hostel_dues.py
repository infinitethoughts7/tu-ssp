import pandas as pd
from django.core.management.base import BaseCommand
from core.models import StudentProfile
from dues.models import HostelDues

class Command(BaseCommand):
    help = "Import hostel dues from ecm_tu.csv file (one HostelDues per year per student)"

    def handle(self, *args, **kwargs):
        path = "dues/management/commands/ecm_tu.csv"  # Adjust path if needed
        df = pd.read_csv(path)

        year_map = {
            1: ("1st year\nMessbill", "1st year\nS/Ship"),
            2: ("2nd year\nMessbill", "2nd year\nS/Ship"),
        }

        for _, row in df.iterrows():
            username = str(row.get('Online \nAdmission No.', '')).strip()  # This is the roll number
            if not username:
                continue
            student = StudentProfile.objects.filter(user__username__iexact=username).first()
            if not student:
                self.stdout.write(f"❌ Student not found: {username}")
                continue

            deposit = int(row.get("Deposit", 0) or 0)
            remarks = row.get("Remarks", "")

            for year in range(1, 3):  # Only process years 1 and 2
                mess_col, sship_col = year_map[year]
                mess_bill = row.get(mess_col, None)
                scholarship = row.get(sship_col, None)
                # Only create if at least one of mess_bill or scholarship is present and nonzero
                try:
                    mess_bill = int(mess_bill) if pd.notnull(mess_bill) and str(mess_bill).strip() != '' else 0
                except Exception:
                    mess_bill = 0
                try:
                    scholarship = int(scholarship) if pd.notnull(scholarship) and str(scholarship).strip() != '' else 0
                except Exception:
                    scholarship = 0
                if mess_bill == 0 and scholarship == 0:
                    continue
                # Only use deposit for 1st year, else 0
                deposit_val = deposit if year == 1 else 0
                try:
                    HostelDues.objects.update_or_create(
                        student=student,
                        year_of_study=str(year),
                        defaults={
                            "mess_bill": mess_bill,
                            "scholarship": scholarship,
                            "deposit": deposit_val,
                            "remarks": remarks,
                        }
                    )
                    self.stdout.write(f"✅ Imported hostel due for {username} - Year {year}")
                except Exception as e:
                    self.stdout.write(f"❌ Error for {username} Year {year}: {str(e)}") 