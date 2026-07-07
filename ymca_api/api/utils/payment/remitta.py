import datetime
import hashlib
import requests
from django.conf import settings
from account.models import IDCard, User
from api.utils.response.response_format import bad_request_response, success_response
from transaction.models import Transaction


class Remitta:
    """
    Remitta class to handle payment-related tasks such as
    initiating transactions (generating RRR) and verifying payments.
    """

    @staticmethod
    def next_may_31(reference_date: datetime.date | None = None) -> datetime.date:
        """Return May 31st of the year following the given reference date."""
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
            id_number = (getattr(user, 'card', None) and user.card.id_number or '').upper()
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
        if Remitta.is_honorary_or_life(user):
            return 0
        member_prefix = Remitta.get_member_prefix(user)
        if member_prefix == 'LYY':
            return 2000 if renew else 2500
        if member_prefix == 'LYA':
            return 2500 if renew else 3000
        return 2500 if renew else 3000

    @staticmethod
    def calculate_activation_amount(user: User, years: int) -> int:
        safe_years = max(1, int(years or 1))
        if Remitta.is_honorary_or_life(user):
            return 0
        first_payment = Remitta.get_membership_amount(user, renew=False)
        renewal_payment = Remitta.get_membership_amount(user, renew=True)
        return first_payment + (max(0, safe_years - 1) * renewal_payment)

    @staticmethod
    def calculate_renewal_amount(user: User, years: int) -> int:
        safe_years = max(1, int(years or 1))
        if Remitta.is_honorary_or_life(user):
            return 0
        return Remitta.get_membership_amount(user, renew=True) * safe_years

    @staticmethod
    def calculate_arrears_years(user: User, reference_date: datetime.date | None = None) -> int:
        if reference_date is None:
            reference_date = datetime.date.today()
        try:
            card = getattr(user, 'card', None)
        except Exception:
            card = None
        expiry_date = (
            getattr(card, 'expired_at', None)
            or getattr(user, 'membership_expiry', None)
        )
        if not expiry_date or expiry_date >= reference_date:
            return 1
        return max(1, reference_date.year - expiry_date.year)

    @staticmethod
    def generate_api_hash(merchant_id: str, service_type_id: str, order_id: str, amount: str, api_key: str) -> str:
        """Generate Remitta API hash: SHA-512 of merchantId+serviceTypeId+orderId+amount+apiKey"""
        hash_string = f"{merchant_id}{service_type_id}{order_id}{amount}{api_key}"
        return hashlib.sha512(hash_string.encode('utf-8')).hexdigest()

    @staticmethod
    def generate_status_hash(merchant_id: str, rrr: str, api_key: str) -> str:
        """Generate Remitta status API hash: SHA-512 of merchantId+rrr+apiKey"""
        hash_string = f"{merchant_id}{rrr}{api_key}"
        return hashlib.sha512(hash_string.encode('utf-8')).hexdigest()

    @staticmethod
    def charge_user(request, user_id, transaction_type, **kwargs):
        try:
            user = request.user
            requested_years = request.data.get("years", 1)
            try:
                requested_years = max(1, int(requested_years or 1))
            except (TypeError, ValueError):
                return bad_request_response(message="Invalid number of years")

            arrears_years = 0
            if transaction_type == 'RENEWAL':
                arrears_years = Remitta.calculate_arrears_years(user)
                charged_years = max(requested_years, arrears_years)
                amount_naira = Remitta.calculate_renewal_amount(user, charged_years)
            else:
                charged_years = requested_years
                amount_naira = Remitta.calculate_activation_amount(user, charged_years)

            if amount_naira <= 0:
                return bad_request_response(message="Amount must be greater than zero")

            redirect_url = request.data.get('redirect_url')
            if not redirect_url:
                return bad_request_response(message="Redirect URL is required")

            # Create transaction record in database
            transaction = Transaction.objects.create(
                user=user,
                amount=amount_naira,
                transaction_type=transaction_type,
                payment_gateway='remitta',
                status="pending",
                response={
                    "requested_years": requested_years,
                    "charged_years": charged_years,
                    "arrears_years": arrears_years,
                    "transaction_type": transaction_type,
                    "enforced_amount": amount_naira,
                }
            )

            # Get Remitta credentials
            merchant_id = settings.REMITTA_MERCHANT_ID
            api_key = settings.REMITTA_API_KEY
            service_type_id = settings.REMITTA_SERVICE_TYPE_ID
            base_url = settings.REMITTA_BASE_URL

            if not all([merchant_id, api_key, service_type_id]):
                return bad_request_response(message="Remitta credentials are not configured")

            order_id = str(transaction.id)
            amount_str = str(amount_naira)
            api_hash = Remitta.generate_api_hash(merchant_id, service_type_id, order_id, amount_str, api_key)

            # Prepare request payload for Remitta
            data = {
                "serviceTypeId": service_type_id,
                "amount": amount_str,
                "orderId": order_id,
                "payerName": f"{user.first_name or ''} {user.last_name or ''}".strip(),
                "payerEmail": user.email,
                "payerPhone": getattr(user, 'phone_number', ''),
                "description": "YMCA membership payment",
            }

            headers = {
                "Content-Type": "application/json",
                "Authorization": f"REMITTA_APIKEY {api_key}",
                "MERCHANT_ID": merchant_id,
                "API_KEY": api_key,
                "REQUEST_ID": order_id,
                "API_DETAILS_HASH": api_hash,
            }

            # Call Remitta API to generate RRR
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Calling Remitta API: {base_url}/echannelsvc/merchant/api/paymentinit")
            logger.info(f"Request headers: {headers}")
            logger.info(f"Request data: {data}")
            logger.info(f"Generated API hash: {api_hash}")
            
            response = requests.post(
                f"{base_url}/echannelsvc/merchant/api/paymentinit",
                json=data,
                headers=headers
            )
            
            logger.info(f"Remitta response status: {response.status_code}")
            logger.info(f"Remitta response text: {response.text}")

            if response.ok:
                response_data = response.json()
                logger.info(f"Remitta response JSON: {response_data}")
                # Check Remitta's response status (varies by API version)
                status_code = response_data.get("statuscode") or response_data.get("status")
                if status_code in ["00", "0", "success", True]:
                    rrr = response_data.get("RRR") or response_data.get("rrr")
                    # Determine the correct payment base URL based on which API we're using
                    if "demo" in base_url:
                        payment_base_url = "https://demo.remitta.net"
                    else:
                        payment_base_url = "https://login.remita.net"
                    return success_response(
                        data={
                            "rrr": rrr,
                            "payment_url": f"{payment_base_url}/payment/v1/remita-pay-inline.bundle.js?rrr={rrr}",
                        },
                    )
                else:
                    error_msg = response_data.get("statusmessage") or response_data.get("message") or "Failed to generate RRR"
                    return bad_request_response(message=error_msg)

            error_msg = "Failed to initiate payment with Remitta"
            try:
                error_data = response.json()
                error_msg = f"{error_msg}: {error_data.get('statusmessage', response.text)}"
            except Exception:
                error_msg = f"{error_msg}: {response.text}"
            return bad_request_response(message=error_msg)

        except Exception as e:
            return bad_request_response(message=str(e))

    @staticmethod
    def validate_payment(rrr: str):
        try:
            merchant_id = settings.REMITTA_MERCHANT_ID
            api_key = settings.REMITTA_API_KEY
            base_url = settings.REMITTA_BASE_URL

            api_hash = Remitta.generate_status_hash(merchant_id, rrr, api_key)

            # Call Remitta status API
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"REMITTA_APIKEY {api_key}",
                "MERCHANT_ID": merchant_id,
                "API_KEY": api_key,
                "REQUEST_ID": rrr,
                "API_DETAILS_HASH": api_hash,
            }

            response = requests.get(
                f"{base_url}/echannelsvc/{merchant_id}/{rrr}/{api_hash}/status.reg",
                headers=headers
            )

            if response.ok:
                response_data = response.json()
                status_code = response_data.get("statuscode") or response_data.get("status")

                # Find transaction by RRR in response metadata (we store RRR in transaction.response)
                # First, try to find transaction with this RRR
                transaction = Transaction.objects.filter(
                    payment_gateway='remitta',
                    response__contains=rrr
                ).first()

                if not transaction:
                    return bad_request_response(message="Transaction not found")

                if status_code in ["00", "0", "success", True]:
                    if transaction.status == 'success':
                        return success_response(
                            message="Transaction already successful.",
                            data={
                                "transaction_id": str(transaction.id),
                                "success": True,
                                "amount": transaction.amount,
                                "message": "Transaction already successful."
                            }
                        )

                    transaction.status = "success"
                    transaction_metadata = transaction.response or {}
                    transaction.response = {
                        **transaction_metadata,
                        "remitta": response_data,
                        "rrr": rrr,
                    }

                    # Update user's card and membership status only if it's not a donation
                    if transaction.transaction_type != 'DONATION' and transaction.user:
                        id_card, created = IDCard.objects.get_or_create(user=transaction.user)
                        transaction_metadata = transaction.response or {}
                        charged_years = max(1, int(transaction_metadata.get('charged_years') or 1))
                        arrears_years = max(0, int(transaction_metadata.get('arrears_years') or 0))
                        payment_date = datetime.date.today()

                        id_card.is_active = True
                        id_card.first_time = False
                        id_card.expired = False
                        if transaction.transaction_type == 'RENEWAL' and arrears_years > 1:
                            id_card.expired_at = Remitta.next_may_31(payment_date)
                        else:
                            id_card.expired_at = Remitta.expiry_after_payment(charged_years, payment_date)
                        id_card.save()

                        transaction.user.membership_expiry = id_card.expired_at
                        transaction.user.is_active = True
                        transaction.user.save(update_fields=['membership_expiry', 'is_active', 'updated_at'])
                    
                    transaction.save()

                    return success_response(
                        message="Payment successful.",
                        data={
                            "transaction_id": str(transaction.id),
                            "success": True,
                            "amount": transaction.amount,
                            "message": "Payment successful."
                        }
                    )

                elif status_code in ["01", "failed", "99"]:
                    transaction.status = "failed"
                    transaction.response = {
                        **(transaction.response or {}),
                        "remitta": response_data,
                    }
                    transaction.save()
                    return bad_request_response(message="Payment not successful.")
                else:
                    return bad_request_response(message='Payment still processing')

            return bad_request_response(message='Failed to verify payment with Remitta')

        except Transaction.DoesNotExist:
            return bad_request_response(message="Transaction not found")
        except Exception as e:
            return bad_request_response(message=f'Unable to verify payment at the moment: {str(e)}')

    @staticmethod
    def charge_user_for_donation(request, amount, name, email=None):
        try:
            if amount <= 0:
                return bad_request_response(message="Amount must be greater than zero")

            redirect_url = request.data.get('redirect_url')
            if not redirect_url:
                return bad_request_response(message="Redirect URL is required")

            # Create transaction record in database
            # For donations, if no user is authenticated, we can still create a transaction
            user = request.user if request.user.is_authenticated else None
            transaction = Transaction.objects.create(
                user=user,
                amount=amount,
                transaction_type='DONATION',
                payment_gateway='remitta',
                status="pending",
                response={
                    "name": name,
                    "email": email,
                    "description": "Donation"
                }
            )

            # Get Remitta credentials
            merchant_id = settings.REMITTA_MERCHANT_ID
            api_key = settings.REMITTA_API_KEY
            service_type_id = settings.REMITTA_SERVICE_TYPE_ID
            base_url = settings.REMITTA_BASE_URL

            if not all([merchant_id, api_key, service_type_id]):
                return bad_request_response(message="Remitta credentials are not configured")

            order_id = str(transaction.id)
            amount_str = str(amount)
            api_hash = Remitta.generate_api_hash(merchant_id, service_type_id, order_id, amount_str, api_key)

            # Prepare request payload for Remitta
            data = {
                "serviceTypeId": service_type_id,
                "amount": amount_str,
                "orderId": order_id,
                "payerName": name,
                "payerEmail": email or '',
                "description": "Donation",
            }

            headers = {
                "Content-Type": "application/json",
                "Authorization": f"REMITTA_APIKEY {api_key}",
                "MERCHANT_ID": merchant_id,
                "API_KEY": api_key,
                "REQUEST_ID": order_id,
                "API_DETAILS_HASH": api_hash,
            }

            # Call Remitta API to generate RRR
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Calling Remitta API (donation): {base_url}/echannelsvc/merchant/api/paymentinit")
            logger.info(f"Request headers: {headers}")
            logger.info(f"Request data: {data}")
            logger.info(f"Generated API hash: {api_hash}")
            
            response = requests.post(
                f"{base_url}/echannelsvc/merchant/api/paymentinit",
                json=data,
                headers=headers
            )
            
            logger.info(f"Remitta donation response status: {response.status_code}")
            logger.info(f"Remitta donation response text: {response.text}")

            if response.ok:
                response_data = response.json()
                logger.info(f"Remitta donation response JSON: {response_data}")
                # Check Remitta's response status
                status_code = response_data.get("statuscode") or response_data.get("status")
                if status_code in ["00", "0", "success", True]:
                    rrr = response_data.get("RRR") or response_data.get("rrr")
                    # Determine the correct payment base URL based on which API we're using
                    if "demo" in base_url:
                        payment_base_url = "https://demo.remitta.net"
                    else:
                        payment_base_url = "https://login.remita.net"
                    return success_response(
                        data={
                            "rrr": rrr,
                            "payment_url": f"{payment_base_url}/payment/v1/remita-pay-inline.bundle.js?rrr={rrr}",
                        },
                    )
                else:
                    error_msg = response_data.get("statusmessage") or response_data.get("message") or "Failed to generate RRR"
                    return bad_request_response(message=error_msg)

            error_msg = "Failed to initiate donation payment with Remitta"
            try:
                error_data = response.json()
                error_msg = f"{error_msg}: {error_data.get('statusmessage', response.text)}"
            except Exception:
                error_msg = f"{error_msg}: {response.text}"
            return bad_request_response(message=error_msg)

        except Exception as e:
            return bad_request_response(message=str(e))

    @staticmethod
    def process_webhook(payload):
        try:
            rrr = payload.get("rrr") or payload.get("RRR")
            if not rrr:
                return bad_request_response(message="Invalid webhook payload: no RRR found")

            return Remitta.validate_payment(rrr)

        except Exception as e:
            return bad_request_response(message=str(e))

