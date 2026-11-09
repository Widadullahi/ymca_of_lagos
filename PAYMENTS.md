# Paystack payments

Membership activation, renewals, and donations use Paystack hosted checkout.

## Deployment

- Set `PAYSTACK_SECRET_KEY` on the backend using the key for the intended test or live environment. The secret stays on the server.
- Set the Paystack dashboard webhook URL to `https://<api-host>/api/v1/payment/webhook` (no trailing slash).
- Apply the new model-choice migrations with `python manage.py migrate`. Existing transaction and subscription records are retained.
- Deploy frontend and backend together: checkout initialization returns `payment_url` and `payment_reference`; verification accepts `{"reference": "..."}`.

Payments return to `/payment`, which verifies the reference with the backend. Webhooks validate the `x-paystack-signature` HMAC before server-side verification. Verification checks the reference, NGN currency, amount in kobo, and payment status before applying membership changes. Repeated verification does not apply those changes twice. Anonymous donations are recorded without creating an ID card.

Old payment-provider credentials are no longer read. Pending payments created with the retired provider must be reconciled separately; this integration only verifies Paystack transactions. Historical migrations remain unchanged.

## Checks

- Frontend checkout tests: `npm run test:payments`
- Backend tests: `DJANGO_DEBUG=true python manage.py test transaction` from `ymca_api` using Python 3.10 or later.

References: [Paystack verification](https://paystack.com/docs/payments/verify-payments/) and [webhook signature validation](https://paystack.com/docs/payments/webhooks/).

## Identifying payments

New payments include dashboard-visible Paystack custom fields: Payment Type (Donation, Membership Activation, or Membership Renewal), YMCA Reference, and donor/member name. Membership payments also include the membership number when available and years paid. The same labels and description are saved locally. Open a transaction in Paystack to see its custom fields; existing transactions retain their original metadata. Paystack controls the layout of its emails and which custom fields appear in them.
