"""
DEV-ONLY: simulate a successful Remita payment for an RRR.

Runs the exact same success path as real verification
(Remita.apply_payment_success): marks the transaction success and applies
membership side effects. Refuses to run when REMITA_BASE_URL points at
production (login.remita.net).

Usage:
  ./venv/bin/python manage.py simulate_payment --rrr 230799679280
  ./venv/bin/python manage.py simulate_payment --latest
"""
import sys

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from transaction.models import Transaction


class Command(BaseCommand):
    help = "DEV-ONLY: mark a pending Remita transaction as paid (demo sandbox only)."

    def add_arguments(self, parser):
        parser.add_argument('--rrr', type=str, help='RRR of the transaction to mark paid')
        parser.add_argument('--latest', action='store_true', help='Use the most recent pending transaction')

    def handle(self, *args, **options):
        base_url = (settings.REMITA_BASE_URL or '').lower()
        if 'login.remita.net' in base_url:
            raise CommandError(
                'Refusing to simulate payments against PRODUCTION Remita '
                '(REMITA_BASE_URL points at login.remita.net).'
            )

        rrr = options.get('rrr')
        if options.get('latest'):
            tx = Transaction.objects.filter(
                payment_gateway='remita', status='pending', response__rrr__isnull=False,
            ).order_by('-created_at').first()
            if not tx:
                raise CommandError('No pending Remita transaction with an RRR found.')
        elif rrr:
            tx = Transaction.objects.filter(
                payment_gateway='remita', response__rrr=rrr,
            ).first()
            if not tx:
                raise CommandError(f'No Remita transaction found for RRR {rrr}.')
        else:
            raise CommandError('Provide --rrr <RRR> or use --latest.')

        if tx.status == 'success':
            self.stdout.write(self.style.WARNING(
                f'Transaction {tx.id} (RRR {rrr or tx.response.get("rrr")}) is already successful — nothing to do.'
            ))
            return

        from api.utils.payment.remita import remita
        remita.apply_payment_success(tx)

        self.stdout.write(self.style.SUCCESS(
            f'Simulated payment: transaction {tx.id} '
            f'({tx.transaction_type}, NGN {tx.amount}) -> success'
        ))
        if tx.transaction_type != 'DONATION' and tx.user:
            self.stdout.write(self.style.SUCCESS(
                f'Membership extended to {tx.user.membership_expiry} for {tx.user.email}'
            ))
        self.stdout.write(
            f'Frontend: open /payment?rrr={tx.response.get("rrr")} to see the success screen.'
        )
        sys.exit(0)
