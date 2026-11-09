import datetime
import requests
from decimal import Decimal, InvalidOperation
from django.core.exceptions import ValidationError
from django.db import transaction as db_transaction
from django.conf import settings
from account.models import IDCard, User
from api.utils.response.response_format import bad_request_response, success_response
from transaction.models import Transaction

class Paystack:
    """
    Paystack class to handle payment-related tasks such as
    initiating transactions and verifying payments.
    """

    @staticmethod
    def next_may_31(reference_date: datetime.date | None = None) -> datetime.date:
        """Return May 31st of the year following the given reference date.

        If no reference date is provided, uses today's date.
        This enforces the policy: ID cards expire May 31st of the following year
        after the payment date.
        """
        if reference_date is None:
            reference_date = datetime.date.today()
        return datetime.date(reference_date.year + 1, 5, 31)

    @staticmethod
    def expiry_after_payment(years: int = 1, reference_date: datetime.date | None = None) -> datetime.date:
        """Return the May 31st expiry after paying for the given number of years."""
        if reference_date is None:
            reference_date = datetime.date.today()

        safe_years = max(1, int(years or 1))
        return datetime.date(reference_date.year + safe_years, 5, 31)

    @staticmethod
    def get_member_prefix(user: User) -> str:
        try:
            id_number = (user.idcard.id_number or '').upper()
        except Exception:
            id_number = ''

        if id_number.startswith('LYY'):
            return 'LYY'
        if id_number.startswith('LYA'):
            return 'LYA'
        return ''

    @staticmethod
    def is_honorary_or_life(user: User) -> bool:
        membership_type = (getattr(user, 'membership_type', '') or '').lower()
        return membership_type in ['honorary', 'life']

    @staticmethod
    def get_membership_amount(user: User, renew: bool) -> int:
        if Paystack.is_honorary_or_life(user):
            return 0

        member_prefix = Paystack.get_member_prefix(user)
        if member_prefix == 'LYY':
            return 2000 if renew else 2500
        if member_prefix == 'LYA':
            return 2500 if renew else 3000
        return 2500 if renew else 3000

    @staticmethod
    def calculate_activation_amount(user: User, years: int) -> int:
        safe_years = max(1, int(years or 1))
        if Paystack.is_honorary_or_life(user):
            return 0
        first_payment = Paystack.get_membership_amount(user, renew=False)
        renewal_payment = Paystack.get_membership_amount(user, renew=True)
        return first_payment + (max(0, safe_years - 1) * renewal_payment)

    @staticmethod
    def calculate_renewal_amount(user: User, years: int) -> int:
        safe_years = max(1, int(years or 1))
        if Paystack.is_honorary_or_life(user):
            return 0
        return Paystack.get_membership_amount(user, renew=True) * safe_years

    @staticmethod
    def calculate_arrears_years(user: User, reference_date: datetime.date | None = None) -> int:
        if reference_date is None:
            reference_date = datetime.date.today()

        try:
            card = user.idcard
        except Exception:
            card = None

        expiry_date = getattr(card, 'expired_at', None) or getattr(user, 'membership_expiry', None)
        if not expiry_date or expiry_date >= reference_date:
            return 1

        return max(1, reference_date.year - expiry_date.year)

    @staticmethod
    def get_header():
        if not settings.PAYSTACK_SECRET_KEY:
            raise ValueError("Paystack secret key is not configured")
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        return headers

    @staticmethod
    def initialize(transaction, email, redirect_url):
        labels = {
            'DONATION': 'Donation',
            'ID': 'Membership Activation',
            'RENEWAL': 'Membership Renewal',
        }
        label = labels[transaction.transaction_type]
        metadata = {
            **(transaction.response or {}),
            'transaction_type': transaction.transaction_type,
            'payment_type': label,
            'description': f'YMCA Lagos - {label}',
            'payment_reference': str(transaction.id),
        }
        fields = [
            {'display_name': 'Payment Type', 'variable_name': 'payment_type', 'value': label},
            {'display_name': 'YMCA Reference', 'variable_name': 'payment_reference', 'value': str(transaction.id)},
        ]
        if transaction.transaction_type == 'DONATION':
            fields.append({'display_name': 'Donor Name', 'variable_name': 'donor_name', 'value': metadata['name']})
        elif transaction.user:
            name = f'{transaction.user.first_name or ""} {transaction.user.last_name or ""}'.strip()
            fields.append({'display_name': 'Member Name', 'variable_name': 'member_name', 'value': name or email})
            try:
                card_number = transaction.user.idcard.id_number
            except IDCard.DoesNotExist:
                card_number = ''
            if card_number:
                fields.append({'display_name': 'Membership Number', 'variable_name': 'membership_number', 'value': card_number})
            fields.append({'display_name': 'Years Paid', 'variable_name': 'charged_years', 'value': metadata['charged_years']})
        metadata['custom_fields'] = fields
        transaction.response = metadata
        transaction.save(update_fields=['response', 'updated_at'])
        try:
            response = requests.post(
                'https://api.paystack.co/transaction/initialize',
                json={
                    'email': email,
                    'amount': int(transaction.amount * 100),
                    'currency': 'NGN',
                    'reference': str(transaction.id),
                    'callback_url': redirect_url,
                    'metadata': metadata,
                },
                headers=Paystack.get_header(), timeout=20,
            )
            result = response.json()
            if response.ok and result.get('status') is True:
                return success_response(data={
                    'payment_url': result['data']['authorization_url'],
                    'payment_reference': str(transaction.id),
                })
            message = result.get('message', 'Failed to initiate payment.')
        except (requests.RequestException, ValueError, KeyError):
            message = 'Unable to initialize Paystack checkout. Please try again.'
        transaction.status = 'failed'
        transaction.response = {**(transaction.response or {}), 'error': message}
        transaction.save(update_fields=['status', 'response', 'updated_at'])
        return bad_request_response(message=message)
    
    @staticmethod
    def charge_user(request, user_id, transaction_type, **kwargs):
        user = request.user
        try:
            requested_years = max(1, int(request.data.get('years') or 1))
        except (TypeError, ValueError):
            return bad_request_response(message='Invalid number of years')
        arrears_years = Paystack.calculate_arrears_years(user) if transaction_type == 'RENEWAL' else 0
        charged_years = max(requested_years, arrears_years)
        amount = (Paystack.calculate_renewal_amount(user, charged_years) if transaction_type == 'RENEWAL'
                  else Paystack.calculate_activation_amount(user, charged_years))
        if amount <= 0:
            return bad_request_response(message='Amount must be greater than zero')
        transaction = Transaction.objects.create(
            user=user, amount=amount, transaction_type=transaction_type, payment_gateway='paystack',
            response={'requested_years': requested_years, 'charged_years': charged_years,
                      'arrears_years': arrears_years, 'transaction_type': transaction_type, 'enforced_amount': amount},
        )
        return Paystack.initialize(transaction, user.email, request.data.get('redirect_url'))

    @staticmethod
    def charge_user_for_donation(request, amount, name, email=None, phone=''):
        if amount <= 0:
            return bad_request_response(message='Amount must be greater than zero')
        transaction = Transaction.objects.create(
            amount=amount, transaction_type='DONATION', payment_gateway='paystack',
            response={'name': name, 'email': email, 'phone': phone},
        )
        return Paystack.initialize(transaction, email, request.data.get('redirect_url'))

    @staticmethod
    def validate_payment(reference):
        try:
            transaction = Transaction.objects.get(id=reference, payment_gateway='paystack')
        except (Transaction.DoesNotExist, ValueError, ValidationError):
            return bad_request_response(message='Transaction not found.')
        try:
            response = requests.get(
                f'https://api.paystack.co/transaction/verify/{transaction.id}',
                headers=Paystack.get_header(), timeout=20,
            )
            result = response.json()
            if not response.ok or result.get('status') is not True:
                return bad_request_response(message='Payment verification failed.')
            data = result['data']
            if (data.get('reference') != str(transaction.id) or data.get('currency') != 'NGN'
                    or Decimal(str(data.get('amount'))) != transaction.amount * 100):
                return bad_request_response(message='Payment details do not match the transaction.')
            with db_transaction.atomic():
                transaction = Transaction.objects.select_for_update().get(pk=transaction.pk)
                if transaction.status != 'success':
                    if data.get('status') == 'success':
                        Paystack.apply_payment_success(transaction, data)
                    elif data.get('status') == 'failed':
                        transaction.status = 'failed'
                        transaction.response = {**(transaction.response or {}), 'paystack': data}
                        transaction.save(update_fields=['status', 'response', 'updated_at'])
                        return bad_request_response(message='Payment not successful.')
                    else:
                        return bad_request_response(message='Payment still processing')
            return success_response(message='Payment successful.', data={
                'transaction_id': str(transaction.id), 'success': True, 'amount': transaction.amount,
            })
        except (requests.RequestException, ValueError, KeyError, InvalidOperation):
            return bad_request_response(message='Unable to verify payment at the moment')
        
    @staticmethod
    def apply_payment_success(transaction, data):
        metadata = transaction.response or {}
        if transaction.transaction_type != 'DONATION' and transaction.user:
            id_card, _ = IDCard.objects.get_or_create(user=transaction.user)
            charged_years = max(1, int(metadata.get('charged_years') or 1))
            arrears_years = max(0, int(metadata.get('arrears_years') or 0))
            id_card.is_active = True
            id_card.first_time = False
            id_card.expired = False
            if transaction.transaction_type == 'RENEWAL' and arrears_years > 1:
                id_card.expired_at = Paystack.next_may_31()
            else:
                id_card.expired_at = Paystack.expiry_after_payment(charged_years)
            id_card.save()
            transaction.user.membership_expiry = id_card.expired_at
            transaction.user.is_active = True
            transaction.user.save(update_fields=['membership_expiry', 'is_active', 'updated_at'])
        transaction.status = 'success'
        transaction.response = {**metadata, 'paystack': data}
        transaction.save(update_fields=['status', 'response', 'updated_at'])

    @staticmethod
    def process_webhook(payload):
        if payload.get('event') != 'charge.success':
            return success_response(message='Event acknowledged.')
        reference = (payload.get('data') or {}).get('reference')
        if not reference:
            return bad_request_response(message='Payment reference is required')
        return Paystack.validate_payment(reference)
