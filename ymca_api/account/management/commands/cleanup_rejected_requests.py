from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from account.models import UserRequest, RequestStatus


class Command(BaseCommand):
    help = 'Delete rejected membership requests older than 1 year'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )
        parser.add_argument(
            '--days',
            type=int,
            default=365,
            help='Number of days after which rejected requests are deleted (default: 365)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        days = options['days']
        cutoff_date = timezone.now() - timedelta(days=days)

        # Get rejected requests older than the cutoff date
        rejected_requests = UserRequest.objects.filter(
            status=RequestStatus.REJECTED,
            reviewed_at__lt=cutoff_date
        )

        count = rejected_requests.count()

        if count == 0:
            self.stdout.write(
                self.style.SUCCESS(f'No rejected requests older than {days} days found.')
            )
            return

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'[DRY RUN] Would delete {count} rejected request(s) older than {days} days:'
                )
            )
            for request in rejected_requests[:10]:  # Show first 10
                self.stdout.write(
                    f'  - {request.first_name} {request.last_name} '
                    f'(Email: {request.email}, Rejected: {request.reviewed_at})'
                )
            if count > 10:
                self.stdout.write(f'  ... and {count - 10} more')
        else:
            # Delete the rejected requests
            deleted_count, _ = rejected_requests.delete()
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully deleted {deleted_count} rejected request(s) older than {days} days.'
                )
            )

        self.stdout.write(
            self.style.INFO(
                f'Processed cleanup of rejected requests older than {cutoff_date.strftime("%Y-%m-%d")}.'
            )
        )