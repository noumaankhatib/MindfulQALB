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

### Development (Frontend + Local API with DB persistence)

To see bookings in **My Bookings** and **Admin** while testing locally:

1. **Terminal 1 – API:** `npm run dev:api` (runs Express on port 3001)
2. **Terminal 2 – Frontend:** `npm run dev` (Vite proxies `/api` to 3001)
3. In **root `.env`** (same folder as `server.js`), set:
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = Supabase **service role** key (Dashboard → Settings → API)

**Required in root `.env` for DB + My Bookings to work:**

| Variable | Where to get it |
|----------|------------------|
| `SUPABASE_URL` | Same as your `VITE_SUPABASE_URL` (or set both). |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → **service_role** (secret, server-only). |

Without `SUPABASE_SERVICE_ROLE_KEY`, the local API returns mock booking IDs and does not write to the database. Restart `npm run dev:api` after changing `.env`.

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
- **Payment Integration** - Razorpay payments
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
| `VITE_BACKEND_URL` | Backend API URL | No (defaults to /api) |
| `VITE_RAZORPAY_KEY_ID` | Razorpay publishable key | No |

### Vercel API (for `/api/bookings` – Admin & My Bookings)

Set these in Vercel → Project → Settings → Environment Variables so bookings are stored in Supabase:

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes (for bookings to persist) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | Yes (for bookings to persist) |

Without these, Cal.com bookings still succeed but won’t appear in the Admin dashboard or My Bookings (no DB row).

### Backend (backend/.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment mode | No |
| `ALLOWED_ORIGINS` | CORS allowed origins | Yes (production) |
| `CALCOM_API_KEY` | Cal.com API key | Yes |
| `CALCOM_USERNAME` | Cal.com username | Yes |
| `CALCOM_EVENT_TYPE_IDS` | Event type IDs (JSON) | Yes |
| `RAZORPAY_KEY_ID` | Razorpay key ID | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | Yes |
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
