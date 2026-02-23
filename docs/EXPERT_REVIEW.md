# Expert code review – Mindful QALB

Scan date: project-wide verification of components, routing, auth, API, and config.

---

## 1. Executive summary

**Strengths**

- Clear separation: `src/` (React), `api/` (Vercel serverless), `server.js` (local dev), `backend/` (Express).
- Strong API validation (`api/_utils/validation.ts`): email, phone, name, session type, date/time, customer object, notes; sanitization for XSS.
- Auth and profile: Supabase Auth + `profiles` table, RLS, `is_admin()` for admin checks.
- Payment: Razorpay with server-side verify, refund flow with 24h policy, payment–booking link.
- TypeScript strict mode, typed DB in `src/types/database.ts`.
- SEO: FAQ schema, OG/Twitter meta, CSP in `index.html`, skip-to-content on home.

**Main gaps**

- No global Error Boundary → uncaught errors show “Unexpected Application Error” (e.g. 404).
- Footer section links (`#home`, `#get-help`, etc.) don’t take users to the home page when on `/profile` or other routes.
- Admin route shows a blank screen while `loading` (no spinner/skeleton).
- UserMenu uses full-page navigation (`window.location.href`) instead of React Router.
- FAQ schema script cleanup on unmount can throw if the node was already removed.

---

## 2. Routing & app shell

### 2.1 App.tsx

- **Routes:** `/`, `/privacy`, `/terms`, `/bookings` → `/#get-help`, `/my-bookings`, `/profile`, `/admin`. Good coverage.
- **HomePage:** Hash handling for `#get-help` and scroll is correct. Skip-to-content and FAQ schema are good.
- **Issue – FAQ schema cleanup:**  
  `useEffect` appends a script and returns `() => document.head.removeChild(script)`. If React runs the cleanup when the script was already removed (e.g. by another effect or navigation), `removeChild` can throw.  
  **Suggestion:** Guard cleanup, e.g. `if (script.parentNode) script.parentNode.removeChild(script);`
- **Issue – No error boundary:**  
  Router has no `errorElement`. Any uncaught error in a route (or 404) shows the default React Router error.  
  **Suggestion:** Add a root `errorElement` (and optionally a small 404 route) so you can show a friendly message and a link home.

### 2.2 AdminRoute

- **Issue – Blank while loading:**  
  When `loading` is true, it returns `null`, so the user sees a blank screen.  
  **Suggestion:** Return a small loading UI (e.g. centered spinner or skeleton) instead of `null`.

---

## 3. Navigation & footer

### 3.1 Navigation.tsx

- **Current behavior:** Uses `useLocation()` and `isHomePage`; off-home links use `<Link to="/#section">` so they work from `/profile` and other pages. Logo off-home is `<Link to="/">`. Good.
- **Suggestion:** Consider `useNavigate()` in UserMenu and pass a callback so “My Bookings”, “Profile”, “Admin” use `navigate('/my-bookings')` etc. instead of `window.location.href` (avoids full reload, keeps SPA behavior).

### 3.2 Footer.tsx

- **Issue – Hash links off home:**  
  Quick Links and Resources use plain `<a href="#mental-health">`, `<a href="#get-help">`, etc. On `/profile` (or any non-home route) these only change the hash on the current path; they don’t go to home.  
  **Suggestion:** Use `useLocation()`; when `pathname !== '/'`, render section links as `<Link to={"/" + link.href}>` (e.g. `to="/#get-help"`). For the logo/brand link at top of footer, same idea: off-home use `<Link to="/">`.
- **Good:** Privacy/Terms use `<Link to="/privacy">` / `<Link to="/terms">`. Social links use `target="_blank"` and `rel="noopener noreferrer"`. Crisis Resources `href="#"` is a placeholder; consider `#crisis` or a dedicated section.

---

## 4. Auth & profile

### 4.1 AuthContext.tsx

- **Good:** Session and profile loading, `onAuthStateChange`, `fetchProfile`, `updateProfile` updating `profiles` and refetching. Google OAuth and magic link use `window.location.origin` for redirect.
- **Suggestion:** In `fetchProfile`, consider an `AbortController` (or a “mounted” flag) so that if the user signs out or the component unmounts during the request, you don’t call `setProfile(data)` / `setLoading(false)` after unmount.
- **Suggestion:** Expose a small “auth not configured” state (e.g. when `!isConfigured`) so the UI can show “Sign-in unavailable” instead of looking broken.

### 4.2 AuthModal.tsx

- **Good:** Body scroll lock when open, cleanup on close. Modes: signin, signup, magic-link. Error/success messages, loading states, Google + email flows.
- **A11y:** Modal should be focus-trapped and close on Escape. Ensure `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` for the title.

### 4.3 UserMenu.tsx

- **Good:** Click-outside to close, avatar with fallback (DiceBear), display name from profile or email.
- **Issue:** Uses `window.location.href` for My Bookings, Profile, Admin.  
  **Suggestion:** Use React Router’s `useNavigate()` and `navigate('/my-bookings')`, etc., so navigation is client-side.
- **Good:** Admin link only when `profile?.role === 'admin'`.

### 4.4 ProfilePage.tsx

- **Good:** Redirect when not authenticated, form for full name and phone, `updateProfile`, success/error message, layout consistent with My Bookings.
- **Suggestion:** Add simple HTML validation (`required`, `maxLength`) on inputs in addition to existing logic.

---

## 5. Booking & payments

### 5.1 BookingFlow.tsx

- **Good:** Multi-step flow (therapy type, format, date/time, consent, details, payment), consent and payment–booking link, `linkPaymentToBooking` after create.
- **Suggestion:** On step change or modal open, clear previous error so stale messages don’t linger.
- **Suggestion:** For “Back” from payment step, consider confirming if the user has already opened the payment gateway (“Going back may cancel payment. Continue?”).

### 5.2 paymentService.ts & paymentConfig.ts

- **Good:** Razorpay loaded dynamically, signature verified on backend only. Mock mode when payments disabled. `isPaymentEnabled` forces production to real payments.
- **Config:** `PAYMENT_ENABLED` in source is fine for dev; ensure production build never overrides with mock (current `PROD` check is correct).

### 5.3 apiService.ts

- **Good:** `linkPaymentToBooking`, `requestRefund`, `createPaymentOrder`, `verifyPayment`, `createBooking`, `storeConsent`. Centralized `BACKEND_URL` and `USE_BACKEND_API`.
- **Suggestion:** On refund/link failure, consider retry or at least a clear message that “refund can be processed manually by admin”.

### 5.4 API (Vercel / server.js)

- **Good:** CORS, rate limiting (default + payment + strict), validation and sanitization, Supabase service role only on server. Refund uses 24h policy and Razorpay refund API.
- **Good:** Payments table has `booking_id`; link endpoint and BookingFlow tie payment to booking for refund-by-booking.

---

## 6. Admin dashboard

### 6.1 AdminPage.tsx

- **Good:** Tabs (Dashboard, Bookings, Payments, Consent, Users), cancel-and-refund with confirm, refund button on paid payments, error banners and “no data” hints (run Supabase setup, set admin role).
- **Good:** RLS and `is_admin()` documented; admin checks are server-side via Supabase.
- **Suggestion:** When “Cancel & refund” fails (e.g. no payment linked), still allow cancelling the booking and show a short message: “Booking cancelled. Refund could not be processed (no payment linked).”

---

## 7. Security & env

### 7.1 Secrets

- **Good:** No `RAZORPAY_KEY_SECRET` or `SUPABASE_SERVICE_ROLE_KEY` in frontend. Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (anon key is public by design).
- **Good:** `.env.example` documented; `npm run check:env` for required vars.

### 7.2 Supabase (src/lib/supabase.ts)

- **Good:** Placeholder URL/key in dev to avoid crashes; production warning when URL is missing or placeholder. Custom auth lock to avoid NavigatorLockAcquireTimeoutError.
- **Good:** `createClient<Database>` for typed tables.

### 7.3 CSP (index.html)

- **Good:** CSP meta with script-src, connect-src, frame-src for Cal.com, Razorpay, Google. `upgrade-insecure-requests`, `X-Content-Type-Options`, `Referrer-Policy`.
- **Note:** If you add more third-party scripts or iframes, update CSP accordingly.

---

## 8. Accessibility (a11y)

- **Good:** Skip-to-content on home, `aria-label` on social links in footer, semantic `<main>`, section headings.
- **Suggestions:**
  - Ensure all icon-only buttons have `aria-label` (e.g. Navigation mobile menu toggle, Admin action icons).
  - Modal (AuthModal, ConsentModal, BookingFlow): focus trap, focus return on close, `role="dialog"`, `aria-modal="true"`, close on Escape.
  - Form errors: associate with inputs via `aria-describedby` or `aria-invalid` so screen readers announce them.

---

## 9. Performance & DX

- **Good:** Vite, React 18, lazy-loading of Razorpay script. Single `createBrowserRouter` and no obvious N+1 fetches.
- **Suggestion:** Consider `React.lazy()` + `Suspense` for heavy routes (e.g. Admin, My Bookings) to shrink initial bundle.
- **Suggestion:** Add a simple health check or “API status” in the UI (or dev-only) that calls `GET /api/health` so you can see if the proxy/backend is up.

---

## 10. Suggested implementation order

1. **High impact, low effort**
   - Add a root **Error Boundary** and use it as `errorElement` in the router (and optionally a 404 route).
   - **Footer:** Use `useLocation()` and `<Link to="/#...">` for section links when not on `/`.
   - **AdminRoute:** Show a loading spinner/skeleton instead of `null`.

2. **UX**
   - **UserMenu:** Switch to `useNavigate()` for My Bookings, Profile, Admin.
   - **App.tsx FAQ cleanup:** Guard script removal with `if (script.parentNode) script.parentNode.removeChild(script);`.

3. **Resilience**
   - **AuthContext:** Avoid setState after unmount in `fetchProfile` (AbortController or mounted flag).
   - **AuthModal / ConsentModal / BookingFlow:** Focus trap, Escape to close, `role="dialog"`, `aria-modal="true"`.

4. **Optional**
   - Lazy routes for Admin and My Bookings.
   - Admin: allow “Cancel booking” even when refund fails, with a clear message.

---

## 11. Component checklist (summary)

| Area            | Status | Notes |
|-----------------|--------|--------|
| App / Router    | ✅⚠️   | Add errorElement & 404; guard FAQ script cleanup |
| AdminRoute      | ⚠️     | Show loading UI instead of null |
| Navigation      | ✅     | Off-home links fixed; consider navigate in UserMenu |
| Footer          | ⚠️     | Hash links don’t go to home from other pages |
| AuthContext     | ✅     | Optional: abort profile fetch on unmount |
| AuthModal       | ✅⚠️   | Add focus trap, Escape, aria for dialog |
| UserMenu        | ✅⚠️   | Use navigate() instead of location.href |
| ProfilePage     | ✅     | Optional: required/maxLength on inputs |
| BookingFlow     | ✅     | Optional: confirm when leaving payment step |
| ConsentModal    | ✅     | Optional: focus trap and aria |
| GetHelp         | ✅     | — |
| Chatbot         | ✅     | scrollToSection only works on home; acceptable |
| AdminPage       | ✅     | Optional: cancel without refund with message |
| API validation  | ✅     | Strong validation and sanitization |
| Payment / Refund| ✅     | Server verify, 24h policy, link payment–booking |
| Supabase / RLS  | ✅     | is_admin(), docs, go-live checklist |
| SEO / CSP       | ✅     | Meta, schema, CSP, skip-to-content |

**Legend:** ✅ Good; ⚠️ Improvement suggested; ✅⚠️ Good with small tweaks.

---

This review is based on a full project scan. Implementing the high-priority items above will improve robustness, UX, and accessibility with minimal risk.
