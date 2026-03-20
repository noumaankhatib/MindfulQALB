-- =============================================================================
-- MindfulQALB – Session Packages Migration
--
-- Run in: Supabase Dashboard → SQL Editor → New query → Paste → Run
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SESSION_PACKAGES TABLE
-- -----------------------------------------------------------------------------

create table if not exists public.session_packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_email text not null,
  customer_name text,
  customer_phone text,

  -- Package definition
  package_id text not null check (package_id in ('chat_bundle', 'starter_pack', 'growth_pack')),
  package_title text not null,
  session_type text not null check (session_type in ('individual', 'couples', 'family')),
  session_format text not null check (session_format in ('chat', 'audio', 'video')),
  duration_minutes int not null,

  -- Session tracking
  total_sessions int not null check (total_sessions > 0),
  sessions_used int not null default 0 check (sessions_used >= 0),
  sessions_remaining int not null check (sessions_remaining >= 0),

  -- Payment
  amount_paid_paise bigint,
  currency text not null default 'INR',
  razorpay_order_id text unique,
  razorpay_payment_id text,
  razorpay_signature text,

  -- Status & validity
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'active', 'exhausted', 'expired', 'refunded', 'cancelled')),
  valid_until date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_session_packages_user_id on public.session_packages(user_id);
create index if not exists idx_session_packages_customer_email on public.session_packages(customer_email);
create index if not exists idx_session_packages_status on public.session_packages(status);
create index if not exists idx_session_packages_razorpay_order_id on public.session_packages(razorpay_order_id);

-- -----------------------------------------------------------------------------
-- 2. ADD PACKAGE REFERENCE COLUMNS TO BOOKINGS
-- -----------------------------------------------------------------------------

alter table public.bookings
  add column if not exists package_id uuid references public.session_packages(id) on delete set null,
  add column if not exists is_package_session boolean not null default false;

create index if not exists idx_bookings_package_id on public.bookings(package_id);

-- -----------------------------------------------------------------------------
-- 3. TRIGGER: auto-update updated_at on session_packages
-- -----------------------------------------------------------------------------

create or replace function public.update_session_packages_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_session_packages_updated_at on public.session_packages;
create trigger trg_session_packages_updated_at
  before update on public.session_packages
  for each row execute function public.update_session_packages_updated_at();

-- -----------------------------------------------------------------------------
-- 4. FUNCTION: decrement package session after booking confirmed
-- Atomically increments sessions_used and decrements sessions_remaining,
-- and marks the package exhausted if no sessions remain.
-- -----------------------------------------------------------------------------

create or replace function public.use_package_session(p_package_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_pkg public.session_packages;
begin
  select * into v_pkg from public.session_packages
    where id = p_package_id for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Package not found');
  end if;

  if v_pkg.status <> 'active' then
    return jsonb_build_object('success', false, 'error', 'Package is not active', 'status', v_pkg.status);
  end if;

  if v_pkg.sessions_remaining <= 0 then
    return jsonb_build_object('success', false, 'error', 'No sessions remaining');
  end if;

  if v_pkg.valid_until is not null and v_pkg.valid_until < current_date then
    update public.session_packages set status = 'expired' where id = p_package_id;
    return jsonb_build_object('success', false, 'error', 'Package has expired');
  end if;

  update public.session_packages
    set sessions_used = sessions_used + 1,
        sessions_remaining = sessions_remaining - 1,
        status = case when (sessions_remaining - 1) <= 0 then 'exhausted' else 'active' end
    where id = p_package_id;

  return jsonb_build_object('success', true, 'sessions_remaining', v_pkg.sessions_remaining - 1);
end;
$$;

-- -----------------------------------------------------------------------------
-- 5. RLS POLICIES
-- -----------------------------------------------------------------------------

alter table public.session_packages enable row level security;

-- Users can see their own packages (by user_id or email)
drop policy if exists "Users view own packages" on public.session_packages;
create policy "Users view own packages" on public.session_packages
  for select using (
    auth.uid() = user_id
    or customer_email = (select email from public.profiles where id = auth.uid())
  );

-- Only admins can insert/update/delete
drop policy if exists "Admins manage packages" on public.session_packages;
create policy "Admins manage packages" on public.session_packages
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Service role bypasses RLS (used by API endpoints)
