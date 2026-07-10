from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from api.utils.payment.remitta import Remitta
from api.serializers.donation import DonationInitiateSerializer
from api.utils.response.response_format import success_response, bad_request_response
from account.models import IDCard, User
import datetime


class StartMembershipDemoView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
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
        return Remitta.charge_user(request, request.user.id, transaction_type='ID')


class RenewMembershipView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        redirect_url = request.data.get("redirect_url")
        if not redirect_url:
            return bad_request_response(
                message='Redirect URL is required',
            )
        return Remitta.charge_user(request, request.user.id, transaction_type='RENEWAL')


class VerifyPaymentView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        rrr = request.data.get("rrr")
        if not rrr:
            return bad_request_response(
                message='RRR is required',
            )
        return Remitta.validate_payment(rrr)


class InitiateDonationView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = DonationInitiateSerializer(data=request.data)
        if not serializer.is_valid():
            return bad_request_response(message=serializer.errors)
        
        return Remitta.charge_user_for_donation(
            request,
            amount=serializer.validated_data['amount'],
            name=serializer.validated_data['name'],
            email=serializer.validated_data.get('email'),
            phone=serializer.validated_data.get('phone', '')
        )


class RemittaWebhookView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        return Remitta.process_webhook(request.data)


class TotalMembersCountView(generics.GenericAPIView):
    permission_classes = []

    def get(self, request, *args, **kwargs):
        return success_response(data={"count": User.objects.count()})
