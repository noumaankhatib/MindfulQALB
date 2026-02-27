# Fix 502 after build or deploy

502 when using the **built** app (e.g. `vite preview` or on Vercel) means the **/sb** auth proxy could not reach Supabase.

---

## If you're on Vercel (deployed site)

The built app calls `https://your-domain.com/sb/...`, which Vercel rewrites to the **api/sb-proxy** serverless function. That function needs **SUPABASE_URL** at runtime.

**Do this:**

1. Open **Vercel** → your project → **Settings** → **Environment Variables**.
2. Add (or fix):
   - **SUPABASE_URL** = `https://tmegikggtccjqskuwpxi.supabase.co` (your real Supabase project URL)
   - Optional: **SUPABASE_ANON_KEY** = your Supabase anon key (same as `VITE_SUPABASE_ANON_KEY`)
3. For **build** (so the frontend bundle has auth config), ensure these are also set:
   - **VITE_SUPABASE_URL** = same as `SUPABASE_URL`
   - **VITE_SUPABASE_ANON_KEY** = your anon key
4. **Redeploy**: Deployments → … → Redeploy (or push a new commit).

Do **not** set `VITE_SUPABASE_USE_DIRECT` on Vercel; production should use the `/sb` proxy.

---

## If you're running `vite preview` locally

Preview serves the built app and uses the same Vite proxy. 502 = proxy can't reach Supabase from your machine.

**Option A – Bypass proxy in build for preview:**

In root **.env** (used at build time for preview):

```env
VITE_SUPABASE_USE_DIRECT=true
VITE_SUPABASE_URL=https://tmegikggtccjqskuwpxi.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then:

```bash
npm run build
npm run preview
```

The built app will talk to Supabase directly (no /sb). Use only for local preview; do not deploy with `VITE_SUPABASE_USE_DIRECT=true`.

**Option B – Keep proxy:** Ensure your network can reach `*.supabase.co` (or use a VPN), then `npm run build && npm run preview`.

---

## Quick checklist (Vercel)

| Variable | Set in Vercel | Used for |
|----------|----------------|----------|
| **SUPABASE_URL** | Yes | Serverless /sb proxy (stops 502) |
| **VITE_SUPABASE_URL** | Yes | Build + same value |
| **VITE_SUPABASE_ANON_KEY** | Yes | Build (client auth) |
| **SUPABASE_ANON_KEY** | Optional | /sb proxy fallback |

After changing env vars, **redeploy** so the new values are used.
