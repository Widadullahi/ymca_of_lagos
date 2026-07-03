from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from account.models import User, BirthdayWish
from datetime import date


class Command(BaseCommand):
    help = 'Send birthday wishes to members whose birthday is today'

    def handle(self, *args, **options):
        today = date.today()
        current_year = today.year
        sent_count = 0
        skipped_count = 0
        failed_count = 0

        self.stdout.write(f'Checking for birthdays on {today.strftime("%B %d, %Y")}...')

        # Get all active non-admin users
        users = User.objects.filter(
            is_active=True,
            is_admin=False,
            is_superuser=False
        )

        for user in users:
            # Get date of birth from user_request
            if user.user_request and user.user_request.date_of_birth:
                dob = user.user_request.date_of_birth
                # Check if today is their birthday (ignoring year)
                if dob.month == today.month and dob.day == today.day:
                    # Check if we've already sent a wish this year
                    existing_wish = BirthdayWish.objects.filter(
                        user=user,
                        year=current_year
                    ).first()

                    if existing_wish:
                        self.stdout.write(
                            f'Skipping {user.get_full_name()}: Wish already sent this year'
                        )
                        skipped_count += 1
                        continue

                    # Send birthday email
                    full_name = user.get_full_name()
                    recipient_email = user.email

                    subject = f'Happy Birthday {full_name}! 🎉'
                    message = f"""Dear {full_name},

Happy Birthday! 🎂

On behalf of everyone at YMCA, we want to wish you a wonderful day filled with joy, laughter, and all the things you love most.

May this year bring you good health, happiness, and success in all your endeavors.

Warm regards,
The YMCA Team
                    """

                    try:
                        self.stdout.write(f'Sending birthday wish to {full_name} ({recipient_email})...')
                        send_mail(
                            subject,
                            message,
                            settings.DEFAULT_FROM_EMAIL,
                            [recipient_email],
                            fail_silently=False,
                        )
                        # Record that we sent the wish
                        BirthdayWish.objects.create(
                            user=user,
                            year=current_year
                        )
                        self.stdout.write(self.style.SUCCESS(
                            f'Successfully sent birthday wish to {full_name}'))
                        sent_count += 1
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(
                            f'Failed to send email to {full_name}: {str(e)}'))
                        failed_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'\nBirthday wish campaign completed!'))
        self.stdout.write(f'Sent: {sent_count}')
        if skipped_count > 0:
            self.stdout.write(f'Skipped: {skipped_count} (already sent this year)')
        if failed_count > 0:
            self.stdout.write(self.style.ERROR(f'Failed: {failed_count}'))