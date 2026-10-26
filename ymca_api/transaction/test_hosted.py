from unittest.mock import Mock, patch
from decimal import Decimal
from datetime import date, timedelta
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from account.models import IDCard, User
from transaction.models import Transaction


@override_settings(REMITA_CHECKOUT_MODE='hosted', REMITA_SECRET_KEY='test-secret', REMITA_LOCAL_TEST_MODE=False)
class HostedCheckoutTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.payload = {'name': 'Ada Obi', 'email': 'ada@example.com', 'amount': '1000.00', 'redirect_url': 'http://127.0.0.1:5173/payment'}

    @patch('api.utils.payment.hosted.requests.post')
    def test_hosted_initialization_does_not_need_service_id(self, post):
        post.return_value = Mock(ok=True)
        post.return_value.json.return_value = {'status': '00', 'data': {'paymentLink': 'https://payment-qa.systemspecsng.com/test'}}
        with override_settings(REMITA_SERVICE_TYPE_ID='', REMITA_MERCHANT_ID='', REMITA_API_KEY=''):
            response = self.client.post('/api/v1/initiate/donation', self.payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['checkout_type'], 'hosted')
        self.assertNotIn('serviceTypeId', post.call_args.kwargs['json'])
        self.assertEqual(post.call_args.kwargs['headers'], {'secretKey': 'test-secret'})
        self.assertNotIn('test-secret', str(response.data))

    @override_settings(DEBUG=True, REMITA_LOCAL_TEST_MODE=True)
    def test_local_checkout_completion_and_verification(self):
        initialized = self.client.post('/api/v1/initiate/donation', self.payload, format='json')
        reference = initialized.data['data']['payment_reference']
        path = f'/api/v1/payment/local-test/{reference}/'
        self.assertEqual(self.client.get(path).status_code, 200)
        self.assertEqual(self.client.post(path, {'outcome': 'success'}, format='json').status_code, 200)
        verified = self.client.post('/api/v1/payment/verify', {'reference': reference}, format='json')
        self.assertTrue(verified.data['data']['success'])
        self.assertTrue(verified.data['data']['is_test'])

    @override_settings(DEBUG=False, REMITA_LOCAL_TEST_MODE=True)
    def test_local_simulation_is_unavailable_in_production(self):
        tx = Transaction.objects.create(amount=1000, transaction_type='DONATION', response={'checkout_type': 'hosted', 'is_test': True})
        self.assertEqual(self.client.post(f'/api/v1/payment/local-test/{tx.id}/', {'outcome': 'success'}, format='json').status_code, 404)
        self.assertEqual(self.client.post('/api/v1/payment/verify', {'reference': str(tx.id)}, format='json').status_code, 400)

    @patch('api.utils.payment.hosted.requests.get')
    def test_successful_api_wrapper_cannot_activate_unpaid_or_mismatched_payment(self, get):
        tx = Transaction.objects.create(amount=1000, transaction_type='DONATION', response={'checkout_type': 'hosted'})
        get.return_value = Mock(ok=True)
        for data in ({'status': 'pending'}, {'status': 'PAID', 'amount': 1, 'currency': 'NGN', 'paymentIdentifier': str(tx.id)},
                     {'status': 'PAID', 'amount': 1000, 'currency': 'NGN', 'paymentIdentifier': 'someone-else'}):
            get.return_value.json.return_value = {'status': '00', 'data': data}
            self.assertEqual(self.client.post('/api/v1/payment/verify', {'reference': str(tx.id)}, format='json').status_code, 400)
            tx.refresh_from_db()
            self.assertEqual(tx.status, 'pending')
        get.return_value.json.return_value = {'status': '00', 'data': {'status': 'PAID', 'amount': 1000, 'currency': 'NGN', 'paymentIdentifier': str(tx.id)}}
        self.assertEqual(self.client.post('/api/v1/payment/verify', {'reference': str(tx.id)}, format='json').status_code, 200)

    @override_settings(REMITA_SECRET_KEY='')
    def test_missing_secret_marks_attempt_failed(self):
        self.assertEqual(self.client.post('/api/v1/initiate/donation', self.payload, format='json').status_code, 400)
        self.assertEqual(Transaction.objects.get().status, 'failed')


class DonationAdminTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(email='admin@example.com', password='test', is_admin=True)
        self.member = User.objects.create_user(email='member@example.com', password='test')
        Transaction.objects.create(amount=1000, transaction_type='DONATION', status='success', response={'name': 'Ada Obi', 'email': 'ada@example.com', 'secretKey': 'must-not-leak'})
        Transaction.objects.create(amount=2000, transaction_type='DONATION', status='pending', response={'name': 'Other Donor'})
        Transaction.objects.create(amount=9000, transaction_type='ID', status='success')

    def test_donations_are_not_public_or_member_accessible(self):
        self.assertIn(self.client.get('/api/v1/admin/donations/').status_code, (401, 403))
        self.client.force_authenticate(self.member)
        self.assertEqual(self.client.get('/api/v1/admin/donations/').status_code, 403)

    def test_admin_summary_search_and_status_filter(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get('/api/v1/admin/donations/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['summary']['received'], Decimal('1000'))
        self.assertEqual(response.data['data']['count'], 2)
        self.assertNotIn('must-not-leak', str(response.data))
        self.assertEqual(self.client.get('/api/v1/admin/donations/?status=pending').data['data']['count'], 1)
        self.assertEqual(self.client.get('/api/v1/admin/donations/?search=Ada').data['data']['count'], 1)
        self.assertEqual(self.client.get('/api/v1/admin/donations/?status=bogus').status_code, 400)

    def test_admin_pagination(self):
        self.client.force_authenticate(self.admin)
        Transaction.objects.bulk_create([Transaction(amount=1, transaction_type='DONATION') for _ in range(21)])
        first = self.client.get('/api/v1/admin/donations/').data['data']
        second = self.client.get('/api/v1/admin/donations/?page=2').data['data']
        self.assertEqual(len(first['donations']), 20)
        self.assertEqual(len(second['donations']), 3)


class CardVerificationSecurityTests(TestCase):
    def test_public_card_check_returns_minimal_data_without_mutating_card(self):
        user = User.objects.create_user(
            email='member@example.com', password='test-password',
            first_name='Ada', last_name='Obi',
        )
        card = IDCard.objects.create(
            user=user, id_number='LYY1234567', is_active=True,
            expired=False, expired_at=date.today() - timedelta(days=1),
        )

        response = APIClient().get('/api/v1/id-verification/LYY1234567')

        self.assertEqual(response.status_code, 200)
        card_data = response.data['data']['data']
        self.assertEqual(card_data['first_name'], 'Ada')
        self.assertEqual(card_data['last_name'], 'Obi')
        self.assertTrue(card_data['expired'])
        self.assertNotIn('id', card_data)
        self.assertNotIn('signature', card_data)
        card.refresh_from_db()
        self.assertFalse(card.expired)
