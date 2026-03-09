# Switching Google Account (Login + Calendar)

To use a **different Google account** for **Sign in with Google** and **Google Calendar**, follow these steps. No code changes are needed—only Google Cloud Console setup and environment variables.

---

## Part 1: Login with Google (OAuth)

Uses an **OAuth 2.0 Web client** from Google Cloud Console.

### 1.1 Create or use a different Google Cloud project (optional)

- Go to [Google Cloud Console](https://console.cloud.google.com/).
- Either **create a new project** or **select an existing project** that will own the OAuth client.
- Note the project; you’ll create credentials in it.

### 1.2 Create OAuth client (if using a new project)

1. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
2. If asked, configure **OAuth consent screen** (External, add your app name and support email).
3. Application type: **Web application**.
4. Name: e.g. `MindfulQALB Web`.
5. **Authorized JavaScript origins:** add your app URLs (see [GOOGLE_OAUTH_ORIGINS.md](GOOGLE_OAUTH_ORIGINS.md)), e.g.  
   `http://localhost:5173`, `https://www.mindfulqalb.com`, `https://mindfulqalb.com`.
6. **Authorized redirect URIs:** add e.g.  
   `http://localhost:5173/auth/google/callback`,  
   `https://www.mindfulqalb.com/auth/google/callback`,  
   `https://mindfulqalb.com/auth/google/callback`.
7. Create and **copy the Client ID** (ends with `.apps.googleusercontent.com`).  
   Do **not** use or expose the Client **secret** in the app.

### 1.3 Update env for Login with Google

| Where | Variable | What to set |
|-------|----------|-------------|
| **Root `.env`** | `VITE_GOOGLE_CLIENT_ID` | New OAuth **Client ID** (e.g. `123456789-xxxx.apps.googleusercontent.com`) |
| **Vercel** (if you deploy) | `VITE_GOOGLE_CLIENT_ID` | Same value as above |

Only the **Client ID** is used; the app does not use the OAuth client secret.

### 1.4 Supabase: set the same Google Client ID (required)

Supabase checks that the Google `id_token` **audience** matches the Client ID configured in the dashboard. If they differ, you get **"Unacceptable audience in id_token"** and a 400 on the token endpoint.

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. **Authentication** → **Providers** → **Google**.
3. Set **Client ID** to the **exact same** value as `VITE_GOOGLE_CLIENT_ID` (the one your app uses).
4. Optionally set **Client secret** (from the same OAuth client in Google Cloud); some flows use it.
5. Save.

After changing the Google client (new account or new project), always update this Supabase provider so the Client ID matches.

---

## Part 2: Google Calendar (availability + Meet links)

Uses a **Service Account** and a **Calendar ID**. These are independent of the OAuth client above.

### 2.1 Create or use a Service Account (same or different project)

1. In [Google Cloud Console](https://console.cloud.google.com/) (same project as OAuth, or a different one).
2. **APIs & Services** → **Credentials** → **Create Credentials** → **Service account**.
3. Name it (e.g. `mindfulqalb-calendar`), create, then open it.
4. **Keys** tab → **Add key** → **Create new key** → **JSON**. Download the JSON file.
5. From the JSON:
   - **Client email** → use for `GOOGLE_SERVICE_ACCOUNT_EMAIL` (e.g. `mindfulqalb-calendar@your-project.iam.gserviceaccount.com`).
   - **Private key** (the `private_key` field) → use for `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (keep newlines as `\n` in .env).

### 2.2 Enable Calendar API and pick the calendar

1. **APIs & Services** → **Library** → search **Google Calendar API** → **Enable** (for the same project).
2. Decide which calendar to use:
   - **Option A – Your personal calendar:** In [Google Calendar](https://calendar.google.com), open **Settings** → the calendar → **Integrate calendar** → copy **Calendar ID** (often your email or `xxx@group.calendar.google.com`). Then **share** that calendar with the **service account email** (Part 2.1) as “Make changes to events”.
   - **Option B – Calendar owned by the service account:** Create a new calendar in the Google account that will be used for the app; its Calendar ID is often the service account email. Use that as `GOOGLE_CALENDAR_ID`.

### 2.3 Update env for Calendar

| Where | Variable | What to set |
|-------|----------|-------------|
| **Root `.env`** or **`backend/.env`** | `GOOGLE_CALENDAR_ID` | The **Calendar ID** (e.g. `your@gmail.com` or `xxx@group.calendar.google.com`) |
| **Root `.env`** or **`backend/.env`** | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account **client email** from the JSON |
| **Root `.env`** or **`backend/.env`** | `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Full **private_key** from the JSON; in .env use `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` (literal `\n`) |
| **Vercel** (if you deploy) | Same three variables | Same values (set in Project → Settings → Environment Variables) |

**Note:** `server.js` and the API read from both root `.env` and `backend/.env`. So you can put the three Calendar variables in either file (or both); typically they live in **`backend/.env`** with other server secrets.

---

## Checklist

- [ ] New OAuth Client ID created (for Login with Google); origins and redirect URIs added.
- [ ] Root `.env`: `VITE_GOOGLE_CLIENT_ID` = new Client ID.
- [ ] **Supabase** → Authentication → Providers → Google → **Client ID** = same value as above (fixes "Unacceptable audience").
- [ ] New (or existing) Service Account created; JSON downloaded.
- [ ] Calendar API enabled for that project.
- [ ] Calendar chosen and shared with service account (if using a user calendar).
- [ ] `GOOGLE_CALENDAR_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` set in `.env` / `backend/.env` and on Vercel.
- [ ] Restart dev server / redeploy after changing env.

---

## Summary: what the app uses

| Purpose | Env variable(s) | Set in |
|--------|-------------------|--------|
| **Login with Google** | `VITE_GOOGLE_CLIENT_ID` | Root `.env`, Vercel |
| **Calendar (availability + events)** | `GOOGLE_CALENDAR_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | `backend/.env` or root `.env`, Vercel |

No application code needs to be changed; only Google Cloud configuration and these environment variables.
