# Security

## Required: Supabase Row Level Security (RLS)

**Admin dashboard and user data are protected only if RLS is enabled.**

- The `/admin` UI and route guard prevent non-admins from seeing the dashboard, but **anyone with a valid Supabase anon key can call the client API** (e.g. `supabase.from('bookings').select('*')`). Protection **must** be enforced in the database.
- **Enable RLS** on all tables that store sensitive data: `bookings`, `payments`, `profiles`, `consent_records`, `audit_logs`.
- **Policies to implement (example):**
  - **profiles**: Users can read/update only their own row (`auth.uid() = id`). Optionally allow read for therapists/admins as needed.
  - **bookings**: Users can read/insert their own (`user_id = auth.uid()`). Admins (e.g. `profiles.role = 'admin'`) can read/update all.
  - **payments**: Users can read payments for their own bookings. Admins can read all. No direct insert from client; payments are created server-side (e.g. via API).
  - **consent_records / audit_logs**: Restrict by `user_id` or admin-only read.

Without RLS, an authenticated user could read or modify other users’ data by using the Supabase client directly.

## Environment and secrets

- Never commit `.env`, `backend/.env`, or any file containing `RAZORPAY_KEY_SECRET`, `CALCOM_API_KEY`, or Supabase service keys.
- All secrets must be set in the deployment environment (e.g. Vercel Environment Variables) and loaded via `process.env` or `import.meta.env` (Vite) only on the server or in build-time public config (e.g. `VITE_*` for non-secret frontend config).
- The frontend must **never** receive or store Razorpay secret, Cal.com API key, or Supabase service role key.

## API security (Vercel serverless)

- **Input validation**: All API handlers use `api/_utils/validation.ts` (allowlists, regex, length limits). User-supplied strings (e.g. name, notes) are sanitized with `sanitizeString` before sending to external services or storing.
- **Rate limiting**: In-memory rate limiting is applied (see `api/_utils/rateLimit.ts`). Client identification prefers `x-real-ip` over `x-forwarded-for` to reduce spoofing. For high traffic, use a shared store (e.g. Upstash Redis).
- **CORS**: Allowed origins are explicit and include the production and staging domains; preview URLs are validated by pattern.
- **Payment verification**: Razorpay signature is verified with HMAC-SHA256 and constant-time comparison; no internal or third-party error details are returned to the client.
- **Error responses**: API handlers return generic error messages to the client (e.g. “Failed to create booking”) and log detailed errors server-side only.

## Frontend

- No `dangerouslySetInnerHTML` or unsanitized HTML from user input.
- Sensitive data (PII, tokens) are not stored in `localStorage`; session-only data uses `sessionStorage` with clear naming (e.g. `mq_*`) and cleanup.
- Admin route is guarded: only signed-in users with `profile.role === 'admin'` can render the admin page; others are redirected to `/`.

## Reporting vulnerabilities

Please report security issues to **mindfulqalb@gmail.com** and do not open public issues for vulnerabilities.
