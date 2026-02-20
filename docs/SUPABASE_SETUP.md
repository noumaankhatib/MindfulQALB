# Supabase setup for bookings (My Bookings & Admin)

Without this, **inserts from the API will succeed** (using the service role key), but **the frontend will get no rows** when reading because Row Level Security (RLS) blocks access by default.

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

## 2. Enable RLS and add policies (required for My Bookings & Admin to show data)

Run in Supabase Dashboard → SQL Editor:

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

-- Policy: Admins (profiles.role = 'admin') can read all bookings
create policy "Admins can read all bookings"
  on public.bookings for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Policy: Admins can update booking status
create policy "Admins can update bookings"
  on public.bookings for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Service role (API) bypasses RLS, so no policy needed for insert.
-- Only the above SELECT/UPDATE policies are for the frontend (anon key).
```

**Consent records (required for Admin → Consent tab):** The API inserts with the service role. So admins can see consent in the dashboard, run:

```sql
alter table public.consent_records enable row level security;

create policy "Admins can read consent records"
  on public.consent_records for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
```

**Payments (required for Admin → Payments tab and revenue):** The API inserts/updates with the service role. So admins can see payments and revenue, run:

```sql
alter table public.payments enable row level security;

create policy "Admins can read payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
```

## 3. Ensure `profiles` exists and has `role`

Admin detection uses `profiles.role = 'admin'`. Your app should have a `profiles` table with at least `id` (uuid, matches auth.users.id) and `role` (text: 'user' | 'admin' | 'therapist'). If not, create it and add a trigger to create a profile on signup.

## 4. Environment variables

- **Local (server.js):** In project root `.env` set:
  - `SUPABASE_URL` or `VITE_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (from Supabase Dashboard → Settings → API → service_role)
- **Vercel:** In Project → Settings → Environment Variables set:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

Restart the API after changing env vars.

### "Invalid API key undefined" / "Failed to save booking"

- **Cause:** `SUPABASE_SERVICE_ROLE_KEY` is missing, empty, or still a placeholder (e.g. `your-service-role-key` or literally `undefined`).
- **Fix:** In Supabase Dashboard go to **Project Settings → API**. Under "Project API keys", copy the **`service_role`** key (secret, not the anon key). Put it in root `.env` as `SUPABASE_SERVICE_ROLE_KEY=<paste>` with no quotes. Restart the local API (`npm run dev:api`) or redeploy on Vercel.

### Consent or Payments not showing on Admin dashboard (or "Could not load...")

- **Cause:** The admin dashboard uses the **anon** key and RLS. If there is no policy allowing admins to **select** from `consent_records` or `payments`, the queries return no rows (or an error).
- **Fix:** Run the RLS blocks in this doc: **"Admins can read consent records"** and **"Admins can read payments"**. Ensure the logged-in admin user has a row in `profiles` with `role = 'admin'`. Then refresh the dashboard.
- **Payments table:** If the `payments` table does not exist, create it with the SQL in section 1, then add the RLS policy. Payments are written by the API when users create an order and complete verification.
