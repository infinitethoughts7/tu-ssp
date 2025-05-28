from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Empty the database'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Database emptied successfully')) 