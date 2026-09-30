"""
Live Remita DEMO sandbox smoke test (safe: no real money, demo credentials only).

Runs the full backend flow end-to-end:
  1. Create a pending Transaction
  2. Call Remita demo paymentinit -> expect a real RRR back
  3. Build inline payment payload -> validate frontend contract
  4. Call the status API for that RRR -> expect a pending/unknown status (not paid yet)

Run:  ./venv/bin/python smoke_test_remita.py
"""
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django

django.setup()

from django.conf import settings
from django.test import RequestFactory

# --- Demo credentials (same as .env.example) ---
settings.REMITA_BASE_URL = 'https://demo.remita.net/remita/exapp/api/v1/send/api'
settings.REMITA_MERCHANT_ID = '2547916'
settings.REMITA_API_KEY = '1946'
settings.REMITA_SERVICE_TYPE_ID = '4430731'
settings.REMITA_PUBLIC_KEY = 'demo-public-key'  # not used for RRR generation

from account.models import User  # noqa: E402
from transaction.models import Transaction  # noqa: E402
from api.utils.payment.remita import remita  # noqa: E402


def main():
    print("=" * 70)
    print("REMITA DEMO SANDBOX SMOKE TEST")
    print("=" * 70)

    user, _ = User.objects.get_or_create(
        email='smoketest@example.com',
        defaults=dict(
            password='x',
            first_name='Smoke',
            last_name='Test',
            phone_number='08000000000',
        ),
    )

    factory = RequestFactory()
    request = factory.post(
        '/membership/activation',
        {'redirect_url': 'http://localhost:5173/payment', 'years': 1},
        content_type='application/json',
    )
    request.user = user
    request.data = {'redirect_url': 'http://localhost:5173/payment', 'years': 1}

    print("\n[1/3] Initiating membership payment (expecting RRR)...")
    response = remita.charge_user(request, user.id, transaction_type='ID')
    payload = getattr(response, 'data', {})
    rrr = (payload.get('data') or {}).get('rrr')

    if response.status_code == 200 and rrr:
        print(f"      SUCCESS -> RRR: {rrr}")
        print(f"      payment_url: {(payload.get('data') or {}).get('payment_url')}")
    else:
        print(f"      FAILED (HTTP {response.status_code}): {payload}")
        print("\n      Note: demo credentials may be rate-limited or rotated by Remita.")
        return 1

    inline_cfg = (payload.get('data') or {}).get('inline_config') or {}
    print("\n[2/3] Inline payment payload contract:")
    keys_ok = all(k in inline_cfg for k in ('key', 'processRrr', 'amount', 'firstName'))
    print(f"      processRrr={inline_cfg.get('processRrr')} amount={inline_cfg.get('amount')} "
          f"firstName={inline_cfg.get('firstName')} -> {'OK' if keys_ok else 'MISSING FIELDS'}")

    print("\n[3/3] Querying status API for the fresh RRR (expect not-success yet)...")
    verify = remita.validate_payment(str(rrr))
    vpayload = getattr(verify, 'data', {})
    tx = Transaction.objects.filter(response__rrr=str(rrr)).first()
    status = tx.status if tx else '?'
    print(f"      validate_payment -> HTTP {verify.status_code}, message: {vpayload.get('message')}")
    print(f"      local transaction status: {status}")

    # Cleanup: remove smoke-test artifacts from dev db
    Transaction.objects.filter(response__rrr=str(rrr)).delete()
    if user.email == 'smoketest@example.com':
        user.delete()

    print("\n" + "=" * 70)
    print("DONE - full flow exercised against Remita demo sandbox")
    print("=" * 70)
    return 0


if __name__ == '__main__':
    sys.exit(main())
