# Step-by-step: Share Google Calendar with the service account

If the app (or `npm run verify:google-calendar`) reports **"Calendar not found (404)"**, the calendar is either missing or **not shared** with your service account. Follow these steps to share it.

---

## What you need

- The **service account email** from your env (e.g. `mindfulqalb-calendar@mindfulqalb.iam.gserviceaccount.com`).  
  It’s the value of `GOOGLE_SERVICE_ACCOUNT_EMAIL` in `.env` or `backend/.env`.
- The **Google account** that owns (or can share) the calendar you want the app to use.

---

## Step 1: Open Google Calendar

1. Go to **[Google Calendar](https://calendar.google.com)**.
2. Sign in with the Google account that owns the calendar you use for therapy sessions.

---

## Step 2: Open settings for that calendar

1. On the left, find **"My calendars"** (or "Other calendars" if it’s a shared one).
2. Hover over the **calendar name** you want the app to use.
3. Click the **three dots (⋮)** next to it.
4. Click **"Settings and sharing"**.

   Alternatively: click the **gear icon** (Settings) at top right → in the left sidebar under "Settings for my calendars", click the **name of the calendar**.

---

## Step 3: Share with specific people

1. In the calendar settings page, scroll to the section **"Share with specific people"** (or "Share with certain people").
2. Click **"+ Add people"** (or "Add people and groups").
3. In the "Add people" field, paste your **service account email** exactly as in your env, for example:
   ```text
   mindfulqalb-calendar@mindfulqalb.iam.gserviceaccount.com
   ```
4. Set the permission dropdown to **"Make changes to events"** (so the app can create and update events).
5. **Uncheck** "Send notification" (service accounts don’t read email).
6. Click **"Send"** or **"Add"**.

---

## Step 4: Confirm the Calendar ID

1. Stay in **Settings** for that calendar (or go back: Calendar → ⋮ → Settings and sharing).
2. Scroll to **"Integrate calendar"**.
3. Copy the **Calendar ID** (e.g. `xxxxx@group.calendar.google.com` or a long number like `118134537579567631097`).
4. In your project, set `GOOGLE_CALENDAR_ID` in `.env` or `backend/.env` to this **exact** value.  
   If you had a different ID before, update it and restart the server.

---

## Step 5: Verify

From the project root run:

```bash
npm run verify:google-calendar
```

You should see:

- ✅ Calendar access OK: "Your Calendar Name" (id)
- ✅ FreeBusy (...) – availability API will work.

If you still see **404**, double-check:

- The **calendar** you shared is the **same** one whose Calendar ID is in `GOOGLE_CALENDAR_ID`.
- The **service account email** in "Share with specific people" matches `GOOGLE_SERVICE_ACCOUNT_EMAIL` exactly (no extra spaces, correct domain).

---

## Quick checklist

| Step | Action |
|------|--------|
| 1 | Open [calendar.google.com](https://calendar.google.com) and sign in. |
| 2 | My calendars → ⋮ next to the calendar → **Settings and sharing**. |
| 3 | **Share with specific people** → **+ Add people** → paste service account email. |
| 4 | Permission: **Make changes to events** → Add (no need to send notification). |
| 5 | **Integrate calendar** → copy **Calendar ID** → set `GOOGLE_CALENDAR_ID` in `.env`. |
| 6 | Run `npm run verify:google-calendar` to confirm. |

After sharing, restart your dev server or redeploy so the app uses the updated calendar.
