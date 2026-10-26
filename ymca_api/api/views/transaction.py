from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import AnonRateThrottle
from django.conf import settings
from api.utils.payment.remita import remita
from api.serializers.donation import DonationInitiateSerializer
from api.utils.response.response_format import success_response, bad_request_response
from account.models import IDCard, User
from transaction.models import Transaction
from api.utils.permissions import IsAppAdmin
from django.db.models import Q, Sum
from django.core.paginator import Paginator
import datetime


class PaymentVerificationThrottle(AnonRateThrottle):
    rate = '30/minute'


class DonationInitiationThrottle(AnonRateThrottle):
    rate = '5/minute'


class StartMembershipDemoView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if not settings.DEBUG or not settings.ENABLE_DEMO_MEMBERSHIP:
            return bad_request_response(message="Demo activation is disabled", status_code=403)
        id_card, created = IDCard.objects.get_or_create(user=request.user)
        id_card.is_active = True
        id_card.first_time = False
        id_card.expired = False
        id_card.expired_at = datetime.date.today() + datetime.timedelta(days=30)
        id_card.save()
        return success_response(
            message="Payment successful.",
            data={
                "transaction_id": str('demo-id'),
                "success": True,
                "amount": 10,
                "message": "Payment successful."
            }
        )


class ActivateMembershipView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        redirect_url = request.data.get("redirect_url")
        if not redirect_url:
            return bad_request_response(
                message='Redirect URL is required',
            )
        return remita.charge_user(request, request.user.id, transaction_type='ID')


class RenewMembershipView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        redirect_url = request.data.get("redirect_url")
        if not redirect_url:
            return bad_request_response(
                message='Redirect URL is required',
            )
        return remita.charge_user(request, request.user.id, transaction_type='RENEWAL')


class VerifyPaymentView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [PaymentVerificationThrottle]

    def post(self, request, *args, **kwargs):
        if request.data.get('reference'):
            from api.utils.payment.hosted import HostedCheckout
            return HostedCheckout.verify(request.data['reference'])
        rrr = request.data.get("rrr")
        if not rrr:
            return bad_request_response(
                message='RRR is required',
            )
        return remita.validate_payment(rrr)


class InitiateDonationView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [DonationInitiationThrottle]

    def post(self, request, *args, **kwargs):
        serializer = DonationInitiateSerializer(data=request.data)
        if not serializer.is_valid():
            return bad_request_response(message=serializer.errors)
        
        return remita.charge_user_for_donation(
            request,
            amount=serializer.validated_data['amount'],
            name=serializer.validated_data['name'],
            email=serializer.validated_data.get('email'),
            phone=serializer.validated_data.get('phone', '')
        )


class RemitaWebhookView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        return remita.process_webhook(request.data)


class TotalMembersCountView(generics.GenericAPIView):
    permission_classes = []

    def get(self, request, *args, **kwargs):
        return success_response(data={"count": User.objects.count()})


class AdminDonationsView(generics.GenericAPIView):
    permission_classes = [IsAppAdmin]

    def get(self, request):
        donations = Transaction.objects.filter(transaction_type='DONATION').select_related('user').order_by('-created_at')
        search = request.query_params.get('search', '').strip()[:200]
        if search:
            donations = donations.filter(Q(response__name__icontains=search) | Q(response__email__icontains=search) |
                                         Q(response__rrr__icontains=search) | Q(user__email__icontains=search))
        summary = {'count': donations.count(), 'received': donations.filter(status='success').aggregate(total=Sum('amount'))['total'] or 0,
                   'pending': donations.filter(status='pending').count(), 'failed': donations.filter(status='failed').count()}
        status = request.query_params.get('status')
        if status:
            if status not in {'success', 'pending', 'failed'}:
                return bad_request_response(message='Invalid donation status')
            donations = donations.filter(status=status)
        page = Paginator(donations, 20).get_page(request.query_params.get('page', 1))
        records = []
        for donation in page:
            metadata = donation.response or {}
            records.append({'id': str(donation.id), 'name': metadata.get('name') or 'Anonymous donor',
                            'email': metadata.get('email') or (donation.user.email if donation.user else ''),
                            'phone': metadata.get('phone', ''), 'amount': str(donation.amount), 'status': donation.status,
                            'reference': metadata.get('rrr') or str(donation.id), 'created_at': donation.created_at,
                            'is_test': bool(metadata.get('is_test')), 'error': metadata.get('error', '')})
        return success_response(data={'donations': records, 'summary': summary, 'page': page.number,
                                      'pages': page.paginator.num_pages, 'count': page.paginator.count})


class LocalCheckoutView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get_transaction(self, reference):
        if not settings.DEBUG or not settings.REMITA_LOCAL_TEST_MODE:
            return None
        return Transaction.objects.filter(pk=reference, response__is_test=True, response__checkout_type='hosted').first()

    def get(self, request, reference):
        transaction = self.get_transaction(reference)
        if not transaction:
            return bad_request_response(message='Local test checkout is disabled or unavailable', status_code=404)
        return success_response(data={'reference': str(transaction.id), 'amount': str(transaction.amount), 'status': transaction.status})

    def post(self, request, reference):
        transaction = self.get_transaction(reference)
        if not transaction:
            return bad_request_response(message='Local test checkout is disabled or unavailable', status_code=404)
        if request.data.get('outcome') == 'success':
            remita.apply_payment_success(transaction)
        elif request.data.get('outcome') == 'failed' and transaction.status != 'success':
            transaction.status = 'failed'
            transaction.save(update_fields=['status', 'updated_at'])
        else:
            return bad_request_response(message='Invalid test outcome')
        return success_response(data={'reference': str(transaction.id)})
