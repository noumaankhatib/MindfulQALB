# Supabase setup for bookings (My Bookings & Admin)

Without this, **inserts from the API will succeed** (using the service role key), but **the frontend will get no rows** when reading because Row Level Security (RLS) blocks access by default.

**Free tier (Supabase):** The free plan includes 500 MB database, 1 GB file storage, and 50K monthly active users. This setup keeps storage low with minimal indexes and no optional audit tables, so you can run comfortably on the free tier. For capacity estimates (how many users and bookings fit), how to scan your tables, and suggestions to improve, see **[SUPABASE_FREE_TIER_CAPACITY.md](SUPABASE_FREE_TIER_CAPACITY.md)** and run **[supabase-scan-usage.sql](supabase-scan-usage.sql)** in the SQL Editor.

**Quick option:** Run the full setup in Supabase:

1. **Dashboard:** [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor** → **New query** → paste **[supabase-full-setup.sql](supabase-full-setup.sql)** → **Run**.
2. **Or with Supabase MCP:** If Supabase MCP is connected (e.g. in Cursor), you can run the contents of `docs/supabase-full-setup.sql` via the MCP **execute_sql** tool against your project.
3. Then do Section 3 (set admin role) and Section 4 (env vars).

The blocks below are the same SQL, split by section for reference.

## 1. Create the `bookings` table (if not exists)

Run in Supabase Dashboard → SQL Editor:

```sql
-- Bookings table (match src/types/database.ts)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  session_type text not null check (session_type in ('individual', 'couples', 'family')),
  session_format text not null check (session_format in ('chat', 'audio', 'video')),
  duration_minutes int not null default 60,
  scheduled_date date not null,
  scheduled_time text not null,
  timezone text not null default 'Asia/Kolkata',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  calcom_booking_id text,
  calcom_booking_uid text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  cancellation_reason text
);

create index if not exists idx_bookings_user_id on public.bookings(user_id);
create index if not exists idx_bookings_customer_email on public.bookings(customer_email);
create index if not exists idx_bookings_scheduled_date on public.bookings(scheduled_date);
```

**Consent records table** (for storing consent in the database):

```sql
-- Consent records (match src/types/database.ts)
create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  consent_version text not null,
  session_type text not null,
  acknowledgments jsonb not null default '[]',
  ip_address text,
  user_agent text,
  consented_at timestamptz not null default now()
);

create index if not exists idx_consent_records_email on public.consent_records(email);
create index if not exists idx_consent_records_consented_at on public.consent_records(consented_at);
```

**Payments table** (for admin dashboard revenue and payment history):

```sql
-- Payments table (match src/types/database.ts)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  razorpay_order_id text not null unique,
  razorpay_payment_id text,
  razorpay_signature text,
  amount_paise bigint not null,
  currency text not null default 'INR',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  refunded_at timestamptz,
  metadata jsonb default '{}'
);

create index if not exists idx_payments_razorpay_order_id on public.payments(razorpay_order_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_created_at on public.payments(created_at);
```

**Profiles table** (required for auth and admin; match [src/types/database.ts](src/types/database.ts)):

```sql
-- Profiles: one per auth.users row (id = auth.users.id)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin', 'therapist')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create profile on signup (Google, email, etc.)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

## 2. Enable RLS and add policies (required for My Bookings & Admin to show data)

**Important:** Create the `is_admin()` function first so admin policies are not blocked by RLS when checking `profiles`. Run this once:

```sql
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
```

Then run in Supabase Dashboard → SQL Editor:

```sql
-- Enable RLS on bookings
alter table public.bookings enable row level security;

-- Policy: Users can read their own bookings (by user_id)
create policy "Users can read own bookings by user_id"
  on public.bookings for select
  using (auth.uid() = user_id);

-- Policy: Users can read bookings where customer_email matches their auth email (fallback)
create policy "Users can read own bookings by email"
  on public.bookings for select
  using (
    auth.jwt() ->> 'email' is not null
    and lower(customer_email) = lower(auth.jwt() ->> 'email')
  );

-- Policy: Admins can read all bookings (uses is_admin() so RLS does not block)
create policy "Admins can read all bookings"
  on public.bookings for select
  using (public.is_admin());

-- Policy: Admins can update booking status
create policy "Admins can update bookings"
  on public.bookings for update
  using (public.is_admin());

-- Service role (API) bypasses RLS, so no policy needed for insert.
```

**Consent records (required for Admin → Consent tab):** The API inserts with the service role. So admins can see consent in the dashboard, run:

```sql
alter table public.consent_records enable row level security;

create policy "Admins can read consent records"
  on public.consent_records for select
  using (public.is_admin());
```

**Payments (required for Admin → Payments tab and revenue):** The API inserts/updates with the service role. So admins can see payments and revenue, run:

```sql
alter table public.payments enable row level security;

create policy "Admins can read payments"
  on public.payments for select
  using (public.is_admin());
```

**Profiles (required for Admin → Users tab and role checks):** Users read/update their own row; admins can read all.

```sql
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());
```

(Trigger `handle_new_user` inserts new profiles; use service role or a definer function if the trigger must insert before the user has a profile. The trigger above uses `security definer` so it runs with elevated rights.)

## 3. Set your first admin

After creating the `profiles` table and trigger, sign up or log in once so a profile row exists. Then in Supabase Table Editor open `profiles`, find your row, and set `role` to `admin`. Admin detection uses `profiles.role = 'admin'`.

## 4. Environment variables

- **Local (server.js):** In project root `.env` set:
  - `SUPABASE_URL` or `VITE_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (from Supabase Dashboard → Settings → API → service_role)
- **Vercel:** In Project → Settings → Environment Variables set:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

Restart the API after changing env vars.

### Google login redirects to Vercel when running locally

- **Cause:** Supabase only redirects OAuth (e.g. Google) to URLs that are in **Redirect URLs**. If your local URL (e.g. `http://localhost:5178`) is not listed, Supabase falls back to **Site URL** (often set to production, e.g. `https://mindfulqalb.vercel.app`).
- **Fix:** In Supabase Dashboard go to **Authentication → URL Configuration**:
  1. Under **Redirect URLs**, add your local URLs (one per line), for example:
     - `http://localhost:5173/`
     - `http://localhost:5174/`
     - `http://localhost:5178/`
     - `http://127.0.0.1:5173/`
  2. Keep your production URL in the list too (e.g. `https://mindfulqalb.vercel.app/`).
  3. **Site URL** can stay as your production URL; the **Redirect URLs** list is what allows localhost.
- After saving, try Google sign-in again on `http://localhost:5178` (or whatever port Vite is using). The app already sends `redirectTo: window.location.origin`, so once localhost is allowed, Supabase will redirect back to localhost.

### "Invalid API key undefined" / "Failed to save booking"

- **Cause:** `SUPABASE_SERVICE_ROLE_KEY` is missing, empty, or still a placeholder (e.g. `your-service-role-key` or literally `undefined`).
- **Fix:** In Supabase Dashboard go to **Project Settings → API**. Under "Project API keys", copy the **`service_role`** key (secret, not the anon key). Put it in root `.env` as `SUPABASE_SERVICE_ROLE_KEY=<paste>` with no quotes. Restart the local API (`npm run dev:api`) or redeploy on Vercel.

### Admin cannot see all bookings (or "Could not load bookings")

- **Cause:** The admin RLS policies use a subquery on `profiles` to check `role = 'admin'`. That check can be blocked by RLS on `profiles`, so the admin policy never passes and no rows are returned.
- **Fix:** Create the **`public.is_admin()`** function (SECURITY DEFINER) and use it in all admin policies so the check bypasses RLS. Run the SQL at the start of Section 2 in this doc, or re-run **[supabase-full-setup.sql](supabase-full-setup.sql)** (it includes `is_admin()` and policies that use it). Then ensure your user has `profiles.role = 'admin'`.

### Consent or Payments not showing on Admin dashboard (or "Could not load...")

- **Cause:** The admin dashboard uses the **anon** key and RLS. If there is no policy allowing admins to **select** from `consent_records` or `payments`, the queries return no rows (or an error).
- **Fix:** Run the RLS blocks in this doc: **"Admins can read consent records"** and **"Admins can read payments"**. Ensure the logged-in admin user has a row in `profiles` with `role = 'admin'`. Then refresh the dashboard.
- **Payments table:** If the `payments` table does not exist, create it with the SQL in section 1, then add the RLS policy. Payments are written by the API when users create an order and complete verification.

---

## Go-live checklist (Supabase only)

Use this with the **three-step checklist** in the main [README](../README.md#before-going-live-three-step-checklist) (Step 1 = Supabase, Step 2 = Vercel, Step 3 = Smoke test).

- [ ] **Section 1:** Create all tables (`bookings`, `consent_records`, `payments`, `profiles`) and run the `handle_new_user` trigger in SQL Editor.
- [ ] **Section 2:** Enable RLS and add all policies (bookings, consent_records, payments, profiles).
- [ ] **Section 3:** Set your profile `role` to `admin` in Table Editor → `profiles`.
- [ ] **Section 4:** Set env vars (Vercel: see README Step 2). Optionally update `index.html` structured data (e.g. telephone) before production.
