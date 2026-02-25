-- =============================================================================
-- MindfulQALB – Admin: update/delete users
-- Run in Supabase Dashboard → SQL Editor after supabase-full-setup.sql
-- =============================================================================

-- Allow admins to update any profile (name, phone, role). Email change requires backend Admin API.
drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles" on public.profiles for update using (public.is_admin());
