from django.test import TestCase, override_settings
from django.test import RequestFactory
from unittest.mock import patch, Mock
import datetime
from uuid import uuid4

from account.models import User, IDCard
from transaction.models import Transaction
from api.utils.payment.paystack import Paystack


class PaystackUtilityTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            phone_number='08012345678'
        )
        # Create ID card for user
        self.id_card = IDCard.objects.create(
            user=self.user,
            id_number='LYA1234567'
        )

    def test_next_may_31(self):
        """Test that next May 31 is calculated correctly"""
        # Test with current year
        test_date = datetime.date(2024, 6, 1)
        result = Paystack.next_may_31(test_date)
        self.assertEqual(result, datetime.date(2025, 5, 31))

        # Test before May 31
        test_date = datetime.date(2024, 3, 15)
        result = Paystack.next_may_31(test_date)
        self.assertEqual(result, datetime.date(2025, 5, 31))

    def test_expiry_after_payment(self):
        """Test expiry date calculation for multiple years"""
        test_date = datetime.date(2024, 6, 1)
        result = Paystack.expiry_after_payment(1, test_date)
        self.assertEqual(result, datetime.date(2025, 5, 31))

        result = Paystack.expiry_after_payment(3, test_date)
        self.assertEqual(result, datetime.date(2027, 5, 31))

    def test_get_member_prefix(self):
        """Test member prefix detection from ID number"""
        # Test LYA prefix
        self.id_card.id_number = 'LYA1234567'
        self.id_card.save()
        prefix = Paystack.get_member_prefix(self.user)
        self.assertEqual(prefix, 'LYA')

        # Test LYY prefix
        self.id_card.id_number = 'LYY7654321'
        self.id_card.save()
        prefix = Paystack.get_member_prefix(self.user)
        self.assertEqual(prefix, 'LYY')

        # Test no prefix
        self.id_card.id_number = 'OTHER123'
        self.id_card.save()
        prefix = Paystack.get_member_prefix(self.user)
        self.assertEqual(prefix, '')

    def test_is_honorary_or_life(self):
        """Test honorary/life member detection"""
        # Test regular member
        self.user.membership_type = 'full'
        self.user.save()
        self.assertFalse(Paystack.is_honorary_or_life(self.user))

        # Test honorary member
        self.user.membership_type = 'honorary'
        self.user.save()
        self.assertTrue(Paystack.is_honorary_or_life(self.user))

        # Test life member
        self.user.membership_type = 'life'
        self.user.save()
        self.assertTrue(Paystack.is_honorary_or_life(self.user))

    def test_get_membership_amount(self):
        """Test membership amount calculation"""
        # Test LYA first payment
        self.id_card.id_number = 'LYA1234567'
        self.id_card.save()
        amount = Paystack.get_membership_amount(self.user, renew=False)
        self.assertEqual(amount, 3000)

        # Test LYA renewal
        amount = Paystack.get_membership_amount(self.user, renew=True)
        self.assertEqual(amount, 2500)

        # Test LYY first payment
        self.id_card.id_number = 'LYY1234567'
        self.id_card.save()
        amount = Paystack.get_membership_amount(self.user, renew=False)
        self.assertEqual(amount, 2500)

        # Test LYY renewal
        amount = Paystack.get_membership_amount(self.user, renew=True)
        self.assertEqual(amount, 2000)

        # Test honorary member
        self.user.membership_type = 'honorary'
        self.user.save()
        amount = Paystack.get_membership_amount(self.user, renew=False)
        self.assertEqual(amount, 0)

    def test_calculate_activation_amount(self):
        """Test activation amount calculation for multiple years"""
        self.id_card.id_number = 'LYA1234567'
        self.id_card.save()

        # 1 year activation
        amount = Paystack.calculate_activation_amount(self.user, 1)
        self.assertEqual(amount, 3000)

        # 3 years activation
        amount = Paystack.calculate_activation_amount(self.user, 3)
        # First year: 3000, next 2 years: 2500 each = total 8000
        self.assertEqual(amount, 8000)

    def test_calculate_renewal_amount(self):
        """Test renewal amount calculation for multiple years"""
        self.id_card.id_number = 'LYA1234567'
        self.id_card.save()

        # 1 year renewal
        amount = Paystack.calculate_renewal_amount(self.user, 1)
        self.assertEqual(amount, 2500)

        # 2 years renewal
        amount = Paystack.calculate_renewal_amount(self.user, 2)
        self.assertEqual(amount, 5000)

    def test_calculate_arrears_years(self):
        """Test arrears years calculation"""
        today = datetime.date.today()

        # Test not expired
        self.id_card.expired_at = today + datetime.timedelta(days=30)
        self.id_card.save()
        arrears = Paystack.calculate_arrears_years(self.user, today)
        self.assertEqual(arrears, 1)

        # Test expired 1 year ago
        self.id_card.expired_at = datetime.date(today.year - 1, 5, 30)
        self.id_card.save()
        arrears = Paystack.calculate_arrears_years(self.user, today)
        self.assertEqual(arrears, 1)

        # Test expired 2 years ago
        self.id_card.expired_at = datetime.date(today.year - 2, 5, 30)
        self.id_card.save()
        arrears = Paystack.calculate_arrears_years(self.user, today)
        self.assertEqual(arrears, 2)


@override_settings(PAYSTACK_SECRET_KEY='sk_test_example')
class PaystackPaymentTests(TestCase):
    def setUp(self):
        from rest_framework.test import APIClient
        self.client = APIClient()
        self.user = User.objects.create_user(email='member@example.com', password='testpass123', first_name='Test', last_name='Member')
        IDCard.objects.create(user=self.user, id_number='LYA1234567')

    def verified_data(self, transaction, **overrides):
        return {'reference': str(transaction.id), 'amount': int(transaction.amount * 100),
                'currency': 'NGN', 'status': 'success', **overrides}

    @patch('api.utils.payment.paystack.requests.post')
    def test_membership_initializes_paystack(self, post):
        post.return_value = Mock(ok=True)
        post.return_value.json.return_value = {'status': True, 'data': {'authorization_url': 'https://checkout.paystack.com/test'}}
        self.client.force_authenticate(self.user)
        response = self.client.post('/api/v1/membership/activation', {'redirect_url': 'https://example.com/payment', 'years': 2}, format='json')
        self.assertEqual(response.status_code, 200)
        transaction = Transaction.objects.get()
        self.assertEqual(transaction.payment_gateway, 'paystack')
        metadata = post.call_args.kwargs['json']['metadata']
        self.assertEqual(metadata['description'], 'YMCA Lagos - Membership Activation')
        fields = {field['display_name']: field['value'] for field in metadata['custom_fields']}
        self.assertEqual(fields['Payment Type'], 'Membership Activation')
        self.assertEqual(fields['Membership Number'], 'LYA1234567')
        self.assertEqual(fields['Years Paid'], 2)
        self.assertEqual(transaction.amount, 5500)
        self.assertEqual(post.call_args.kwargs['json']['amount'], 550000)
        self.assertEqual(response.data['data']['payment_reference'], str(transaction.id))

    @patch('api.utils.payment.paystack.requests.post')
    def test_renewal_charges_arrears_for_youth_member(self, post):
        card = self.user.idcard
        card.id_number = 'LYY1234567'
        card.expired_at = datetime.date(datetime.date.today().year - 2, 5, 31)
        card.save()
        post.return_value = Mock(ok=True)
        post.return_value.json.return_value = {'status': True, 'data': {'authorization_url': 'https://checkout.paystack.com/test'}}
        self.client.force_authenticate(self.user)
        response = self.client.post('/api/v1/membership/renewal', {'redirect_url': 'https://example.com/payment', 'years': 1}, format='json')
        self.assertEqual(response.status_code, 200)
        transaction = Transaction.objects.get()
        self.assertEqual(transaction.amount, 4000)
        metadata = post.call_args.kwargs['json']['metadata']
        self.assertEqual(metadata['description'], 'YMCA Lagos - Membership Renewal')
        self.assertEqual(metadata['transaction_type'], 'RENEWAL')
        self.assertEqual(metadata['custom_fields'][0]['value'], 'Membership Renewal')
        self.assertEqual(transaction.response['arrears_years'], 2)
        self.assertEqual(transaction.response['charged_years'], 2)

    @patch('api.utils.payment.paystack.requests.post')
    def test_anonymous_donation_is_recorded(self, post):
        post.return_value = Mock(ok=True)
        post.return_value.json.return_value = {'status': True, 'data': {'authorization_url': 'https://checkout.paystack.com/test'}}
        response = self.client.post('/api/v1/initiate/donation', {'name': 'Donor', 'email': 'donor@example.com', 'phone': '08012345678', 'amount': '1200.50', 'redirect_url': 'https://example.com/payment'}, format='json')
        self.assertEqual(response.status_code, 200)
        transaction = Transaction.objects.get()
        self.assertIsNone(transaction.user)
        self.assertEqual(transaction.response['name'], 'Donor')
        metadata = post.call_args.kwargs['json']['metadata']
        self.assertEqual(metadata['transaction_type'], 'DONATION')
        self.assertEqual(metadata['description'], 'YMCA Lagos - Donation')
        fields = {field['display_name']: field['value'] for field in metadata['custom_fields']}
        self.assertEqual(fields['Payment Type'], 'Donation')
        self.assertEqual(fields['Donor Name'], 'Donor')
        self.assertEqual(fields['YMCA Reference'], str(transaction.id))
        self.assertEqual(transaction.response['custom_fields'], metadata['custom_fields'])
        self.assertEqual(post.call_args.kwargs['json']['amount'], 120050)
        self.assertEqual(post.call_args.kwargs['json']['reference'], str(transaction.id))

    @patch('api.utils.payment.paystack.requests.get')
    def test_donation_verification_does_not_activate_card(self, get):
        transaction = Transaction.objects.create(amount=1000, transaction_type='DONATION', payment_gateway='paystack', response={'name': 'Donor'})
        get.return_value = Mock(ok=True)
        get.return_value.json.return_value = {'status': True, 'data': self.verified_data(transaction)}
        response = self.client.post('/api/v1/payment/verify', {'reference': str(transaction.id)}, format='json')
        self.assertTrue(response.data['data']['success'])
        transaction.refresh_from_db()
        self.assertEqual(transaction.status, 'success')
        self.assertEqual(transaction.response['name'], 'Donor')
        self.assertEqual(IDCard.objects.count(), 1)

    @patch('api.utils.payment.paystack.requests.get')
    def test_verification_rejects_amount_currency_and_reference_mismatch(self, get):
        transaction = Transaction.objects.create(user=self.user, amount=3000, transaction_type='ID', payment_gateway='paystack')
        get.return_value = Mock(ok=True)
        for override in [{'amount': 1}, {'currency': 'USD'}, {'reference': str(uuid4())}]:
            with self.subTest(override=override):
                get.return_value.json.return_value = {'status': True, 'data': self.verified_data(transaction, **override)}
                response = Paystack.validate_payment(str(transaction.id))
                self.assertEqual(response.status_code, 400)
                transaction.refresh_from_db()
                self.assertEqual(transaction.status, 'pending')

    @patch('api.utils.payment.paystack.requests.get')
    def test_membership_verification_is_idempotent(self, get):
        transaction = Transaction.objects.create(user=self.user, amount=5500, transaction_type='ID', payment_gateway='paystack', response={'charged_years': 2})
        get.return_value = Mock(ok=True)
        get.return_value.json.return_value = {'status': True, 'data': self.verified_data(transaction)}
        self.assertEqual(Paystack.validate_payment(str(transaction.id)).status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.membership_expiry, Paystack.expiry_after_payment(2))
        with patch.object(Paystack, 'apply_payment_success') as apply:
            self.assertEqual(Paystack.validate_payment(str(transaction.id)).status_code, 200)
            apply.assert_not_called()

    @patch('api.utils.payment.paystack.requests.get')
    def test_pending_and_failed_are_not_successful(self, get):
        transaction = Transaction.objects.create(amount=1000, transaction_type='DONATION', payment_gateway='paystack')
        get.return_value = Mock(ok=True)
        for status in ['pending', 'failed']:
            get.return_value.json.return_value = {'status': True, 'data': self.verified_data(transaction, status=status)}
            self.assertEqual(Paystack.validate_payment(str(transaction.id)).status_code, 400)
        transaction.refresh_from_db()
        self.assertEqual(transaction.status, 'failed')

    @patch('api.utils.payment.paystack.requests.post')
    def test_initialization_failure_is_recorded(self, post):
        import requests
        post.side_effect = requests.Timeout()
        self.client.post('/api/v1/initiate/donation', {'name': 'Donor', 'email': 'donor@example.com', 'amount': 1000, 'redirect_url': 'https://example.com/payment'}, format='json')
        self.assertEqual(Transaction.objects.get().status, 'failed')

    @patch('api.utils.payment.paystack.Paystack.validate_payment')
    def test_webhook_requires_valid_signature(self, verify):
        import hashlib
        import hmac
        import json
        from api.utils.response.response_format import success_response
        verify.return_value = success_response(data={'success': True})
        body = json.dumps({'event': 'charge.success', 'data': {'reference': str(uuid4())}})
        response = self.client.post('/api/v1/payment/webhook', body, content_type='application/json')
        self.assertEqual(response.status_code, 401)
        verify.assert_not_called()
        signature = hmac.new(b'sk_test_example', body.encode(), hashlib.sha512).hexdigest()
        response = self.client.post('/api/v1/payment/webhook', body, content_type='application/json', HTTP_X_PAYSTACK_SIGNATURE=signature)
        self.assertEqual(response.status_code, 200)
        verify.assert_called_once()

    def test_unknown_reference_and_removed_local_checkout(self):
        response = self.client.post('/api/v1/payment/verify', {'reference': 'invalid'}, format='json')
        self.assertEqual(response.status_code, 400)
        response = self.client.get(f'/api/v1/payment/local-test/{uuid4()}/')
        self.assertEqual(response.status_code, 404)
