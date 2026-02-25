# Supabase Free Tier – Capacity & Usage

This doc summarizes **Supabase free tier limits**, how they apply to MindfulQALB (users + bookings), how to **scan your tables** to see current usage, and **suggestions to improve** and stay within limits.

---

## 1. Free tier limits (summary)

| Resource | Free tier limit | What it means for you |
|----------|-----------------|------------------------|
| **Auth – Monthly Active Users (MAU)** | **50,000** | Up to 50,000 *different* users can sign in (or refresh token) per billing month. Total *registered* users in `auth.users` is not capped by MAU; it’s limited by database size. |
| **Database size** | **500 MB** | Total size of your Postgres database (tables + indexes). This is the main limit for “how many users and bookings” you can store. |
| **Egress** | **5 GB / month** | Data transferred out (API responses, Realtime, etc.). Normal dashboard and booking flows use little unless you have very heavy traffic. |
| **Projects** | **2 free projects** | You can have 2 free projects per org. |
| **Realtime** | 200 concurrent connections, 100 msg/s | Only relevant if you use Supabase Realtime; MindfulQALB does not rely on it for core booking. |

So in practice:

- **“How many users can create?”** – As many as fit in 500 MB together with their bookings, payments, and consent. There is no separate “user cap” other than **50K MAU** (logins per month) and **500 MB** total DB.
- **“How many bookings can be completed?”** – Again limited by the **500 MB** database. Row counts below give a rough idea.

---

## 2. Table scan – row counts and size estimate

Run this in **Supabase Dashboard → SQL Editor** to see current row counts and an estimate of how much space your app tables use.

```sql
-- MindfulQALB: table row counts and approximate size (run in Supabase SQL Editor)
-- Uses pg_total_relation_size for real size; pg_class for row estimates.

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
```

To see **total database size** (all tables + system):

```sql
select pg_size_pretty(pg_database_size(current_database())) as total_db_size;
```

Interpretation:

- **Row counts** tell you how many users (profiles), bookings, payments, and consent records you have.
- **total_size** per table is the real on-disk size (table + indexes). Sum these for your app; the rest of the 500 MB is system catalogs, `auth.users`, etc.
- **total_db_size** must stay **under 500 MB** on the free tier.

---

## 3. Rough capacity (how many users & bookings?)

Approximate **on-disk size per row** for your schema (with indexes):

| Table | Approx. bytes/row (incl. indexes) | Rows per 100 MB |
|-------|------------------------------------|------------------|
| `profiles` | ~400 | ~250,000 |
| `bookings` | ~600 | ~170,000 |
| `payments` | ~350 | ~290,000 |
| `consent_records` | ~350 | ~290,000 |

`auth.users` (Supabase Auth) is separate and typically similar to profiles in size.

**Example scenarios (within 500 MB):**

- **Light:** 2,000 users, 10,000 bookings, 10,000 payments, 5,000 consent rows → well under 100 MB.
- **Medium:** 20,000 users, 100,000 bookings, 100,000 payments, 50,000 consent → ~200–300 MB.
- **Heavy:** 50,000+ users and hundreds of thousands of bookings/payments can approach 500 MB; run the scan SQL regularly.

So in practice:

- You can have **many thousands of users** and **tens of thousands of completed bookings** on the free tier, as long as total DB size stays under 500 MB.
- **MAU (50K)** limits how many of those users can *log in* in a single month, not how many rows you store.

---

## 4. Suggestions to improve and stay within limits

### 4.1 Monitor usage

- Run the **table scan** above monthly (or before launches) and keep **total_db_size** and sum of table sizes in mind.
- In Supabase: **Project Settings → Usage** (or Billing) to see database size and egress.

### 4.2 Keep only necessary indexes

Your `supabase-full-setup.sql` already keeps indexes minimal (e.g. `bookings(user_id, customer_email, scheduled_date)`). Avoid adding indexes you don’t need for queries; each index uses space and slows writes.

### 4.3 Archive or prune old data (when you need to)

- **Bookings:** Consider moving very old, non-active bookings (e.g. `status = 'completed'` and `scheduled_date` &gt; 2 years ago) to an archive table or cold storage, then delete from `bookings` (and optionally keep a small “summary” table for reporting). Do the same for related `payments` if you archive by `booking_id`.
- **Consent:** Keep consent for legal reasons, but if your policy allows, you could periodically delete or archive very old `consent_records` (e.g. older than 7 years) after export.

Implement archiving only when you approach 500 MB or need to reduce growth; document the process so you don’t break referential integrity.

### 4.4 Avoid storing large blobs in the database

- Keep storing only structured booking/payment/consent data. Don’t put file uploads (e.g. PDFs, images) in Postgres; use **Supabase Storage** (free tier has 1 GB) or another object store.

### 4.5 Control API and list size

- When loading bookings or payments in Admin/My Bookings, use **pagination** or **limit + offset** so you don’t pull thousands of rows in one request. This also keeps egress low.

### 4.6 When to upgrade

- **Database &gt; 500 MB:** Upgrade to Pro (or archive data) to avoid hitting the limit.
- **MAU &gt; 50,000:** Upgrade if you need more than 50K monthly active users.
- **Egress &gt; 5 GB/month:** Upgrade or optimize queries and list sizes.

---

## 5. Quick reference

| Question | Answer |
|----------|--------|
| How many users can *sign in* per month? | **50,000 MAU** (free tier). |
| How many users + bookings can I *store*? | As many as fit in **500 MB** total DB; run the table scan to see current usage. |
| How do I know my current usage? | Run the SQL in **Section 2** in Supabase SQL Editor and check **Project Settings → Usage**. |
| How to improve? | Monitor size, keep indexes minimal, archive old data when needed, paginate lists, avoid large blobs in DB; upgrade when you exceed 500 MB or 50K MAU. |
