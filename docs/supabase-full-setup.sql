-- =============================================================================
-- MindfulQALB – Full Supabase setup (Step 1 + Step 2 of go-live checklist)
--
-- How to run: Supabase Dashboard → your project → SQL Editor → New query
--             Paste this file → Run. Then set profiles.role = 'admin' (Section 3).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: TABLES
-- -----------------------------------------------------------------------------

-- Bookings
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

-- Consent records
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

-- Payments
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

-- Profiles
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

-- -----------------------------------------------------------------------------
-- SECTION 2: RLS POLICIES
-- Use a SECURITY DEFINER function so admin check is not blocked by RLS on profiles.
-- -----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.bookings enable row level security;
drop policy if exists "Users can read own bookings by user_id" on public.bookings;
create policy "Users can read own bookings by user_id" on public.bookings for select using (auth.uid() = user_id);
drop policy if exists "Users can read own bookings by email" on public.bookings;
create policy "Users can read own bookings by email" on public.bookings for select using (
  auth.jwt() ->> 'email' is not null and lower(customer_email) = lower(auth.jwt() ->> 'email')
);
drop policy if exists "Admins can read all bookings" on public.bookings;
create policy "Admins can read all bookings" on public.bookings for select using (public.is_admin());
drop policy if exists "Admins can update bookings" on public.bookings;
create policy "Admins can update bookings" on public.bookings for update using (public.is_admin());
drop policy if exists "Admins can delete bookings" on public.bookings;
create policy "Admins can delete bookings" on public.bookings for delete using (public.is_admin());

alter table public.consent_records enable row level security;
drop policy if exists "Admins can read consent records" on public.consent_records;
create policy "Admins can read consent records" on public.consent_records for select using (public.is_admin());
drop policy if exists "Admins can update consent records" on public.consent_records;
create policy "Admins can update consent records" on public.consent_records for update using (public.is_admin());
drop policy if exists "Admins can delete consent records" on public.consent_records;
create policy "Admins can delete consent records" on public.consent_records for delete using (public.is_admin());

alter table public.payments enable row level security;
drop policy if exists "Admins can read payments" on public.payments;
create policy "Admins can read payments" on public.payments for select using (public.is_admin());
drop policy if exists "Admins can update payments" on public.payments;
create policy "Admins can update payments" on public.payments for update using (public.is_admin());
drop policy if exists "Admins can delete payments" on public.payments;
create policy "Admins can delete payments" on public.payments for delete using (public.is_admin());

alter table public.profiles enable row level security;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles" on public.profiles for select using (public.is_admin());
drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles" on public.profiles for update using (public.is_admin());
