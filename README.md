# MindfulQALB

Evidence-based mental health care for individuals and couples—accessible, human, and private.

## Project Structure

```
MindfulQALB/
├── src/                    # Frontend React application
├── backend/                # Express.js backend API
├── public/                 # Static assets
└── docs/                   # Documentation
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Development (Frontend Only)

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The frontend will be available at http://localhost:5173

### Development (Full Stack)

For production-ready security, run both frontend and backend:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

**Terminal 2 - Frontend:**
```bash
# In root directory
cp .env.example .env
# Edit .env:
#   VITE_USE_BACKEND_API=true
#   VITE_BACKEND_URL=http://localhost:3001/api
npm run dev
```

### Production Build

```bash
# Build frontend
npm run build

# Build backend
cd backend && npm run build
```

## Features

- **Therapy Booking System** - Multi-step booking flow with date/time selection
- **Payment Integration** - Razorpay (India) and Stripe (International)
- **Cal.com Integration** - Real-time availability and calendar syncing
- **Consent Management** - HIPAA-compliant informed consent forms
- **AI Chatbot** - Guided therapy type recommendation
- **Responsive Design** - Mobile-first, accessible UI

## Security

For production deployment:

1. **Use the backend API** - Set `VITE_USE_BACKEND_API=true`
2. **Keep API keys on server** - Never expose Cal.com or payment secret keys in frontend
3. **Enable HTTPS** - All production traffic should be encrypted
4. **Configure CORS** - Set `ALLOWED_ORIGINS` in backend `.env`

See `backend/README.md` for full security documentation.

## Environment Variables

### Frontend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_USE_BACKEND_API` | Use secure backend API | Yes (production) |
| `VITE_BACKEND_URL` | Backend API URL | Yes (if backend enabled) |
| `VITE_PAYMENT_ENABLED` | Enable real payments | No |
| `VITE_RAZORPAY_KEY_ID` | Razorpay publishable key | No |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | No |

### Backend (backend/.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `CALCOM_API_KEY` | Cal.com API key | Yes |
| `RAZORPAY_KEY_ID` | Razorpay key ID | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | For international |
| `ENCRYPTION_KEY` | Data encryption key | Yes |

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS + DaisyUI
- Framer Motion animations

### Backend
- Express.js with TypeScript
- Razorpay & Stripe SDKs
- Helmet security headers
- Express Validator

## Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Vercel/Railway/Docker)
```bash
cd backend
npm run build
# See backend/README.md for deployment options
```

## License

ISC

## Contact

MindfulQALB - mindfulqalb@gmail.com
