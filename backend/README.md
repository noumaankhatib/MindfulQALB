# MindfulQALB Backend API

Secure backend API for the MindfulQALB therapy booking website.

## Features

- **Secure Cal.com Integration**: API keys never exposed to frontend
- **Payment Security**: Server-side order creation and signature verification
- **Data Encryption**: All PII encrypted at rest
- **Rate Limiting**: Protection against abuse
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: All inputs validated and sanitized

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your API keys
nano .env

# Start development server
npm run dev
```

### Production

```bash
# Build
npm run build

# Start
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Availability
```
POST /api/availability
{
  "date": "2026-02-15",
  "sessionType": "individual"
}
```

### Create Payment Order (Razorpay)
```
POST /api/payments/create-order
{
  "sessionType": "individual",
  "format": "video"
}
```

### Verify Payment (Razorpay)
```
POST /api/payments/verify
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature"
}
```

### Create Checkout (Stripe)
```
POST /api/payments/create-checkout
{
  "sessionType": "individual",
  "format": "video",
  "customer": { "email": "user@example.com" }
}
```

### Create Booking
```
POST /api/bookings
{
  "sessionType": "individual",
  "format": "video",
  "date": "2026-02-15",
  "time": "10:00 AM",
  "customer": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+919876543210"
  }
}
```

### Store Consent
```
POST /api/consent
{
  "sessionType": "individual",
  "email": "jane@example.com",
  "consentVersion": "2024-01-15",
  "acknowledgments": ["item1", "item2"]
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3001) |
| `NODE_ENV` | Environment (development/production) |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins |
| `CALCOM_API_KEY` | Cal.com API key |
| `CALCOM_USERNAME` | Cal.com username |
| `CALCOM_EVENT_TYPE_IDS` | JSON mapping of session types to event IDs |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `ENCRYPTION_KEY` | Key for encrypting PII |

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```bash
# Build image
docker build -t mindfulqalb-backend .

# Run container
docker run -p 3001:3001 --env-file .env mindfulqalb-backend
```

### Railway / Render

1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

## Security Notes

1. **Never commit `.env` files** - they contain secret keys
2. **Use HTTPS in production** - all API calls should be encrypted
3. **Rotate keys regularly** - especially if you suspect compromise
4. **Monitor for unusual activity** - set up alerts for high error rates

## License

ISC
