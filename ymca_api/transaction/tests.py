from django.test import TestCase
from django.test import RequestFactory
from django.conf import settings
from unittest.mock import patch, Mock
import datetime
from uuid import uuid4

from account.models import User, IDCard
from transaction.models import Transaction
from api.utils.payment.remitta import Remitta


class RemittaUtilityTests(TestCase):
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
        # Store original settings to restore after tests
        self.original_remitta_merchant_id = settings.REMITTA_MERCHANT_ID
        self.original_remitta_api_key = settings.REMITTA_API_KEY
        self.original_remitta_service_type_id = settings.REMITTA_SERVICE_TYPE_ID
        self.original_remitta_base_url = settings.REMITTA_BASE_URL
        # Set test credentials
        settings.REMITTA_MERCHANT_ID = '2547916'
        settings.REMITTA_API_KEY = '1946'
        settings.REMITTA_SERVICE_TYPE_ID = '4430731'
        settings.REMITTA_BASE_URL = 'https://demo.remitta.net/remita/exapp/api/v1/send/api'

    def tearDown(self):
        # Restore original settings
        settings.REMITTA_MERCHANT_ID = self.original_remitta_merchant_id
        settings.REMITTA_API_KEY = self.original_remitta_api_key
        settings.REMITTA_SERVICE_TYPE_ID = self.original_remitta_service_type_id
        settings.REMITTA_BASE_URL = self.original_remitta_base_url

    def test_next_may_31(self):
        """Test that next May 31 is calculated correctly"""
        # Test with current year
        test_date = datetime.date(2024, 6, 1)
        result = Remitta.next_may_31(test_date)
        self.assertEqual(result, datetime.date(2025, 5, 31))
        
        # Test before May 31
        test_date = datetime.date(2024, 3, 15)
        result = Remitta.next_may_31(test_date)
        self.assertEqual(result, datetime.date(2025, 5, 31))

    def test_expiry_after_payment(self):
        """Test expiry date calculation for multiple years"""
        test_date = datetime.date(2024, 6, 1)
        result = Remitta.expiry_after_payment(1, test_date)
        self.assertEqual(result, datetime.date(2025, 5, 31))
        
        result = Remitta.expiry_after_payment(3, test_date)
        self.assertEqual(result, datetime.date(2027, 5, 31))

    def test_get_member_prefix(self):
        """Test member prefix detection from ID number"""
        # Test LYA prefix
        self.id_card.id_number = 'LYA1234567'
        self.id_card.save()
        prefix = Remitta.get_member_prefix(self.user)
        self.assertEqual(prefix, 'LYA')
        
        # Test LYY prefix
        self.id_card.id_number = 'LYY7654321'
        self.id_card.save()
        prefix = Remitta.get_member_prefix(self.user)
        self.assertEqual(prefix, 'LYY')
        
        # Test no prefix
        self.id_card.id_number = 'OTHER123'
        self.id_card.save()
        prefix = Remitta.get_member_prefix(self.user)
        self.assertEqual(prefix, '')

    def test_is_honorary_or_life(self):
        """Test honorary/life member detection"""
        # Test regular member
        self.user.membership_type = 'full'
        self.user.save()
        self.assertFalse(Remitta.is_honorary_or_life(self.user))
        
        # Test honorary member
        self.user.membership_type = 'honorary'
        self.user.save()
        self.assertTrue(Remitta.is_honorary_or_life(self.user))
        
        # Test life member
        self.user.membership_type = 'life'
        self.user.save()
        self.assertTrue(Remitta.is_honorary_or_life(self.user))

    def test_get_membership_amount(self):
        """Test membership amount calculation"""
        # Test LYA first payment
        self.id_card.id_number = 'LYA1234567'
        self.id_card.save()
        amount = Remitta.get_membership_amount(self.user, renew=False)
        self.assertEqual(amount, 3000)
        
        # Test LYA renewal
        amount = Remitta.get_membership_amount(self.user, renew=True)
        self.assertEqual(amount, 2500)
        
        # Test LYY first payment
        self.id_card.id_number = 'LYY1234567'
        self.id_card.save()
        amount = Remitta.get_membership_amount(self.user, renew=False)
        self.assertEqual(amount, 2500)
        
        # Test LYY renewal
        amount = Remitta.get_membership_amount(self.user, renew=True)
        self.assertEqual(amount, 2000)
        
        # Test honorary member
        self.user.membership_type = 'honorary'
        self.user.save()
        amount = Remitta.get_membership_amount(self.user, renew=False)
        self.assertEqual(amount, 0)

    def test_calculate_activation_amount(self):
        """Test activation amount calculation for multiple years"""
        self.id_card.id_number = 'LYA1234567'
        self.id_card.save()
        
        # 1 year activation
        amount = Remitta.calculate_activation_amount(self.user, 1)
        self.assertEqual(amount, 3000)
        
        # 3 years activation
        amount = Remitta.calculate_activation_amount(self.user, 3)
        # First year: 3000, next 2 years: 2500 each = total 8000
        self.assertEqual(amount, 8000)

    def test_calculate_renewal_amount(self):
        """Test renewal amount calculation for multiple years"""
        self.id_card.id_number = 'LYA1234567'
        self.id_card.save()
        
        # 1 year renewal
        amount = Remitta.calculate_renewal_amount(self.user, 1)
        self.assertEqual(amount, 2500)
        
        # 2 years renewal
        amount = Remitta.calculate_renewal_amount(self.user, 2)
        self.assertEqual(amount, 5000)

    def test_calculate_arrears_years(self):
        """Test arrears years calculation"""
        today = datetime.date.today()
        
        # Test not expired
        self.id_card.expired_at = today + datetime.timedelta(days=30)
        self.id_card.save()
        arrears = Remitta.calculate_arrears_years(self.user, today)
        self.assertEqual(arrears, 1)
        
        # Test expired 1 year ago
        self.id_card.expired_at = datetime.date(today.year - 1, 5, 30)
        self.id_card.save()
        arrears = Remitta.calculate_arrears_years(self.user, today)
        self.assertEqual(arrears, 1)
        
        # Test expired 2 years ago
        self.id_card.expired_at = datetime.date(today.year - 2, 5, 30)
        self.id_card.save()
        arrears = Remitta.calculate_arrears_years(self.user, today)
        self.assertEqual(arrears, 2)

    def test_generate_api_hash(self):
        """Test API hash generation"""
        merchant_id = '2547916'
        service_type_id = '4430731'
        amount = '3000'
        order_id = str(uuid4())
        api_key = '1946'
        
        hash_val = Remitta.generate_api_hash(merchant_id, service_type_id, amount, order_id, api_key)
        self.assertIsNotNone(hash_val)
        self.assertEqual(len(hash_val), 128)  # SHA-512 produces 128 hex chars

    def test_generate_status_hash(self):
        """Test status hash generation"""
        merchant_id = '2547916'
        rrr = '123456789012'
        api_key = '1946'
        
        hash_val = Remitta.generate_status_hash(merchant_id, rrr, api_key)
        self.assertIsNotNone(hash_val)
        self.assertEqual(len(hash_val), 128)  # SHA-512 produces 128 hex chars

    @patch('requests.post')
    def test_charge_user_success(self, mock_post):
        """Test successful charge initiation"""
        # Mock Remitta API response
        mock_response = Mock()
        mock_response.ok = True
        mock_response.json.return_value = {
            'statuscode': '00',
            'RRR': '123456789012'
        }
        mock_post.return_value = mock_response
        
        # Create request
        request = self.factory.post('/membership/activation', {
            'redirect_url': 'https://example.com/payment',
            'years': 1
        })
        request.user = self.user
        
        # Call charge_user
        result = Remitta.charge_user(request, self.user.id, transaction_type='ID')
        
        # Verify transaction was created
        transaction = Transaction.objects.filter(user=self.user).first()
        self.assertIsNotNone(transaction)
        self.assertEqual(transaction.payment_gateway, 'remitta')
        self.assertEqual(transaction.status, 'pending')
        
        # Verify result
        self.assertEqual(result.status_code, 200)
        self.assertIn('rrr', result.data['data'])
        self.assertEqual(result.data['data']['rrr'], '123456789012')

    @patch('requests.post')
    def test_charge_user_failure(self, mock_post):
        """Test failed charge initiation"""
        # Mock Remitta API response with error
        mock_response = Mock()
        mock_response.ok = True
        mock_response.json.return_value = {
            'statuscode': '01',
            'statusmessage': 'Invalid request'
        }
        mock_post.return_value = mock_response
        
        # Create request
        request = self.factory.post('/membership/activation', {
            'redirect_url': 'https://example.com/payment',
            'years': 1
        })
        request.user = self.user
        
        # Call charge_user
        result = Remitta.charge_user(request, self.user.id, transaction_type='ID')
        
        # Verify result
        self.assertEqual(result.status_code, 400)

    @patch('requests.get')
    def test_validate_payment_success(self, mock_get):
        """Test successful payment validation"""
        # First create a transaction
        transaction = Transaction.objects.create(
            user=self.user,
            amount=3000,
            transaction_type='ID',
            payment_gateway='remitta',
            status='pending',
            response={'charged_years': 1, 'arrears_years': 0}
        )
        
        # Mock Remitta status response
        mock_response = Mock()
        mock_response.ok = True
        mock_response.json.return_value = {
            'statuscode': '00',
            'RRR': '123456789012'
        }
        mock_get.return_value = mock_response
        
        # Update transaction to include RRR
        transaction.response['rrr'] = '123456789012'
        transaction.save()
        
        # Call validate_payment
        result = Remitta.validate_payment('123456789012')
        
        # Verify transaction status
        transaction.refresh_from_db()
        self.assertEqual(transaction.status, 'success')
        
        # Verify user card is updated
        self.id_card.refresh_from_db()
        self.assertTrue(self.id_card.is_active)
        self.assertFalse(self.id_card.expired)
        self.assertIsNotNone(self.id_card.expired_at)
        
        # Verify user membership
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)
        self.assertIsNotNone(self.user.membership_expiry)

    @patch('requests.get')
    def test_validate_payment_failed(self, mock_get):
        """Test failed payment validation"""
        # First create a transaction
        transaction = Transaction.objects.create(
            user=self.user,
            amount=3000,
            transaction_type='ID',
            payment_gateway='remitta',
            status='pending',
            response={'charged_years': 1, 'arrears_years': 0, 'rrr': '123456789012'}
        )
        
        # Mock Remitta status response with failure
        mock_response = Mock()
        mock_response.ok = True
        mock_response.json.return_value = {
            'statuscode': '01',
            'statusmessage': 'Payment failed'
        }
        mock_get.return_value = mock_response
        
        # Call validate_payment
        result = Remitta.validate_payment('123456789012')
        
        # Verify transaction status
        transaction.refresh_from_db()
        self.assertEqual(transaction.status, 'failed')

    def test_process_webhook(self):
        """Test webhook processing"""
        with patch.object(Remitta, 'validate_payment') as mock_validate:
            mock_validate.return_value = Mock(status_code=200)
            
            # Test webhook with RRR
            result = Remitta.process_webhook({'rrr': '123456789012'})
            mock_validate.assert_called_once_with('123456789012')
            
            # Test webhook with uppercase RRR
            mock_validate.reset_mock()
            result = Remitta.process_webhook({'RRR': '123456789012'})
            mock_validate.assert_called_once_with('123456789012')
            
            # Test webhook without RRR
            result = Remitta.process_webhook({})
            self.assertEqual(result.status_code, 400)
