-- =============================================================================
-- MindfulQALB – Supabase usage scan (free tier)
-- Run in: Supabase Dashboard → SQL Editor → New query → Paste → Run
-- =============================================================================

-- 1) Row counts and size per table
select
  'profiles' as table_name,
  (select count(*) from public.profiles) as row_count,
  pg_size_pretty(pg_total_relation_size('public.profiles')) as total_size
union all
select
  'bookings',
  (select count(*) from public.bookings),
  pg_size_pretty(pg_total_relation_size('public.bookings'))
union all
select
  'payments',
  (select count(*) from public.payments),
  pg_size_pretty(pg_total_relation_size('public.payments'))
union all
select
  'consent_records',
  (select count(*) from public.consent_records),
  pg_size_pretty(pg_total_relation_size('public.consent_records'));

-- 2) Total database size (must stay under 500 MB on free tier)
select pg_size_pretty(pg_database_size(current_database())) as total_db_size;
