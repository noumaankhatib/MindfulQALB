-- Admin can delete bookings, and update/delete payments and consent records.
-- Run in Supabase Dashboard → SQL Editor after supabase-full-setup.sql.

-- Bookings: allow admins to delete
drop policy if exists "Admins can delete bookings" on public.bookings;
create policy "Admins can delete bookings" on public.bookings for delete using (public.is_admin());

-- Payments: allow admins to update (e.g. status) and delete
drop policy if exists "Admins can update payments" on public.payments;
create policy "Admins can update payments" on public.payments for update using (public.is_admin());
drop policy if exists "Admins can delete payments" on public.payments;
create policy "Admins can delete payments" on public.payments for delete using (public.is_admin());

-- Consent records: allow admins to update and delete
drop policy if exists "Admins can update consent records" on public.consent_records;
create policy "Admins can update consent records" on public.consent_records for update using (public.is_admin());
drop policy if exists "Admins can delete consent records" on public.consent_records;
create policy "Admins can delete consent records" on public.consent_records for delete using (public.is_admin());
