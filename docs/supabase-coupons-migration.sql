-- =============================================================================
-- MindfulQALB – Coupons for special discounts
-- Run in Supabase Dashboard → SQL Editor (after supabase-full-setup.sql)
-- =============================================================================

-- Coupons table: admin-managed discount codes
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric not null check (discount_value > 0),
  min_amount_paise bigint not null default 0,
  valid_from timestamptz,
  valid_until timestamptz,
  max_uses int,
  used_count int not null default 0,
  is_active boolean not null default true,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.coupons.code is 'Uppercase code e.g. WELCOME10';
comment on column public.coupons.discount_type is 'percent: discount_value 1-100; fixed: discount_value in INR';
comment on column public.coupons.min_amount_paise is 'Minimum order amount in paise for coupon to apply';

create index if not exists idx_coupons_code on public.coupons(upper(code));
create index if not exists idx_coupons_is_active on public.coupons(is_active);

alter table public.coupons enable row level security;

-- Only admins can manage coupons (validation is done server-side with service role)
drop policy if exists "Admins can read coupons" on public.coupons;
create policy "Admins can read coupons" on public.coupons for select using (public.is_admin());
drop policy if exists "Admins can insert coupons" on public.coupons;
create policy "Admins can insert coupons" on public.coupons for insert with check (public.is_admin());
drop policy if exists "Admins can update coupons" on public.coupons;
create policy "Admins can update coupons" on public.coupons for update using (public.is_admin());
drop policy if exists "Admins can delete coupons" on public.coupons;
create policy "Admins can delete coupons" on public.coupons for delete using (public.is_admin());

-- =============================================================================
-- RPC: validate_coupon – callable from booking flow (anon) to validate without API
-- Returns: { "valid": true/false, "discount_paise": number, "message": text, "code": text, "coupon_id": uuid }
-- =============================================================================
create or replace function public.validate_coupon(p_code text, p_amount_paise bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
  v_amount bigint;
  v_discount_paise bigint := 0;
  v_now timestamptz := now();
begin
  v_amount := greatest(0, coalesce(p_amount_paise, 0)::bigint);
  if trim(coalesce(p_code, '')) = '' then
    return jsonb_build_object('valid', false, 'message', 'Coupon code is required');
  end if;

  select id, code, discount_type, discount_value, min_amount_paise, valid_from, valid_until, max_uses, used_count, is_active
  into v_row
  from public.coupons
  where upper(trim(code)) = upper(trim(p_code))
  limit 1;

  if not found or not v_row.is_active then
    return jsonb_build_object('valid', false, 'message', 'Invalid or inactive coupon code');
  end if;

  if v_row.valid_from is not null and v_row.valid_from > v_now then
    return jsonb_build_object('valid', false, 'message', 'This coupon is not yet valid');
  end if;
  if v_row.valid_until is not null and v_row.valid_until < v_now then
    return jsonb_build_object('valid', false, 'message', 'This coupon has expired');
  end if;
  if v_row.max_uses is not null and coalesce(v_row.used_count, 0) >= v_row.max_uses then
    return jsonb_build_object('valid', false, 'message', 'This coupon has reached its usage limit');
  end if;

  if v_amount < coalesce(v_row.min_amount_paise, 0) then
    if coalesce(v_row.min_amount_paise, 0) > 0 then
      return jsonb_build_object('valid', false, 'message', 'Minimum order amount is ₹' || round(v_row.min_amount_paise / 100.0) || ' for this coupon');
    else
      return jsonb_build_object('valid', false, 'message', 'Invalid amount');
    end if;
  end if;

  if v_row.discount_type = 'percent' then
    v_discount_paise := (v_amount * least(100, greatest(0, v_row.discount_value)) / 100)::bigint;
  else
    v_discount_paise := least(v_amount, (v_row.discount_value * 100)::bigint);
  end if;

  if v_discount_paise <= 0 then
    return jsonb_build_object('valid', false, 'message', 'No discount applies to this order');
  end if;

  return jsonb_build_object(
    'valid', true,
    'discount_paise', v_discount_paise,
    'code', v_row.code,
    'coupon_id', v_row.id
  );
end;
$$;

comment on function public.validate_coupon(text, bigint) is 'Validates a coupon for the booking flow. Callable by anon.';

grant execute on function public.validate_coupon(text, bigint) to anon;
grant execute on function public.validate_coupon(text, bigint) to authenticated;
