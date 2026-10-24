# Remita Payment Integration — Testing Guide

Status: **fully integrated** (membership activation/renewal + anonymous donations) and verified against the Remita **demo sandbox**.

---

## 1. Architecture at a glance

```
Frontend (React)                    Backend (Django REST)                 Remita
────────────────                    ─────────────────────                 ──────
HomePage / DonationModal      ──►   POST /initiate/donation      ──►  paymentinit (RRR)
MemberDashboardMember         ──►   POST /membership/activation  ──►  paymentinit (RRR)
  openRemitaInlinePayment()         POST /membership/renewal
        │                                 │ returns { rrr, payment_url, inline_config }
        ▼                                 ▼
  RmPaymentEngine widget            GET  /payment/verify  ────────────►  status.reg (poll)
        │                           POST /payment/webhook ◄────────────  Remita push
        ▼                                 ▼
  → /payment?rrr=...               Transaction.status = success/failed
                                   IDCard.expired_at = next May 31
```

Key files:
- `api/utils/payment/remita.py` — gateway client (init, inline payload, verify, webhook)
- `api/views/transaction.py` — views/routes wiring
- `src/api/remitaInline.ts` — frontend inline-widget loader
- `transaction/tests.py` — unit + integration tests (26, all passing)

---

## 2. Environment setup

```bash
cd ymca_api
python3 -m virtualenv venv        # or: python3 -m venv venv (needs python3-venv)
./venv/bin/pip install -r requirements.txt
cp .env.example .env              # then fill in the Remita demo values
```

`.env` for sandbox:

```
REMITA_BASE_URL=https://demo.remita.net/remita/exapp/api/v1/send/api
REMITA_MERCHANT_ID=2547916
REMITA_API_KEY=1946
REMITA_SERVICE_TYPE_ID=4430731
REMITA_PUBLIC_KEY=<from your Remita demo dashboard>
```

Sanity-check: `./venv/bin/python test_env.py` → should print "All good!".

> **Production switch:** change `REMITA_BASE_URL` to `https://login.remita.net/remita/exapp/api/v1/send/api`
> (the code auto-switches the inline script between demo/login by URL — `get_payment_base_url`).
> Get real merchant credentials from Remita; the demo ones above are public sandbox values.

---

## 3. Test layers

### a) Unit + integration tests (fast, mocked, CI-friendly)

```bash
./venv/bin/python manage.py test transaction.tests -v 1
```

Covers: fee math (activation/renewal/arrears), May-31 expiry, hash generation,
charge success/failure, donation creation (incl. anonymous), inline payload
contract, JSONP parsing, verification (success/failed/processing/unknown RRR),
idempotent re-verification, webhook routing.

### b) Live sandbox smoke test (hits Remita demo)

```bash
./venv/bin/python smoke_test_remita.py
```

Exercises the real flow: creates a transaction → generates a **real RRR** on
demo → validates the inline payload → polls the status API (expect
"Payment still processing" for an unpaid RRR). Safe: demo, no real money.

### c) Full UI test (browser, real widget)

1. Start backend: `./venv/bin/python manage.py runserver 8000`
2. Start frontend: `pnpm dev` (repo root), with `VITE_BACKEND_URL=http://127.0.0.1:8000/api/v1`
3. Go to the homepage → **Make a Donation** → submit the form
   (or log in → member dashboard → activate/renew membership)
4. The Remita inline widget opens → complete payment using the demo test
   instrument your Remita contact provides (ask Remita for current demo test
   cards; public docs don't list them)
5. On success the app redirects to `/payment?rrr=<RRR>` → verification screen
   should show **Payment Successful** and the dashboard should reflect the
   new expiry (May 31 of the following year)

### d) Simulating payment success (when you don't have a demo card)

Because verification is driven by `status.reg`, you can simulate a paid RRR:

```bash
# After initiating a payment and grabbing the RRR from the response / logs:
curl -X POST http://127.0.0.1:8000/api/v1/payment/verify \
  -H 'Content-Type: application/json' \
  -d '{"rrr": "<YOUR_RRR>"}'
```

- Remita returns `00` only when actually paid. For pure UI testing without
  paying, temporarily mark the transaction in Django admin, or point the
  webhook at a stubbed status response.
- To test webhook handling locally:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/payment/webhook \
  -H 'Content-Type: application/json' \
  -d '{"rrr": "<YOUR_RRR>"}'
```

(The webhook delegates to the same verification logic — idempotent, so calling
it repeatedly is safe.)

---

## 4. Status-code semantics (verified on demo, Sep 2026)

| Endpoint | Code | Meaning | Our handling |
|---|---|---|---|
| `paymentinit` | `025` | Payment Reference generated | **success** → return RRR |
| `paymentinit` | `00`/`0` | success (older gateways) | **success** → return RRR |
| `status.reg` | `00`/`01` (`0` legacy) | paid | mark success, extend membership |
| `status.reg` | `021` | Transaction Pending | "Payment still processing" |
| `status.reg` | `025` | reference pending/unpaid | "Payment still processing" |
| `status.reg` | `02`/`012`/`99` | failed or aborted | mark failed |

⚠️ This split (`REMITA_INIT_SUCCESS_STATUSES` vs
`REMITA_VERIFICATION_SUCCESS_STATUSES`) fixed a real bug: `025` was previously
treated as payment success during verification, which could activate
memberships for unpaid RRRs.

The RRR status endpoint documents `01` as successful; it must not be confused
with codes from other Remita APIs. Reference: https://api.remita.net/.

Run frontend loader/callback regression checks with `npm run test:payments`.
These cover script failure, timeout, retry, cancellation, and the RRR payload.
Backend tests also cover legacy `remitta` transaction records, environment-name
fallbacks, and atomic rollback if membership activation fails.

During deployment, `REMITA_*` takes precedence over legacy `REMITTA_*` variables.
Set the full matching credential set before removing the old variables.
The `/membership/demo` bypass is disabled by default and cannot run outside DEBUG.

---

## 5. Go-live checklist

- [ ] Replace demo credentials with production ones (`REMITA_*` from Remita)
- [ ] `REMITA_BASE_URL` → `https://login.remita.net/remita/exapp/api/v1/send/api`
- [ ] Register the webhook URL with Remita: `https://<your-api-host>/api/v1/payment/webhook`
- [ ] Confirm `REMITA_PUBLIC_KEY` matches the production merchant (inline widget rejects mismatches)
- [ ] Small real-money test: one activation + one donation, verify ID-card expiry and transaction records in Django admin
- [ ] Confirm retries: re-verifying a successful RRR returns "already successful" without double-extending
