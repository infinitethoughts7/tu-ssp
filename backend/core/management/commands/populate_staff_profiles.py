from django.core.management.base import BaseCommand
from core.models import User, StaffProfile
from datetime import date

STAFF_DATA = [
    {
        "full_name": "Venkatesham Papireddy",
        "gender": "Male",
        "email": "accounts@tu.in",
        "phone_number": "9848012345",
        "department": "accounts",
        "designation": "Accountant",
    },
    {
        "full_name": "Padmaja Krishnaveni",
        "gender": "Female",
        "email": "hostel@tu.in",
        "phone_number": "9701234567",
        "department": "hostel_superintendent",
        "designation": "Hostel Superintendent",
    },
    {
        "full_name": "Anvitha Latha",
        "gender": "Female",
        "email": "library@tu.in",
        "phone_number": "9490312345",
        "department": "librarian",
        "designation": "Librarian",
    },
    {
        "full_name": "Madhav Rajashekar",
        "gender": "Male",
        "email": "lab@tu.in",
        "phone_number": "9912345678",
        "department": "lab_incharge",
        "designation": "Lab In-charge",
    },
    {
        "full_name": "Shailaja Hanumantharao",
        "gender": "Female",
        "email": "sports@tu.in",
        "phone_number": "9030123456",
        "department": "sports_incharge",
        "designation": "PE & Sports In-charge",
    },
]

class Command(BaseCommand):
    help = 'Populate staff_profile table with provided staff data.'

    def handle(self, *args, **kwargs):
        for staff in STAFF_DATA:
            try:
                user = User.objects.get(email=staff["email"])
                # Optionally update user's first and last name
                names = staff["full_name"].split()
                user.first_name = names[0]
                user.last_name = " ".join(names[1:]) if len(names) > 1 else ""
                user.save()
                profile, created = StaffProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        "department": staff["department"],
                        "gender": staff["gender"],
                        "phone_number": staff["phone_number"],
                        "join_date": date.today(),
                    }
                )
                if not created:
                    profile.department = staff["department"]
                    profile.gender = staff["gender"]
                    profile.phone_number = staff["phone_number"]
                    profile.join_date = date.today()
                    profile.save()
                self.stdout.write(f"✅ Populated staff profile for {staff['full_name']} ({staff['email']})")
            except User.DoesNotExist:
                self.stdout.write(f"❌ User not found for email: {staff['email']}") 