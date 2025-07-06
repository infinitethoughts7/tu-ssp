import os
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from core.models import User, StaffProfile

class Command(BaseCommand):
    help = 'Create principal user with email principal@tu.in and default password'

    def handle(self, *args, **options):
        try:
            # Check if principal user already exists
            if User.objects.filter(email='principal@tu.in').exists():
                self.stdout.write(
                    self.style.WARNING('Principal user already exists!')
                )
                return

            # Create the principal user
            default_password = os.getenv('PRINCIPAL_DEFAULT_PASSWORD', 'changeme123')
            principal_user = User.objects.create(
                username='principal@tu.in',
                email='principal@tu.in',
                password=make_password(default_password),
                is_staff=True,
                is_superuser=False,
                first_name='Principal',
                last_name='Telangana University'
            )

            # Create staff profile for principal
            StaffProfile.objects.create(
                user=principal_user,
                department='accounts',  # Using accounts as department for principal
                designation='Principal',
                gender='Male',
                phone_number='9876543210'
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created principal user with email: principal@tu.in'
                )
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'User ID: {principal_user.id}, Username: {principal_user.username}'
                )
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating principal user: {str(e)}')
            ) 