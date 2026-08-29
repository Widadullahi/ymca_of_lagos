import datetime
import json
from decimal import Decimal
import hashlib
import logging
import requests
from django.conf import settings
from account.models import IDCard, User
from api.utils.response.response_format import bad_request_response, success_response
from transaction.models import Transaction

logger = logging.getLogger(__name__)

REMITA_SUCCESS_STATUSES = ["00", "0", "025", "success", True]


class Remita:
    """
    Remita class to handle payment-related tasks such as
    initiating transactions (generating RRR) and verifying payments.
    """

    @staticmethod
    def log_remita_request(context: str, url: str, data: dict):
        logger.info(
            "%s Remita request: %s",
            context,
            {
                "url": url,
                "orderId": data.get("orderId"),
                "amount": data.get("amount"),
                "payerEmail": data.get("payerEmail"),
                "description": data.get("description"),
            },
        )

    @staticmethod
    def log_remita_response(context: str, response):
        logger.info("%s Remita response status: %s", context, response.status_code)
        logger.debug("%s Remita response body: %s", context, response.text)

    @staticmethod
    def parse_response(response):
        text = getattr(response, "text", "")
        text = text.strip() if isinstance(text, str) else ""
        if not text and hasattr(response, "json"):
            return response.json()
        if text.startswith("jsonp"):
            start = text.find("(")
            end = text.rfind(")")
            if start != -1 and end != -1 and end > start:
                text = text[start + 1 : end].strip()
        return json.loads(text)

    @staticmethod
    def get_payment_base_url(base_url: str) -> str:
        if "demo" in base_url:
            return "https://demo.remita.net"
        return "https://login.remita.net"

    @staticmethod
    def build_inline_payment_data(
        *,
        rrr: str,
        transaction_id: str,
        amount,
        payer_name: str,
        payer_email: str = "",
        payer_phone: str = "",
        description: str = "",
        base_url: str,
    ) -> dict:
        payment_base_url = Remita.get_payment_base_url(base_url)
        public_key = settings.REMITA_PUBLIC_KEY
        name_parts = payer_name.strip().split()
        first_name = name_parts[0] if len(name_parts) > 0 else ""
        last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
        customer_id = payer_email or transaction_id

        return {
            "rrr": rrr,
            "payment_url": f"{payment_base_url}/payment/v1/remita-pay-inline.bundle.js",
            "public_key": public_key,
            "inline_config": {
                "key": public_key,
                "processRrr": True,
                "customerId": customer_id,
                "transactionId": transaction_id,
                "firstName": first_name,
                "lastName": last_name,
                "email": payer_email or "",
                "narration": description,
                "amount": Remita.format_amount(amount),
                "extendedData": {
                    "customFields": [
                        {
                            "name": "rrr",
                            "value": rrr
                        }
                    ]
                },
            },
        }

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
            id_number = (getattr(user, 'idcard', None) and user.idcard.id_number or '').upper()
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
        if Remita.is_honorary_or_life(user):
            return 0
        member_prefix = Remita.get_member_prefix(user)
        if member_prefix == 'LYY':
            return 2000 if renew else 2500
        if member_prefix == 'LYA':
            return 2500 if renew else 3000
        return 2500 if renew else 3000

    @staticmethod
    def calculate_activation_amount(user: User, years: int) -> int:
        safe_years = max(1, int(years or 1))
        if Remita.is_honorary_or_life(user):
            return 0
        first_payment = Remita.get_membership_amount(user, renew=False)
        renewal_payment = Remita.get_membership_amount(user, renew=True)
        return first_payment + (max(0, safe_years - 1) * renewal_payment)

    @staticmethod
    def calculate_renewal_amount(user: User, years: int) -> int:
        safe_years = max(1, int(years or 1))
        if Remita.is_honorary_or_life(user):
            return 0
        return Remita.get_membership_amount(user, renew=True) * safe_years

    @staticmethod
    def calculate_arrears_years(user: User, reference_date: datetime.date | None = None) -> int:
        if reference_date is None:
            reference_date = datetime.date.today()
        try:
            idcard = getattr(user, 'idcard', None)
        except Exception:
            idcard = None
        expiry_date = (
            getattr(idcard, 'expired_at', None)
            or getattr(user, 'membership_expiry', None)
        )
        if not expiry_date or expiry_date >= reference_date:
            return 1
        return max(1, reference_date.year - expiry_date.year)

    @staticmethod
    def generate_api_hash(merchant_id: str, service_type_id: str, order_id: str, amount: str, api_key: str) -> str:
        """Generate Remita API hash: SHA-512 of merchantId+serviceTypeId+orderId+amount+apiKey"""
        hash_string = f"{merchant_id}{service_type_id}{order_id}{amount}{api_key}"
        return hashlib.sha512(hash_string.encode('utf-8')).hexdigest()

    @staticmethod
    def generate_status_hash(merchant_id: str, rrr: str, api_key: str) -> str:
        """Generate Remita status API hash: SHA-512 of rrr+apiKey+merchantId"""
        hash_string = f"{rrr}{api_key}{merchant_id}"
        return hashlib.sha512(hash_string.encode('utf-8')).hexdigest()

    @staticmethod
    def format_amount(amount) -> str:
        decimal_amount = Decimal(str(amount)).quantize(Decimal("0.01"))
        return format(decimal_amount, "f")

    @staticmethod
    def build_headers(merchant_id: str, api_hash: str) -> dict:
        return {
            "Content-Type": "application/json",
            "Authorization": f"remitaConsumerKey={merchant_id},remitaConsumerToken={api_hash}",
        }

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
                arrears_years = Remita.calculate_arrears_years(user)
                charged_years = max(requested_years, arrears_years)
                amount_naira = Remita.calculate_renewal_amount(user, charged_years)
            else:
                charged_years = requested_years
                amount_naira = Remita.calculate_activation_amount(user, charged_years)

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
                payment_gateway='remita',
                status="pending",
                response={
                    "requested_years": requested_years,
                    "charged_years": charged_years,
                    "arrears_years": arrears_years,
                    "transaction_type": transaction_type,
                    "enforced_amount": amount_naira,
                }
            )

            # Get Remita credentials
            merchant_id = settings.REMITA_MERCHANT_ID
            api_key = settings.REMITA_API_KEY
            service_type_id = settings.REMITA_SERVICE_TYPE_ID
            base_url = settings.REMITA_BASE_URL

            if not all([merchant_id, api_key, service_type_id, settings.REMITA_PUBLIC_KEY]):
                return bad_request_response(message="Remita credentials are not configured")

            order_id = str(transaction.id)
            amount_str = Remita.format_amount(amount_naira)
            api_hash = Remita.generate_api_hash(merchant_id, service_type_id, order_id, amount_str, api_key)

            # Prepare request payload for Remita
            data = {
                "serviceTypeId": service_type_id,
                "amount": amount_str,
                "orderId": order_id,
                "payerName": f"{user.first_name or ''} {user.last_name or ''}".strip(),
                "payerEmail": user.email,
                "payerPhone": getattr(user, 'phone_number', ''),
                "description": "YMCA membership payment",
            }

            headers = Remita.build_headers(merchant_id, api_hash)

            payment_init_url = f"{base_url}/echannelsvc/merchant/api/paymentinit"
            Remita.log_remita_request("membership", payment_init_url, data)

            response = requests.post(
                payment_init_url,
                json=data,
                headers=headers
            )

            Remita.log_remita_response("membership", response)

            if response.ok:
                response_data = Remita.parse_response(response)
                # Check Remita's response status (varies by API version)
                status_code = response_data.get("statuscode") or response_data.get("status")
                if status_code in REMITA_SUCCESS_STATUSES:
                    rrr = response_data.get("RRR") or response_data.get("rrr")
                    # Update transaction to store RRR in response field
                    transaction.response = {
                        **transaction.response,
                        "rrr": rrr
                    }
                    transaction.save()
                    return success_response(
                        data=Remita.build_inline_payment_data(
                            rrr=rrr,
                            transaction_id=order_id,
                            amount=amount_naira,
                            payer_name=data["payerName"],
                            payer_email=data["payerEmail"],
                            payer_phone=data["payerPhone"],
                            description=data["description"],
                            base_url=base_url,
                        ),
                    )
                else:
                    error_msg = response_data.get("statusmessage") or response_data.get("statusMessage") or response_data.get("message") or "Failed to generate RRR"
                    return bad_request_response(message=error_msg)

            error_msg = "Failed to initiate payment with Remita"
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
            logger.info("Starting payment validation for RRR: %s", rrr)
            merchant_id = settings.REMITA_MERCHANT_ID
            api_key = settings.REMITA_API_KEY
            base_url = settings.REMITA_BASE_URL
            logger.info("Remita credentials - merchant_id: %s, base_url: %s", merchant_id, base_url)

            api_hash = Remita.generate_status_hash(merchant_id, rrr, api_key)
            logger.info("Generated status API hash: %s", api_hash)

            # Call Remita status API
            headers = Remita.build_headers(merchant_id, api_hash)
            status_url = f"{base_url}/echannelsvc/{merchant_id}/{rrr}/{api_hash}/status.reg"
            logger.info("Calling Remita status API: %s", status_url)

            response = requests.get(
                status_url,
                headers=headers
            )

            logger.info("Remita status API response status: %s", response.status_code)
            logger.info("Remita status API response text: %s", response.text)

            if response.ok:
                response_data = Remita.parse_response(response)
                logger.info("Parsed Remita response data: %s", response_data)
                status_code = response_data.get("statuscode") or response_data.get("status")
                logger.info("Remita status code: %s", status_code)

                # Find transaction by RRR in response metadata (we store RRR in transaction.response)
                # First, try to find transaction with this RRR
                logger.info("Looking for transaction with RRR: %s", rrr)
                transaction = Transaction.objects.filter(
                    payment_gateway='remita',
                    response__rrr=rrr
                ).first()

                if transaction:
                    logger.info("Found transaction: %s, type: %s, status: %s",
                                transaction.id, transaction.transaction_type, transaction.status)
                else:
                    logger.error("No transaction found for RRR: %s", rrr)
                    return bad_request_response(message="Transaction not found")

                if status_code in REMITA_SUCCESS_STATUSES:
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
                        "remita": response_data,
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
                            id_card.expired_at = Remita.next_may_31(payment_date)
                        else:
                            id_card.expired_at = Remita.expiry_after_payment(charged_years, payment_date)
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
                        "remita": response_data,
                    }
                    transaction.save()
                    return bad_request_response(message="Payment not successful.")
                else:
                    return bad_request_response(message='Payment still processing')

            return bad_request_response(message='Failed to verify payment with Remita')

        except Transaction.DoesNotExist:
            logger.exception("Transaction not found for RRR: %s", rrr)
            return bad_request_response(message="Transaction not found")
        except Exception as e:
            logger.exception("Exception occurred during payment validation: %s", str(e))
            return bad_request_response(message=f'Unable to verify payment at the moment: {str(e)}')

    @staticmethod
    def charge_user_for_donation(request, amount, name, email=None, phone=''):
        try:
            if amount <= 0:
                return bad_request_response(message="Amount must be greater than zero")

            redirect_url = request.data.get('redirect_url')
            if not redirect_url:
                return bad_request_response(message="Redirect URL is required")

            user = request.user if request.user.is_authenticated else None
            transaction = Transaction.objects.create(
                user=user,
                amount=amount,
                transaction_type='DONATION',
                payment_gateway='remita',
                status="pending",
                response={
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "description": "Donation"
                }
            )

            # Get Remita credentials
            merchant_id = settings.REMITA_MERCHANT_ID
            api_key = settings.REMITA_API_KEY
            service_type_id = settings.REMITA_SERVICE_TYPE_ID
            base_url = settings.REMITA_BASE_URL

            if not all([merchant_id, api_key, service_type_id, settings.REMITA_PUBLIC_KEY]):
                return bad_request_response(message="Remita credentials are not configured")

            order_id = str(transaction.id)
            amount_str = Remita.format_amount(amount)
            api_hash = Remita.generate_api_hash(merchant_id, service_type_id, order_id, amount_str, api_key)

            # Prepare request payload for Remita
            data = {
                "serviceTypeId": service_type_id,
                "amount": amount_str,
                "orderId": order_id,
                "payerName": name,
                "payerEmail": email or '',
                "payerPhone": phone or '08000000000',
                "description": "Donation",
            }

            headers = Remita.build_headers(merchant_id, api_hash)

            payment_init_url = f"{base_url}/echannelsvc/merchant/api/paymentinit"
            Remita.log_remita_request("donation", payment_init_url, data)

            response = requests.post(
                payment_init_url,
                json=data,
                headers=headers
            )

            Remita.log_remita_response("donation", response)

            if response.ok:
                response_data = Remita.parse_response(response)
                # Check Remita's response status
                status_code = response_data.get("statuscode") or response_data.get("status")
                if status_code in REMITA_SUCCESS_STATUSES:
                    rrr = response_data.get("RRR") or response_data.get("rrr")
                    # Update transaction to store RRR in response field
                    transaction.response = {
                        **transaction.response,
                        "rrr": rrr
                    }
                    transaction.save()
                    return success_response(
                        data=Remita.build_inline_payment_data(
                            rrr=rrr,
                            transaction_id=order_id,
                            amount=amount,
                            payer_name=name,
                            payer_email=email or "",
                            payer_phone=phone or "08000000000",
                            description="Donation",
                            base_url=base_url,
                        ),
                    )
                else:
                    error_msg = response_data.get("statusmessage") or response_data.get("statusMessage") or response_data.get("message") or "Failed to generate RRR"
                    return bad_request_response(message=error_msg)

            error_msg = "Failed to initiate donation payment with Remita"
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

            return Remita.validate_payment(rrr)

        except Exception as e:
            return bad_request_response(message=str(e))

remita = Remita()
