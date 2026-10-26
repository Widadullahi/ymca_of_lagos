import html
import logging
from decimal import Decimal

import requests
from django.conf import settings
from django.core.mail import send_mail

from transaction.models import Transaction

logger = logging.getLogger(__name__)


def send_payment_receipt(transaction_id: str) -> None:
    """Send a receipt for a confirmed, non-test donation or membership payment."""
    try:
        payment = Transaction.objects.select_related('user').get(pk=transaction_id)
        if payment.status != 'success':
            return

        metadata = payment.response if isinstance(payment.response, dict) else {}
        if metadata.get('is_test'):
            logger.info('Skipping receipt for local test payment %s', payment.pk)
            return

        is_donation = payment.transaction_type == 'DONATION'
        email = (metadata.get('email') or '') if is_donation else (payment.user.email if payment.user else '')
        if not email:
            logger.info('No receipt email available for payment %s', payment.pk)
            return

        if is_donation:
            name = metadata.get('name') or 'Supporter'
            payment_label = 'donation'
            subject = 'Your YMCA Lagos donation receipt'
        else:
            name = f'{payment.user.first_name or ""} {payment.user.last_name or ""}'.strip() or 'Member'
            payment_label = 'membership renewal' if payment.transaction_type == 'RENEWAL' else 'membership payment'
            subject = f'Your YMCA Lagos {payment_label} receipt'

        reference = metadata.get('rrr') or metadata.get('payment_reference') or str(payment.pk)
        amount = f"₦{Decimal(str(payment.amount)):,.2f}"
        paid_on = payment.updated_at.strftime('%d %B %Y')
        safe_name = html.escape(str(name))
        safe_label = html.escape(payment_label)
        safe_amount = html.escape(amount)
        safe_reference = html.escape(str(reference))
        safe_paid_on = html.escape(paid_on)
        membership_expiry = ''
        if not is_donation and payment.user and payment.user.membership_expiry:
            expiry = payment.user.membership_expiry.strftime('%d %B %Y')
            membership_expiry = f'\nMembership valid through: {expiry}'

        text_body = (
            f'Hello {name},\n\n'
            f'We have confirmed your {payment_label} payment of {amount}.\n'
            f'Reference: {reference}\n'
            f'Paid on: {paid_on}'
            f'{membership_expiry}\n\n'
            'Thank you for supporting YMCA Lagos.\n'
            'YMCA Lagos'
        )
        html_body = (
            f'<p>Hello {safe_name},</p>'
            f'<p>We have confirmed your {safe_label} payment of <strong>{safe_amount}</strong>.</p>'
            '<ul>'
            f'<li>Reference: {safe_reference}</li>'
            f'<li>Paid on: {safe_paid_on}</li>'
            '</ul>'
            + (f'<p>Membership valid through: {html.escape(expiry)}</p>' if membership_expiry else '')
            + '<p>Thank you for supporting YMCA Lagos.</p>'
        )

        if not settings.DEFAULT_FROM_EMAIL:
            logger.error('Cannot send payment receipt: DEFAULT_FROM_EMAIL is not configured')
            return

        if settings.RESEND_API_KEY:
            response = requests.post(
                settings.RESEND_API_URL,
                headers={
                    'Authorization': f'Bearer {settings.RESEND_API_KEY}',
                    'Content-Type': 'application/json',
                },
                json={
                    'from': settings.DEFAULT_FROM_EMAIL,
                    'to': [email],
                    'subject': subject,
                    'text': text_body,
                    'html': html_body,
                },
                timeout=getattr(settings, 'EMAIL_TIMEOUT', 15),
            )
            if not response.ok:
                logger.error('Email provider rejected payment receipt with status %s', response.status_code)
            return

        send_mail(
            subject,
            text_body,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
            html_message=html_body,
        )
    except Exception:
        logger.exception('Failed to send payment receipt for transaction %s', transaction_id)
