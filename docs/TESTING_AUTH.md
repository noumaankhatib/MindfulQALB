# Testing Supabase auth & /sb proxy

## 1. Test locally

### Start the app
```bash
npm run dev
```
App runs at **http://localhost:5173**

### Manual test – Sign in
1. Open http://localhost:5173 in the browser.
2. Open **DevTools → Network** (filter by "Fetch/XHR" or type `sb` in the filter).
3. Click **Sign In** (or wherever the auth modal opens).
4. Try **email/password** or **Continue with Google**.
5. In Network tab you should see:
   - Requests to **`http://localhost:5173/sb/auth/v1/...`** (not to `supabase.co`).
   - Status **200** for a successful token/session request (or 400 with a body if credentials are wrong).

If you see **Failed to fetch** or **502**: the Vite proxy may not be running or the request isn’t going through `/sb`. Confirm the failing request URL starts with `http://localhost:5173/sb/`.

### Quick proxy health check (local)
```bash
# Should return Supabase health (or 200) via Vite proxy
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/sb/auth/v1/health
```
Expected: `200` (or `404` if Supabase doesn’t expose that path; the important part is no connection error).

---

## 2. Test on Vercel (production / preview)

### Deploy
Push to your branch and let Vercel build, or run:
```bash
vercel
```

### Manual test – Sign in
1. Open your deployed URL (e.g. **https://www.mindfulqalb.com** or the preview URL).
2. Open **DevTools → Network**.
3. Sign in (email or Google).
4. In Network you should see:
   - Requests to **`https://<your-domain>/sb/auth/v1/...`** (same origin, no direct `supabase.co`).
   - Status **200** for success (or 400 with JSON body for bad credentials).

If you see **502** or **Supabase proxy error**: set **SUPABASE_URL** (and optionally **SUPABASE_ANON_KEY**) in Vercel → Project → Settings → Environment Variables, then redeploy.

### Quick proxy health check (Vercel)
Replace `YOUR_DEPLOY_URL` with your actual domain (e.g. `https://www.mindfulqalb.com`):
```bash
curl -s -o /dev/null -w "%{http_code}" "YOUR_DEPLOY_URL/sb/auth/v1/health"
```
Expected: `200` (or another 2xx/4xx from Supabase, not 502).

---

## Why am I getting 502 (Bad Gateway)?

502 means the **proxy** (Vite locally, or the `/api/sb-proxy` function on Vercel) could not get a valid response from Supabase.

### Local (http://localhost:5173/sb/...)

| Cause | What to do |
|--------|------------|
| **Supabase unreachable** (e.g. ISP/region blocks `*.supabase.co`, or no internet) | Use a VPN, or try from another network. The proxy runs on your machine and must reach `https://….supabase.co`. |
| **Dev server not running** | Run `npm run dev` so the Vite proxy is active. |
| **Wrong port** | Use the port Vite prints (e.g. 5173). |

### Vercel (https://your-site.com/sb/...)

| Cause | What to do |
|--------|------------|
| **SUPABASE_URL not set** | Vercel → Project → Settings → Environment Variables → add **SUPABASE_URL** = `https://your-project.supabase.co`. Redeploy. The serverless proxy needs **SUPABASE_URL** at runtime (not only VITE_SUPABASE_URL). |
| **Supabase timeout / network error** | Function has 25s timeout. Check [Supabase status](https://status.supabase.com/). |
| **Path/rewrite wrong** | Check Vercel function logs for `[sb-proxy]` errors. |

**Quick fix (Vercel):** Confirm **SUPABASE_URL** is set correctly in Environment Variables, then redeploy.

---

## 3. Run the existing Playwright sign-in test (optional)

Uses Playwright to automate sign-in and capture auth requests/responses:

```bash
# Test production
SITE_URL=https://www.mindfulqalb.com node scripts/test-signin-flow.js

# Test local (with dev server running)
SITE_URL=http://localhost:5173 node scripts/test-signin-flow.js
```

Output is written under `signin-test-output/` (screenshots, report, auth request/response details).

---

## Checklist

| Check | Local | Vercel |
|-------|--------|--------|
| Requests go to `/sb/...` (same origin) | ✓ | ✓ |
| No direct requests to `*.supabase.co` | ✓ | ✓ |
| Sign-in returns 200 or 400 (not 500/502) | ✓ | ✓ |
| No "Failed to fetch" in console | ✓ | ✓ |
| Env: `SUPABASE_URL` (and optional `SUPABASE_ANON_KEY`) | N/A | Set in Vercel |
