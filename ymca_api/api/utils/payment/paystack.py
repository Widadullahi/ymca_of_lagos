import datetime
import requests
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
            id_number = (user.card.id_number or '').upper()
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
            card = user.card
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
    def charge_user(request,user_id, transaction_type, **kwargs):
        transaction=None
        try:
            user = request.user
            requested_years = request.data.get("years", 1)
            try:
                requested_years = max(1, int(requested_years or 1))
            except (TypeError, ValueError):
                return bad_request_response(message="Invalid number of years")

            arrears_years = 0
            if transaction_type == 'RENEWAL':
                arrears_years = Paystack.calculate_arrears_years(user)
                charged_years = max(requested_years, arrears_years)
                amount_naira = Paystack.calculate_renewal_amount(user, charged_years)
            else:
                charged_years = requested_years
                amount_naira = Paystack.calculate_activation_amount(user, charged_years)

            amount = int(round(float(amount_naira) * 100))

            if amount <= 0:
                return bad_request_response(message="Amount must be greater than zero")

            redirect_url = f"{request.data.get('redirect_url')}"

            # Create transaction record in database
            transaction = Transaction.objects.create(
                user=request.user,
                amount=amount / 100,
                transaction_type=transaction_type,
                status="pending",
                response={
                    "requested_years": requested_years,
                    "charged_years": charged_years,
                    "arrears_years": arrears_years,
                    "transaction_type": transaction_type,
                    "enforced_amount": amount / 100,
                }
            )
            metadata = {
                "application_id": str(transaction.id),
                "email": transaction.user.email,
                "description": "YMCA membership payment",
                "requested_years": requested_years,
                "charged_years": charged_years,
                "arrears_years": arrears_years,
                "transaction_type": transaction_type,
            }

            # Prepare request payload for Paystack
            data = {
                "email": transaction.user.email,
                "amount": amount, 
                "reference":str(transaction.id),
                "currency": "NGN",
                "callback_url": redirect_url,
                "metadata": metadata,
            }

            response = requests.post(
                "https://api.paystack.co/transaction/initialize",
                json=data,
                headers=Paystack.get_header()
            )

            if response.ok:
                response_data = response.json()
                if response.status_code == 200 and response_data["status"] == True:
                    print(response_data['data'])
                    payment_url = response_data['data']['authorization_url']
                    return success_response(
                        data={"payment_url": payment_url},
                    )

                return bad_request_response(message=response_data.get('message', 'Failed to initiate payment.'))

            return bad_request_response(message='Failed to initiate payment.')

        except Exception as e:
            return bad_request_response(message=str(e))
        

    
    @staticmethod
    def charge_user_for_donation(request,amount, name, email=None):
        try:
            amount = int(round(float(amount) * 100))  # amount (in kobo)
            if amount <= 0:
                return bad_request_response(message="Amount must be greater than zero")
            redirect_url = f"{request.data.get('redirect_url')}"
            metadata = {
                "payment_mode": 'donation',
                "name": name,
                "email": email,
                "description": "Donation"
            }

            # Prepare request payload for Paystack
            data = {
                "email": email,
                "amount": amount, 
                "currency": "NGN",
                "callback_url": redirect_url,
                "metadata": metadata,
            }

            response = requests.post(
                "https://api.paystack.co/transaction/initialize",
                json=data,
                headers=Paystack.get_header()
            )
            if response.ok:
                response_data = response.json()
                if response.status_code == 200 and response_data["status"] == True:
                    print(response_data['data'])
                    payment_url = response_data['data']['authorization_url']
                    return success_response(
                        data={"payment_url": payment_url},
                    )

                return bad_request_response(message=response_data.get('message', 'Failed to initiate payment.'))

            return bad_request_response(message='Failed to initiate payment.')

        except Exception as e:
            return bad_request_response(message=str(e))


    @staticmethod
    def validate_payment(transaction_id):
        try:
            # Verify payment with Paystack
            response = requests.get(
                f"https://api.paystack.co/transaction/verify/{transaction_id}",
                headers=Paystack.get_header()
            )
            if response.ok:
                response_data = response.json()
                # print(response_data)
                if response.status_code == 200 and response_data["status"] in ["success",True]:
                    payment_status = response_data['data']['status']
                    system_tx_ref = response_data['data']['reference']
                    
                    try:
                        transaction = Transaction.objects.get(id=system_tx_ref)
                    except:
                        return bad_request_response(
                            message="Transaction not found."
                        )

                    # Update the transaction based on the payment status
                    if payment_status == "success":
                        if transaction.status == 'success':
                            return success_response(
                                message="Transaction already successful.",
                                data={
                                    "transaction_id": str(transaction.id),
                                    "success":True,
                                    "amount": transaction.amount,
                                    "message": "Transaction already successful."
                                }
                            )
                        if transaction.status != "success":
                            transaction.status = "success"
                            transaction_metadata = transaction.response or {}
                            paystack_data = response_data['data']
                            transaction.response = {
                                **transaction_metadata,
                                "paystack": paystack_data,
                            }
                            id_card, created = IDCard.objects.get_or_create(user=transaction.user)
                            charged_years = max(1, int(transaction_metadata.get('charged_years') or 1))
                            arrears_years = max(0, int(transaction_metadata.get('arrears_years') or 0))
                            payment_date = datetime.date.today()

                            id_card.is_active =True
                            id_card.first_time =False
                            id_card.expired = False
                            if transaction.transaction_type == 'RENEWAL' and arrears_years > 1:
                                # Arrears clear old missed years and reactivate the card for the current cycle.
                                id_card.expired_at = Paystack.next_may_31(payment_date)
                            else:
                                id_card.expired_at = Paystack.expiry_after_payment(charged_years, payment_date)
                            id_card.save()
                            transaction.user.membership_expiry = id_card.expired_at
                            transaction.user.is_active = True
                            transaction.user.save(update_fields=['membership_expiry', 'is_active', 'updated_at'])
                            transaction.save()
                            return success_response(
                                message="Payment successful.",
                                data={
                                    "transaction_id": str(transaction.id),
                                    "success":True,
                                    "amount": transaction.amount,
                                    "message": "Payment successful."
                                }
                            )
                  
                        return success_response(message="Payment successful.")

                    elif payment_status == "failed":
                        transaction.status = "failed"
                        transaction.response = response_data['data']
                        transaction.save()
                        return bad_request_response(message="Payment not successful.")
                    else:
                        return bad_request_response(message='Payment still processing')

                return bad_request_response(message="Payment verification failed.")

            return bad_request_response(message='Failed to verify payment.')

        except Transaction.DoesNotExist:
            return bad_request_response(message="Transaction not found.")
        except Exception as e:
            print(e)
            return bad_request_response(message='Unable to verify payment at the moment')
        

    @staticmethod
    def validate_payment_donation(transaction_id):
        try:
            # Verify payment with Paystack
            response = requests.get(
                f"https://api.paystack.co/transaction/verify/{transaction_id}",
                headers=Paystack.get_header()
            )
            if response.ok:
                response_data = response.json()
                if response.status_code == 200 and response_data["status"] in ["success",True]:

                    return success_response(
                                message="Transaction already successful.",
                    )
                return bad_request_response(message="Payment verification failed.")
            return bad_request_response(message='Failed to verify payment.')
        except Transaction.DoesNotExist:
            return bad_request_response(message="Transaction not found.")
        except Exception as e:
            print(e)
            return bad_request_response(message='Unable to verify payment at the moment')
        


    @staticmethod
    def process_webhook(payload):
        try:
            transaction_id = payload['data']['reference']
            payment_status = payload['data']['status']

            # Call Paystack to verify the payment
            response = requests.get(
                f"https://api.paystack.co/transaction/verify/{transaction_id}",
                headers=Paystack.get_header()
            )

            if response.ok:
                response_data = response.json()
                if response.status_code == 200 and response_data["status"] == "success":
                    payment_status = response_data['data']['status']
                    system_tx_ref = response_data['data']['reference']

                    transaction = Transaction.objects.get(id=system_tx_ref)

                    # Update the transaction based on the payment status
                    if payment_status == "success":
                        if transaction.status == 'success':
                            return success_response(
                                message="Transaction already successful.",
                                data={"message": "Transaction already successful."}
                            )
                        if transaction.status != "success":
                            transaction.status = "success"
                            transaction_metadata = transaction.response or {}
                            paystack_data = response_data['data']
                            transaction.response = {
                                **transaction_metadata,
                                "paystack": paystack_data,
                            }
                            id_card, created = IDCard.objects.get_or_create(user=transaction.user)
                            id_card.is_active =True
                            id_card.expired = False
                            charged_years = max(1, int(transaction_metadata.get('charged_years') or 1))
                            arrears_years = max(0, int(transaction_metadata.get('arrears_years') or 0))
                            payment_date = datetime.date.today()
                            if transaction.transaction_type == 'RENEWAL' and arrears_years > 1:
                                id_card.expired_at = Paystack.next_may_31(payment_date)
                            else:
                                id_card.expired_at = Paystack.expiry_after_payment(charged_years, payment_date)
                            id_card.save()
                            transaction.user.membership_expiry = id_card.expired_at
                            transaction.user.is_active = True
                            transaction.user.save(update_fields=['membership_expiry', 'is_active', 'updated_at'])
                            transaction.save()
                            return success_response(
                                message="Payment successful.",
                                data={
                                    "transaction_id": str(transaction.id),
                                    "amount": transaction.amount,
                                    "message": "Payment successful."
                                }
                            )
                  
                        return success_response(message="Payment successful.")

                    elif payment_status == "failed":
                        transaction.status = "failed"
                        transaction.response = response_data['data']
                        transaction.save()
                        return bad_request_response(message="Payment not successful.")
                    else:
                        return bad_request_response(message='Payment still processing')

                return bad_request_response(message="Payment verification failed.")

            return bad_request_response(message='Failed to verify payment.')

        except Transaction.DoesNotExist:
            return bad_request_response(message="Transaction not found.")
        except Exception as e:
            return bad_request_response(message=str(e))

