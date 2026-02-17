# Backend API Specification for MindfulQALB

This document outlines the required backend API endpoints to secure the MindfulQALB therapy booking website.

## Overview

Currently, the frontend makes direct API calls to Cal.com and payment providers with API keys exposed in the browser. This is a security vulnerability. The recommended architecture moves all API interactions to a secure backend server.

## Required Environment Variables (Backend)

```env
# Cal.com
CALCOM_API_KEY=cal_live_xxxxx
CALCOM_USERNAME=mindfulqalb
CALCOM_EVENT_TYPE_IDS={"individual":"12345","couples":"12346","family":"12347","free":"12348"}

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Database
DATABASE_URL=postgresql://user:password@host:5432/mindfulqalb

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

## API Endpoints

### 1. Availability API

**GET `/api/availability`**

Fetch available time slots for a given date and session type.

Request:
```json
{
  "date": "2026-02-15",
  "sessionType": "individual"
}
```

Response:
```json
{
  "slots": [
    { "time": "10:00 AM", "available": true },
    { "time": "11:00 AM", "available": false },
    { "time": "2:00 PM", "available": true }
  ]
}
```

Implementation:
- Backend calls Cal.com API with server-side API key
- Returns only public slot availability (no API key exposed)

---

### 2. Create Booking API

**POST `/api/bookings`**

Create a new booking after payment/consent.

Request:
```json
{
  "sessionType": "individual",
  "date": "2026-02-15",
  "time": "10:00 AM",
  "customer": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+919876543210"
  },
  "consentAccepted": true,
  "paymentId": "pay_xxxxxxxxxxxx"
}
```

Response:
```json
{
  "success": true,
  "bookingId": "booking_xxxxxxxxxxxx",
  "confirmationUrl": "https://app.cal.com/booking/xxxx"
}
```

Implementation:
- Verify payment status with Razorpay/Stripe backend API
- Create booking on Cal.com
- Store encrypted customer data in database
- Send confirmation email

---

### 3. Create Payment Order API (Razorpay)

**POST `/api/payments/create-order`**

Create a Razorpay order with server-verified amount.

Request:
```json
{
  "sessionType": "individual",
  "format": "video"
}
```

Response:
```json
{
  "orderId": "order_xxxxxxxxxxxx",
  "amount": 129900,
  "currency": "INR",
  "keyId": "rzp_live_xxxxx"
}
```

Implementation:
- Server calculates correct amount based on session type
- Creates order with Razorpay API using secret key
- Returns order details (key_id only, not secret)

---

### 4. Verify Payment API (Razorpay)

**POST `/api/payments/verify`**

Verify Razorpay payment signature.

Request:
```json
{
  "razorpay_order_id": "order_xxxxxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxxxxx",
  "razorpay_signature": "signature_string"
}
```

Response:
```json
{
  "verified": true,
  "paymentId": "pay_xxxxxxxxxxxx"
}
```

Implementation:
- Verify signature using HMAC SHA256 with secret key
- Return verification status
- Never expose verification logic to frontend

---

### 5. Create Stripe Checkout Session API

**POST `/api/payments/create-checkout`**

Create a Stripe Checkout session.

Request:
```json
{
  "sessionType": "individual",
  "format": "video",
  "customer": {
    "email": "jane@example.com"
  },
  "successUrl": "https://mindfulqalb.com/booking/success",
  "cancelUrl": "https://mindfulqalb.com/booking/cancel"
}
```

Response:
```json
{
  "sessionId": "cs_live_xxxxxxxxxxxx",
  "url": "https://checkout.stripe.com/pay/cs_live_xxxxx"
}
```

---

### 6. Consent Record API

**POST `/api/consent`**

Store consent record for compliance.

Request:
```json
{
  "sessionType": "individual",
  "email": "jane@example.com",
  "consentVersion": "2024-01-15",
  "acknowledgments": ["item1", "item2", "item3"],
  "ipAddress": "xxx.xxx.xxx.xxx",
  "userAgent": "Mozilla/5.0..."
}
```

Response:
```json
{
  "success": true,
  "consentId": "consent_xxxxxxxxxxxx"
}
```

Implementation:
- Store encrypted consent record in database
- Implement data retention policy
- Allow retrieval for compliance audits

---

## Database Schema

### Bookings Table
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calcom_booking_id VARCHAR(255),
  session_type VARCHAR(50) NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  customer_name_encrypted BYTEA NOT NULL,
  customer_email_encrypted BYTEA NOT NULL,
  customer_phone_encrypted BYTEA,
  payment_id VARCHAR(255),
  payment_status VARCHAR(50),
  consent_id UUID REFERENCES consent_records(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Consent Records Table
```sql
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_type VARCHAR(50) NOT NULL,
  email_hash VARCHAR(64) NOT NULL,
  consent_version VARCHAR(20) NOT NULL,
  acknowledgments JSONB NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);
```

---

## Frontend Integration

Update the frontend services to call these backend APIs instead of direct third-party APIs:

### calcomService.ts Changes

```typescript
// Before (insecure)
const url = `${CALCOM_CONFIG.API_V1_URL}/slots?apiKey=${apiKey}`;

// After (secure)
const url = `/api/availability`;
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ date: dateString, sessionType })
});
```

### paymentService.ts Changes

```typescript
// Before (insecure)
razorpay.createPayment({
  amount: session.priceINR * 100, // Client-side amount
});

// After (secure)
const orderResponse = await fetch('/api/payments/create-order', {
  method: 'POST',
  body: JSON.stringify({ sessionType, format })
});
const { orderId, amount, keyId } = await orderResponse.json();

razorpay.createPayment({
  order_id: orderId, // Server-created order
  amount: amount,    // Server-verified amount
  key: keyId,
});
```

---

## Security Checklist

- [ ] Move all API keys to backend environment
- [ ] Implement rate limiting on all endpoints
- [ ] Add CORS restrictions to backend
- [ ] Implement request validation/sanitization
- [ ] Add API authentication (JWT tokens)
- [ ] Enable request logging for audit trail
- [ ] Encrypt PII at rest and in transit
- [ ] Implement data retention/purge policies
- [ ] Set up monitoring and alerts
- [ ] Regular security audits

---

## Recommended Tech Stack

- **Backend**: Node.js with Express or Fastify
- **Database**: PostgreSQL with encryption at rest
- **Hosting**: Vercel Functions, AWS Lambda, or dedicated server
- **Monitoring**: Sentry for errors, LogRocket for sessions

---

## Deployment Notes

1. Deploy backend API first
2. Update frontend environment variables to point to backend
3. Remove direct API keys from frontend `.env`
4. Test all booking flows end-to-end
5. Monitor for errors during transition
