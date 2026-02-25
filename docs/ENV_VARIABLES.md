# Environment Variables – Frontend vs Backend

Where to set each variable: **root `.env`** (frontend, Vite) or **`backend/.env`** (API keys and server).

---

## Why two Supabase URL vars? Why anon key vs service_role key?

**URL: `VITE_SUPABASE_URL` vs `SUPABASE_URL`**  
They hold the **same value** (your Supabase project URL, e.g. `https://xxxx.supabase.co`). There are two names because:
- The **frontend** only sees variables that start with `VITE_` (Vite exposes those to the browser). So the app uses `VITE_SUPABASE_URL` from root `.env`.
- The **backend** reads from `backend/.env` and uses `SUPABASE_URL`.  
So you set the **same URL** in two places: once in root `.env` as `VITE_SUPABASE_URL`, once in `backend/.env` as `SUPABASE_URL`. One value, two runtimes.

**Keys: `VITE_SUPABASE_ANON_KEY` vs `SUPABASE_SERVICE_ROLE_KEY`**  
These are **different keys** from Supabase (Dashboard → Settings → API):

| Key | Where | Purpose |
|-----|--------|--------|
| **anon (public)** | Frontend → `VITE_SUPABASE_ANON_KEY` | Used in the browser. Row Level Security (RLS) applies. Safe to expose. |
| **service_role** | Backend → `SUPABASE_SERVICE_ROLE_KEY` | Used only on the server. Bypasses RLS; full access. **Never** expose in frontend. |

So you do **not** copy the same value: anon key goes in root `.env`, service_role key goes in `backend/.env`, and they are different values.

---

## Frontend (root `.env`)

Used by the Vite app. Only variables prefixed with `VITE_` are exposed to the browser.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL. **Same value** as backend `SUPABASE_URL` (same URL in two places). |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase **anon/public** key. **Different key** from service_role — safe to expose in the frontend. |
| `VITE_BACKEND_URL` | No | API base URL. Default: `/api` (Vite proxy to local server). Set to `http://localhost:3001/api` for direct API in dev. |
| `VITE_USE_BACKEND_API` | No | Set to `false` to disable backend API usage. Default: `true`. |

**File:** Project root `.env` (same folder as `package.json` and `vite.config.ts`).

**Note:** Do **not** put secrets (service role key, Razorpay secret, Cal.com API key) in frontend env. They must stay in `backend/.env`.

---

## Backend (`backend/.env`)

Used by the local API server (`npm run dev:api`), Vercel serverless functions (`api/*`), and the optional `backend/` Express app. Keep all API keys and secrets here.

### Required for full functionality

| Variable | Used by | Description |
|----------|---------|-------------|
| `SUPABASE_URL` | server.js, api/* | Supabase project URL. **Same value** as frontend `VITE_SUPABASE_URL` (same URL, backend copy). |
| `SUPABASE_SERVICE_ROLE_KEY` | server.js, api/* | Supabase **service_role** key. **Different key** from anon — server-only, never expose in frontend. |
| `CALCOM_API_KEY` | server.js, api/* | Cal.com API key (Cal.com → Settings → Developer → API Keys). For calendar sync. |
| `CALCOM_EVENT_TYPE_IDS` | server.js, api/* | JSON map of session keys to Cal.com event type IDs, e.g. `{"individual-video":"123","individual-chat":"124"}`. See `docs/CALCOM_SYNC.md`. |
| `CALCOM_USERNAME` | api/availability.ts | Cal.com username (e.g. `mindfulqalb`). Optional for v2 bookings; used for availability. |
| `RAZORPAY_KEY_ID` | server.js, api/payments/* | Razorpay API Key ID (Dashboard → Settings → API Keys). |
| `RAZORPAY_KEY_SECRET` | server.js, api/payments/* | Razorpay API Key Secret. Never expose in frontend. |

### Optional

| Variable | Used by | Description |
|----------|---------|-------------|
| `DEBUG_CALCOM` | server.js | Set to `1` or `true` to log Cal.com request/response in the terminal. |
| `PORT` | backend (Express) | Port for the backend server. Default: `3001`. |
| `ALLOWED_ORIGINS` | backend (Express) | Comma-separated CORS origins, e.g. `http://localhost:5173,http://localhost:5174`. |
| `ENCRYPTION_KEY` | backend (encryption) | Key for encrypting sensitive data in the backend. Required in production if using encryption utils. |
| `NODE_ENV` | server.js, api/*, backend | Usually set by the platform (e.g. `production` on Vercel). |
| `VERCEL_URL` | api/_utils/cors.ts | Set by Vercel in deployment. Used for CORS. |

**File:** `backend/.env` (folder `backend/` at project root).

**Local server:** When you run `npm run dev:api` from the project root, the server loads `backend/.env` first, then root `.env` and `.env.local`. So all keys in `backend/.env` are used.

**Vercel:** Set the same backend variables in Vercel → Project → Settings → Environment Variables for the serverless `api/` routes.

---

## Quick reference

| Purpose | Frontend (root `.env`) | Backend (`backend/.env`) |
|--------|------------------------|---------------------------|
| Supabase | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Cal.com | — | `CALCOM_API_KEY`, `CALCOM_USERNAME`, `CALCOM_EVENT_TYPE_IDS` |
| Razorpay | — | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |
| API URL | `VITE_BACKEND_URL` (optional) | — |
| Debug / server | — | `DEBUG_CALCOM`, `PORT`, `ALLOWED_ORIGINS`, `ENCRYPTION_KEY` |

---

## Example files

**Root `.env` (frontend only):**
```env
# Same URL as SUPABASE_URL in backend/.env
VITE_SUPABASE_URL=https://xxxx.supabase.co
# Anon key (public) — different from service_role in backend/.env
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Optional: VITE_BACKEND_URL=http://localhost:3001/api
```

**`backend/.env` (all keys):**
```env
# Same URL as VITE_SUPABASE_URL in root .env
SUPABASE_URL=https://xxxx.supabase.co
# Service role key (secret) — different from anon key above; never put in frontend
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

CALCOM_API_KEY=cal_live_xxxx
CALCOM_USERNAME=mindfulqalb
CALCOM_EVENT_TYPE_IDS={"individual-video":"123","individual-chat":"124","individual-audio":"125","couples-video":"126","couples-audio":"127","family-video":"128","family-audio":"129","free-video":"130"}

RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
```
