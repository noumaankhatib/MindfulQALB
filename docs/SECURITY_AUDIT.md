# Security Audit Report

**Scope:** Codebase and environment variable usage  
**Date:** 2025-03

---

## Critical

### 1. Refund API has no authentication (IDOR)

**Location:** `api/payments/refund.ts`, `server.js` POST `/api/payments/refund`

**Issue:** Anyone can call the refund endpoint with a valid `booking_id` or `razorpay_payment_id`. There is no check that the caller is the booking owner or an admin. If a booking ID is ever exposed (URL, email, logs, or client-side), an attacker could trigger refunds for other users’ payments.

**Recommendation:** Require either:
- **Admin only:** Protect the refund route with `requireAdmin()` and expose refund only from the admin dashboard, or
- **Owner or admin:** Verify the JWT’s `user_id` matches `bookings.user_id` for the given `booking_id` before processing the refund; otherwise require admin.

---

### 2. Environment file format and secret handling

**Issue:** `.env` and `backend/.env` can contain real secrets. Two problems observed:
- **Concatenated line:** If two variables are on the same line (e.g. `RAZORPAY_KEY_SECRET=xxxVITE_SKIP_AUTH_FOR_TESTING=true`), the second variable is broken and the first may include extra characters. Always use one variable per line.
- **Secrets in repo:** Ensure `.env` and `backend/.env` are in `.gitignore` (they are) and have **never** been committed. If they were ever committed, rotate **all** secrets (Razorpay, Supabase service role, Google private key, Cal.com API key).

**Recommendation:**
- Keep one key=value per line; no spaces around `=`.
- Do not commit `.env` or `backend/.env`. If history contained them, use `git filter-branch` or BFG to remove and then rotate every secret.
- In production, use only platform env (e.g. Vercel Environment Variables); do not rely on `.env` files on the server.

---

## High

### 3. Auth bypass flag must never be set in production

**Location:** `src/components/BookingFlow.tsx` (e.g. line ~187)

**Code:** `const skipAuthForTesting = import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH_FOR_TESTING === 'true';`

**Issue:** If `VITE_SKIP_AUTH_FOR_TESTING` is set to `'true'` in the build environment, and the app is built for production, the booking flow can skip sign-in. `import.meta.env.DEV` is `false` in production builds, so this is only active in dev builds. Risk is if someone builds with `NODE_ENV=development` or sets the flag in Vercel for a production deployment.

**Recommendation:**
- Do **not** set `VITE_SKIP_AUTH_FOR_TESTING` in Vercel (or any production) environment.
- In Vercel, ensure the variable is either unset or explicitly `false` for Production.
- Optionally remove the flag from the production build: e.g. `const skipAuthForTesting = false` when `import.meta.env.PROD`, so the flag cannot affect production even if mis-set.

---

### 4. Rate limiting is in-memory and resets on cold start

**Location:** `api/_utils/rateLimit.ts`

**Issue:** Rate limits are stored in a process-local `Map`. On Vercel, each serverless instance can have its own memory; on cold start the map is empty. An attacker can send many requests across instances or after cold starts and exceed the intended limit.

**Recommendation:** For production, use a shared store (e.g. Upstash Redis, Vercel KV) for rate limit counters, as noted in the file comments.

---

## Medium

### 5. Use of `innerHTML` (low XSS risk but bad practice)

**Location:** `src/components/auth/AuthModal.tsx` (e.g. `googleButtonRef.current.innerHTML = '';`)

**Issue:** The code sets `innerHTML = ''` to clear the Google button container. That value is not user-controlled, so XSS risk is minimal. However, using `innerHTML` at all is a bad practice and can become dangerous if the code is changed later.

**Recommendation:** Prefer clearing the node without `innerHTML`, e.g. `googleButtonRef.current.replaceChildren()` or `textContent = ''`, or render the Google button via React state so no direct DOM assignment is needed.

---

### 6. CORS origin validation and preview URLs

**Location:** `api/_utils/cors.ts`

**Issue:** `isVercelPreviewUrl` allows origins matching `mindfulqalb(-[a-z0-9]+)*.vercel.app`. That is appropriate for your project. Ensure you do not add wildcards that allow arbitrary subdomains (e.g. `*.vercel.app`). Current pattern is restricted to your project name.

**Recommendation:** When adding new domains, keep an explicit allowlist. Do not use broad wildcards for origin.

---

### 7. Payment create-order: currency and amount fully server-side

**Status:** Good. Amounts are taken from server-side `PRICING_INR` / `PRICING_USD`; the client cannot lower the amount. Razorpay signature is verified with `crypto.timingSafeEqual` in `api/payments/verify.ts`. No critical issues found in payment flow.

---

## Environment variables

### Exposed to the client (VITE_*)

| Variable | Risk | Notes |
|----------|------|--------|
| `VITE_SUPABASE_URL` | Low | Required for Supabase client; can be public. |
| `VITE_SUPABASE_ANON_KEY` | Low | Designed to be public; protect with RLS. |
| `VITE_GOOGLE_CLIENT_ID` | Low | OAuth client IDs are public. |
| `VITE_BACKEND_URL` | Low | API base URL. |
| `VITE_USE_BACKEND_API` | Low | Feature flag. |
| `VITE_SKIP_AUTH_FOR_TESTING` | High if set in prod | Must never be `true` in production. |
| `VITE_SUPABASE_USE_DIRECT` | Low | Dev-only bypass for proxy. |

### Server-only (never expose)

- `SUPABASE_SERVICE_ROLE_KEY` – full DB bypass; never in frontend or in client bundles.
- `RAZORPAY_KEY_SECRET` – used only in API/server.js; never in frontend.
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` – same.
- `CALCOM_API_KEY` – same.
- Any other keys or secrets in `backend/.env` or Vercel server env.

**Check:** Ensure none of these are prefixed with `VITE_` and are not passed to the client.

---

## Summary

| Severity | Count | Action |
|----------|-------|--------|
| Critical | 2 | Fix refund auth; verify .env format and rotate secrets if ever committed. |
| High | 2 | Keep auth-bypass flag out of production; plan shared rate limiting. |
| Medium | 2 | Replace innerHTML; keep CORS strict. |

**Immediate actions:**
1. ~~Add authentication/authorization to the refund endpoint~~ **Done:** Refund API and server.js now require `Authorization: Bearer <access_token>` and admin role via `requireAdmin()`.
2. Confirm `.env` / `backend/.env` have one variable per line and have never been committed; if they were, rotate all secrets.
3. Ensure `VITE_SKIP_AUTH_FOR_TESTING` is not set in production (e.g. Vercel Production env).

**Fixes applied (this audit):**
- Refund endpoint: Admin-only auth added in `api/payments/refund.ts` and `server.js`. Frontend `requestRefund()` now requires and sends `accessToken`.
- AuthModal: Replaced `innerHTML = ''` with `replaceChildren()` to avoid XSS surface.
