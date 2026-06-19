# Supermarket POS — M-Pesa Daraja Integration

A full-stack point-of-sale demo showcasing a complete M-Pesa STK Push payment
integration using Safaricom's Daraja API — built to deeply understand the
OAuth → STK Push → async callback pattern, not just wire up a tutorial.

🔗 **Live demo:** https://mpesatest.vercel.app
🔗 **Backend API:** https://mpesatest-0sa1.onrender.com

---

## What this demonstrates

- OAuth2 client credentials flow with Safaricom Daraja API
- STK Push (Lipa Na M-Pesa Online) payment initiation
- Asynchronous callback handling — the core challenge of payment gateway
  integrations, where the payment result arrives on a separate request
  from the one that triggered it
- Transaction state matching via `CheckoutRequestID`
- Status polling from frontend to reflect real-time payment state
- PostgreSQL persistence of transaction history

## Tech stack

**Frontend:** React (Vite), Axios
**Backend:** Node.js, Express
**Database:** PostgreSQL (Neon)
**Payments:** Safaricom Daraja API (Sandbox)
**Deployment:** Vercel (frontend), Render (backend)

## How it works
Cashier enters amount + phone

↓

Backend requests OAuth token from Safaricom

↓

Backend sends STK Push request → Safaricom responds with CheckoutRequestID

↓

Pending transaction saved to PostgreSQL

↓

Safaricom prompts customer's phone for M-Pesa PIN

↓

Customer enters PIN (or cancels)

↓

Safaricom POSTs result to backend's /callback endpoint

↓

Backend matches CheckoutRequestID, updates transaction status

↓

Frontend polls /status endpoint and displays result
## API Endpoints

| Method | Endpoint                              | Purpose                          |
|--------|----------------------------------------|-----------------------------------|
| GET    | `/api/mpesa/test-token`                | Verify OAuth token generation     |
| POST   | `/api/mpesa/stk-push`                  | Trigger STK Push payment prompt   |
| POST   | `/api/mpesa/callback`                  | Safaricom's async result delivery |
| GET    | `/api/mpesa/status/:checkoutRequestId` | Poll a transaction's status       |
| GET    | `/api/mpesa/transactions`              | List recent transactions          |

## Note on sandbox testing

Safaricom's Daraja **sandbox** environment has documented inconsistent
callback delivery and does not guarantee a successful payment outcome from
test phone numbers — this is a known limitation of the sandbox, not the
integration itself. The screenshots below show both successful and
failed/cancelled transaction states, demonstrating that the system correctly
handles both outcomes end-to-end. In a production environment with a live
Paybill/Till number, this same code processes real payments identically.

## Running locally

**Backend:**
```bash
cd backend
npm install
# create a .env file with your Daraja credentials (see .env.example)
node server.js
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

You'll also need [ngrok](https://ngrok.com) to expose your local backend
for Safaricom's callback during local development:
```bash
ngrok http 5000
```

## Environment variables

```env
PORT=5000
DATABASE_URL=your_postgres_connection_string
MPESA_CONSUMER_KEY=your_daraja_consumer_key
MPESA_CONSUMER_SECRET=your_daraja_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_daraja_passkey
MPESA_CALLBACK_URL=your_public_callback_url
MPESA_ENV=sandbox
```

---

Built by Cosmas Kibet as a hands-on deep dive into payment gateway
integration patterns.