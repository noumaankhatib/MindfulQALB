# Using Vercel as Supabase proxy (no paid Supabase custom domain)

Supabase **custom domains** require a **paid plan**. On the **free tier**, you can still avoid the browser talking directly to `*.supabase.co` by using the **Vercel serverless proxy** that this project already includes.

---

## How it works

- **Production:** The frontend uses your domain for all Supabase calls:  
  `https://mindfulqalb.com/sb/...`  
  Vercel rewrites `/sb/(.*)` to the **api/sb-proxy** serverless function, which forwards the request to your real Supabase URL (`https://xxxx.supabase.co`). The browser never hits `*.supabase.co` directly, which helps in regions where that host is blocked.

- **Env:** You keep using your **real Supabase project URL** in env (e.g. `https://tmegikggtccjqskuwpxi.supabase.co`). The proxy reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` and forwards to Supabase.

- **No Supabase custom domain** is required; everything goes through your Vercel project.

---

## What you need to configure

### 1. Environment variables (Supabase free tier)

Use your **actual Supabase project URL** (from Dashboard → Project Settings → API):

- **Root `.env` and Vercel:**
  - `VITE_SUPABASE_URL=https://xxxx.supabase.co` (your project ref)
  - `VITE_SUPABASE_ANON_KEY=` (anon key from same place)
- **Backend `backend/.env` and Vercel:**
  - `SUPABASE_URL=https://xxxx.supabase.co` (same URL)
  - `SUPABASE_SERVICE_ROLE_KEY=` (service role key)

Do **not** set these to `https://api.mindfulqalb.com` unless you later add that as a custom domain on **Vercel** (see below).

### 2. Vercel

- In **Vercel → Project → Settings → Environment Variables**, set:
  - `VITE_SUPABASE_URL` = your Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` = your anon key
  - `SUPABASE_URL` = same as `VITE_SUPABASE_URL`
  - (Optional) `SUPABASE_ANON_KEY` or use the anon key so the proxy can add it if needed)
- Redeploy so the proxy uses these values.

### 3. Supabase Auth (unchanged)

- **Authentication → URL Configuration**
  - **Site URL:** `https://mindfulqalb.com`
  - **Redirect URLs:** `https://mindfulqalb.com`, `https://mindfulqalb.com/**`, and `http://localhost:5173`, `http://localhost:5173/**` for dev.
- **Google OAuth:** Use the redirect URI Supabase shows (it will be under your **Supabase** project URL, e.g. `https://xxxx.supabase.co/auth/v1/callback`), and add that in Google Cloud Console. The browser will be redirected to Supabase for OAuth; after login, Supabase redirects back to `https://mindfulqalb.com` (Site URL).

---

## Optional: api.mindfulqalb.com on Vercel (no Supabase paid plan)

If you want the **frontend** to call `https://api.mindfulqalb.com` instead of `https://mindfulqalb.com/sb/...`:

### Step 1: Add the domain in Vercel

1. Open **Vercel Dashboard** → your project → **Settings** → **Domains**.
2. Add **api.mindfulqalb.com**.
3. Vercel will show DNS instructions (usually a **CNAME** record):
   - **Name:** `api` (or `api.mindfulqalb.com` depending on your DNS host).
   - **Value:** `cname.vercel-dns.com` (or the value Vercel shows).
4. Add this CNAME at your DNS provider (where mindfulqalb.com is managed).
5. Wait for DNS to propagate; Vercel will issue SSL for api.mindfulqalb.com.

### Step 2: Code (already done)

This repo is already configured:

- **vercel.json** has a rewrite so that requests to **api.mindfulqalb.com** are sent to the same `/api/sb-proxy` that forwards to Supabase.
- **api/sb-proxy.ts** sends CORS so the frontend at mindfulqalb.com (and localhost) can call api.mindfulqalb.com.

No further code changes are required.

### Step 3: Environment variables

After **api.mindfulqalb.com** is active in Vercel:

- **Vercel** → Project → **Settings** → **Environment Variables** (for Production and Preview if you want):
  - Set **VITE_SUPABASE_URL** = `https://api.mindfulqalb.com`  
    (so the built frontend uses this URL).
  - Keep **SUPABASE_URL** = `https://xxxx.supabase.co`  
    (so the serverless proxy forwards to the real Supabase).
  - Keep **VITE_SUPABASE_ANON_KEY** and **SUPABASE_SERVICE_ROLE_KEY** as they are.
- **Redeploy** the project so the new env is applied.

For **local development**, you can keep `VITE_SUPABASE_URL=https://xxxx.supabase.co` in `.env` and use the `/sb` proxy or `VITE_SUPABASE_USE_DIRECT=true`, or point to `https://api.mindfulqalb.com` once the domain is live.

### Step 4: Supabase Auth (no change)

- **Site URL** and **Redirect URLs** stay as `https://mindfulqalb.com` (and localhost for dev).  
- Google OAuth redirect URI in Google Cloud Console stays as your **Supabase** callback (e.g. `https://xxxx.supabase.co/auth/v1/callback`).  
- The browser will still go to Supabase for the OAuth redirect; after login, Supabase redirects back to mindfulqalb.com. No Supabase custom domain is involved.

---

## Summary

- **Supabase free tier:** Use the **Vercel proxy** only. Keep `VITE_SUPABASE_URL` and `SUPABASE_URL` set to your **real Supabase URL** (`https://xxxx.supabase.co`). Production traffic goes: browser → `mindfulqalb.com/sb/...` → Vercel → Supabase.
- **Supabase custom domain:** Not used on free tier; ignore the “Custom domains” section in Supabase Project Settings.
- **Optional:** Use **api.mindfulqalb.com** as a **Vercel** domain that proxies to Supabase if you want that URL in the frontend.

See also: [ENV_VARIABLES.md](ENV_VARIABLES.md), [502_AFTER_BUILD.md](502_AFTER_BUILD.md), [TESTING_AUTH.md](TESTING_AUTH.md).
