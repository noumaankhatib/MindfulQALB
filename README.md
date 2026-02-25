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
3. Put **all API keys and secrets** in **`backend/.env`** (the root server loads it first):
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = Supabase **service role** key (Dashboard → Settings → API)
   - `CALCOM_API_KEY`, `CALCOM_EVENT_TYPE_IDS` = for Cal.com sync (see `docs/CALCOM_SYNC.md`)
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` = for payments

See **`docs/ENV_VARIABLES.md`** for a full list of frontend vs backend environment variables and where to set them.

**Required in `backend/.env` for DB + My Bookings + Cal.com + payments:**

| Variable | Where to get it |
|----------|------------------|
| `SUPABASE_URL` | Same as your `VITE_SUPABASE_URL` (or set both). |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → **service_role** (secret, server-only). |
| `CALCOM_API_KEY`, `CALCOM_EVENT_TYPE_IDS` | Cal.com → Settings → API Keys; see `docs/CALCOM_SYNC.md`. |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay Dashboard (for payments). |

Without `SUPABASE_SERVICE_ROLE_KEY`, the local API returns mock booking IDs and does not write to the database. Restart `npm run dev:api` after changing `backend/.env`.

**Coupon discounts** are applied by the create-order API. For coupons to work locally, run `npm run dev:api` and set `SUPABASE_*` in `backend/.env` (coupons are validated from the `coupons` table). See `docs/supabase-coupons-migration.sql` to set up the table. If the discount still does not apply, set `VITE_BACKEND_URL=http://localhost:3001/api` in root `.env` and restart `npm run dev`.

**If bookings still don’t show in My Bookings or Admin:** the API inserts with the service role (bypasses RLS), but the app reads with the anon key. You must add **Row Level Security policies** in Supabase so the frontend can read rows. See **`docs/SUPABASE_SETUP.md`** for the exact SQL (create table + RLS policies). After running that SQL, My Bookings and Admin will show data.

**Quick check:** Open `http://localhost:3001/api/health` — if `supabaseConfigured` is `true`, the API will write to the DB when you book.

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

### Root (.env) – Frontend + Local API

Use `.env.example` as reference. Same file is used by Vite (frontend) and server.js (local API); only `VITE_*` are exposed to the client.

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `VITE_USE_BACKEND_API` | Use backend API (e.g. true in production) |
| `VITE_BACKEND_URL` | Backend API base URL (default /api) |
| `SUPABASE_URL` | Supabase URL for server-side bookings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `CALCOM_API_KEY`, `CALCOM_USERNAME`, `CALCOM_EVENT_TYPE_IDS` | Cal.com config |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay config |

### Vercel

In **Project → Settings → Environment Variables** add:

- **Frontend (required for Google login):** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — use your real Supabase project URL (e.g. `https://xxxxx.supabase.co`) and anon key. If these are missing, the build uses a placeholder and **Google sign-in will redirect to a broken URL** (`placeholder.supabase.co`).
- **Server:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CALCOM_*`, `RAZORPAY_*` so `/api/*` and bookings work.

Redeploy after adding or changing env vars.

### Backend (backend/.env)

Used only when running the Express backend (`cd backend && npm run dev`). See `backend/.env.example` for the full list: PORT, NODE_ENV, ALLOWED_ORIGINS, CALCOM_*, RAZORPAY_*, ENCRYPTION_KEY.

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

You can run on **free tier**: Supabase (500 MB DB) + Vercel (frontend and serverless `/api`). No separate backend server required for Vercel.

### Before going live (three-step checklist)

**Step 1 – Supabase**

- [ ] Open Supabase Dashboard → SQL Editor. Run the full setup file **[docs/supabase-full-setup.sql](docs/supabase-full-setup.sql)** (one file = all tables + RLS). Or follow [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) section by section.
- [ ] Sign up or log in once so a profile row exists, then in Table Editor → `profiles` set your row’s `role` to `admin`.

**Step 2 – Vercel**

- [ ] Project → Settings → Environment Variables: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (from Supabase → Project Settings → API).
- [ ] Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (same project; use the **service_role** key, not anon).
- [ ] Add `CALCOM_API_KEY`, `CALCOM_USERNAME`, `CALCOM_EVENT_TYPE_IDS` and `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` if you use bookings and payments.
- [ ] Redeploy (Deployments → … → Redeploy or push a commit). Optional: run `npm run check:env` locally to verify required env vars (or use same vars in Vercel).

**Step 3 – Smoke test**

- [ ] Open your live URL and sign in with Google (no redirect to placeholder.supabase.co).
- [ ] Complete one test booking (consent → details → payment or free slot).
- [ ] As admin, open the Admin dashboard and confirm Bookings, Payments, Consent, and Users tabs load (and show data if any).

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy dist/ folder (Vercel auto-builds from git)
```

### Backend (optional, for self-hosted API)

```bash
cd backend
npm run build
# See backend/README.md for deployment options
```

## License

ISC

## Contact

MindfulQALB - mindfulqalb@gmail.com
