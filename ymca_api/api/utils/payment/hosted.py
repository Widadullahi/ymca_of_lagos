from decimal import Decimal
from urllib.parse import urlparse
import requests
from django.conf import settings
from django.core.exceptions import ValidationError
from api.utils.response.response_format import success_response, bad_request_response
from transaction.models import Transaction


class HostedCheckout:
    @staticmethod
    def initialize(transaction, name, email, phone=''):
        metadata = {**(transaction.response or {}), 'checkout_type': 'hosted'}
        transaction.response = metadata
        transaction.save(update_fields=['response', 'updated_at'])
        reference = str(transaction.id)
        if settings.DEBUG and settings.REMITA_LOCAL_TEST_MODE:
            transaction.response = {**metadata, 'is_test': True}
            transaction.save(update_fields=['response', 'updated_at'])
            link = f'{settings.LOCAL_FRONTEND_URL}/checkout/local-test?reference={reference}'
        else:
            if not settings.REMITA_SECRET_KEY:
                return HostedCheckout.fail(transaction, 'Hosted checkout secret key is not configured')
            parts = name.strip().split(maxsplit=1)
            try:
                response = requests.post(
                    f'{settings.REMITA_HOSTED_BASE_URL}/payment/charge',
                    headers={'secretKey': settings.REMITA_SECRET_KEY},
                    json={'firstName': parts[0] if parts else 'Donor', 'lastName': parts[1] if len(parts) > 1 else 'Donor',
                          'email': email, 'phoneNumber': phone, 'paymentIdentifier': reference,
                          'currency': 'NGN', 'narration': metadata.get('description', 'YMCA membership'),
                          'amount': float(transaction.amount)}, timeout=20,
                )
                payload = response.json()
                link = (payload.get('data') or {}).get('paymentLink')
                parsed = urlparse(link or '')
                if not response.ok or str(payload.get('status')) != '00' or parsed.scheme != 'https' or not parsed.hostname:
                    return HostedCheckout.fail(transaction, 'Remita could not create a hosted checkout. Please check the account configuration.')
            except (requests.RequestException, ValueError):
                return HostedCheckout.fail(transaction, 'Unable to connect to Remita hosted checkout. Please try again.')
        return success_response(data={'checkout_type': 'hosted', 'payment_reference': reference, 'payment_url': link})

    @staticmethod
    def fail(transaction, message):
        transaction.status = 'failed'
        transaction.response = {**(transaction.response or {}), 'error': message}
        transaction.save(update_fields=['status', 'response', 'updated_at'])
        return bad_request_response(message=message)

    @staticmethod
    def verify(reference):
        from api.utils.payment.remita import Remita
        try:
            transaction = Transaction.objects.get(pk=reference, response__checkout_type='hosted')
        except (Transaction.DoesNotExist, ValueError, ValidationError):
            return bad_request_response(message='Transaction not found')
        if (transaction.response or {}).get('is_test'):
            if not settings.DEBUG or not settings.REMITA_LOCAL_TEST_MODE:
                return bad_request_response(message='Local test checkout is disabled')
            if transaction.status == 'success':
                return success_response(data={'success': True, 'is_test': True}, message='Test payment successful.')
            return bad_request_response(message='Payment not successful.' if transaction.status == 'failed' else 'Payment still processing')
        if not settings.REMITA_SECRET_KEY:
            return bad_request_response(message='Hosted checkout secret key is not configured')
        try:
            response = requests.get(f'{settings.REMITA_HOSTED_BASE_URL}/payment/merchant/verify/{transaction.id}',
                                    headers={'secretKey': settings.REMITA_SECRET_KEY}, timeout=20)
            payload = response.json()
            data = payload.get('data') or {}
            # A successful API request alone does not mean the payment was paid.
            paid = str(data.get('status') or data.get('transactionStatus') or '').upper() in {'00', 'PAID', 'SUCCESS', 'SUCCESSFUL'}
            matches = str(data.get('paymentIdentifier')) == str(transaction.id) and data.get('currency') == 'NGN'
            amount_matches = Decimal(str(data.get('amount', '-1'))) == transaction.amount
            if response.ok and paid and matches and amount_matches:
                Remita.apply_payment_success(transaction)
                return success_response(data={'success': True}, message='Payment successful.')
            return bad_request_response(message='Payment still processing')
        except (requests.RequestException, ValueError, ArithmeticError):
            return bad_request_response(message='Unable to verify hosted payment. Please try again.')
