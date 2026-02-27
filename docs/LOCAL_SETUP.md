# Local development setup

Minimal steps to run the app and sign in locally.

---

## 1. Frontend env (required for auth)

Create a file **`.env`** in the **project root** (same folder as `package.json`):

```env
# Supabase (from Dashboard → Settings → API)
VITE_SUPABASE_URL=https://tmegikggtccjqskuwpxi.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google sign-in (from Cloud Console → Credentials → your Web client ID)
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Replace:
- **VITE_SUPABASE_ANON_KEY** with your Supabase **anon (public)** key.
- **VITE_GOOGLE_CLIENT_ID** with your Google OAuth **Client ID** (not the secret).

Use your real Supabase project URL if it’s different from the one above.

---

## 2. Backend env (optional: bookings, payments, calendar)

If you need the **API** (bookings, payments, availability), create **`backend/.env`**:

```env
# Same URL as VITE_SUPABASE_URL in root .env
SUPABASE_URL=https://tmegikggtccjqskuwpxi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Cal.com, Razorpay (see docs/ENV_VARIABLES.md)
```

Get **SUPABASE_SERVICE_ROLE_KEY** from Supabase → Settings → API → **service_role** (secret).

---

## 3. Run the app

**Frontend only (auth, UI):**
```bash
npm run dev
```
Opens **http://localhost:5173**. Sign-in uses the root `.env` and the Vite proxy (`/sb` → Supabase).

**Frontend + API (bookings, payments):**
```bash
# Terminal 1
npm run dev:api

# Terminal 2
npm run dev
```
Frontend proxies `/api` to `http://localhost:3001`.

---

## 4. Google sign-in on localhost

Add your local URL in **Google Cloud Console** so you don’t get `origin_mismatch`:

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → your **Web client**.
2. **Authorized JavaScript origins:** add `http://localhost:5173` (and `http://localhost:5174` if you use that port).
3. **Authorized redirect URIs:** add `http://localhost:5173/auth/google/callback`.

See **docs/GOOGLE_OAUTH_ORIGINS.md** for the full list.

---

## 5. Supabase redirect URLs

In **Supabase** → **Authentication** → **URL Configuration** → **Redirect URLs**, add:

- `http://localhost:5173/`
- `http://localhost:5174/` (if you use that port)

---

## Summary

| Goal              | What you need                                      |
|-------------------|----------------------------------------------------|
| Sign in (email/Google) | Root **`.env`** with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_CLIENT_ID` |
| Bookings / API    | **`backend/.env`** with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` + run `npm run dev:api` |
| No 502            | Run `npm run dev` (Vite proxy must be running); ensure your network can reach Supabase. |

---

## Still getting 502 locally?

The proxy (Vite) forwards `/sb` to Supabase. 502 or **ETIMEDOUT** means **the proxy could not reach Supabase** from your machine (connection times out — often firewall, ISP, or region).

**Fix 502 — do these in order:**

1. **Ensure `VITE_SUPABASE_URL` is the real Supabase URL** (not a proxy path). In root `.env` it must look like:
   ```env
   VITE_SUPABASE_URL=https://tmegikggtccjqskuwpxi.supabase.co
   ```
   Not `http://localhost:5173/sb` and not a placeholder. Get it from Supabase → Settings → API → Project URL.

2. **Bypass the proxy** by adding this line to root `.env`:
   ```env
   VITE_SUPABASE_USE_DIRECT=true
   ```

3. **Restart the dev server:** stop the current `npm run dev` (Ctrl+C) and run `npm run dev` again.

4. Open the app and try sign-in. In the browser console you should see: `[Auth] Using direct Supabase URL (VITE_SUPABASE_USE_DIRECT=true)`.

- **If sign-in works:** Keep `VITE_SUPABASE_USE_DIRECT=true` for local dev. The proxy can't reach Supabase from your network.
- **If you get "Failed to fetch" instead:** Your network may block `*.supabase.co`. Try a VPN or another network.

Remove `VITE_SUPABASE_USE_DIRECT` (or set it to `false`) before deploying; production should use the `/sb` proxy.

---

## ERR_CONNECTION_TIMED_OUT with direct URL

If you set `VITE_SUPABASE_USE_DIRECT=true` and see **net::ERR_CONNECTION_TIMED_OUT** or **Failed to fetch** to `….supabase.co`, your network cannot reach Supabase (common in some regions).

**Options:**

1. **Use a VPN** so your machine can reach Supabase; then sign-in should work locally.
2. **Test auth on the deployed site** (e.g. https://www.mindfulqalb.com). There the browser only talks to your domain; Vercel’s serverless proxy (which can reach Supabase) handles `/sb`. Ensure **SUPABASE_URL** is set in Vercel (see docs/502_AFTER_BUILD.md).
3. **Try another network** (e.g. mobile hotspot) to confirm the block is network-specific.

---

Full env reference: **docs/ENV_VARIABLES.md**.
