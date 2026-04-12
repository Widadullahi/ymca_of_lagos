from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings


class Command(BaseCommand):
    help = 'Send a test email to a specified address'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Recipient email address')

    def handle(self, *args, **options):
        recipient = options['email']
        subject = 'Test Email from YMCA Portal'
        message = 'This is a test email sent from the Django management command to verify email configuration.'
        from_email = settings.DEFAULT_FROM_EMAIL

        try:
            self.stdout.write(
                f'Attempting to send test email to {recipient}...')
            send_mail(
                subject,
                message,
                from_email,
                [recipient],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS(
                f'Successfully sent test email to {recipient}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f'Failed to send email: {str(e)}'))
