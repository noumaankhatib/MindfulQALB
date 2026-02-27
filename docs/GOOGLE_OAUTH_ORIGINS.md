# Fix Google “Error 400: origin_mismatch”

Google blocks sign-in when the app’s URL is not allowed for your OAuth client. Add the origins and redirect URIs below in **Google Cloud Console**.

**.env:** Add your Google **Client ID** to root `.env` as `VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com` (and in Vercel env). Do **not** add the client **secret** to .env — it is not used by this app and must never be in the frontend.

---

## 1. Open your OAuth client

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Select the project that owns the OAuth client ID used by this app (client ID in code: `57725851287-h21ml8nciji9uplg9uorqlmghaqo17c8...`).
3. Open **APIs & Services** → **Credentials**.
4. Under **OAuth 2.0 Client IDs**, click the client used for “Web application” or “Web client” (the one whose Client ID matches the app).

---

## 2. Add Authorized JavaScript origins

In the client, under **Authorized JavaScript origins**, add these (one per line).  
These are the URLs where the app runs (no path, no trailing slash).

**Local:**

```
http://localhost:5173
http://localhost:5174
http://127.0.0.1:5173
```

**Vercel / production:**

```
https://www.mindfulqalb.com
https://mindfulqalb.com
```

**Optional (Vercel previews):**

```
https://mindfulqalb.vercel.app
```

If you use other preview URLs (e.g. `https://mindfulqalb-xxx.vercel.app`), add them too.

---

## 3. Add Authorized redirect URIs

Under **Authorized redirect URIs**, add these.  
The app uses `/auth/google/callback` for the Google popup fallback.

**Local:**

```
http://localhost:5173/auth/google/callback
http://localhost:5174/auth/google/callback
http://127.0.0.1:5173/auth/google/callback
```

**Vercel / production:**

```
https://www.mindfulqalb.com/auth/google/callback
https://mindfulqalb.com/auth/google/callback
```

**Optional (Vercel previews):**

```
https://mindfulqalb.vercel.app/auth/google/callback
```

---

## 4. Save

Click **Save**. Changes can take a few minutes to apply. Then try **Continue with Google** again from:

- **Local:** `http://localhost:5173`
- **Production:** `https://www.mindfulqalb.com`

---

## Quick copy-paste

**JavaScript origins (one per line):**

```
http://localhost:5173
http://localhost:5174
http://127.0.0.1:5173
https://www.mindfulqalb.com
https://mindfulqalb.com
```

**Redirect URIs (one per line):**

```
http://localhost:5173/auth/google/callback
http://localhost:5174/auth/google/callback
http://127.0.0.1:5173/auth/google/callback
https://www.mindfulqalb.com/auth/google/callback
https://mindfulqalb.com/auth/google/callback
```

---

## Supabase

Also ensure **Supabase** allows the same URLs:

- **Authentication** → **URL Configuration**
- **Site URL:** e.g. `https://www.mindfulqalb.com`
- **Redirect URLs:** add the same local and production URLs you use (e.g. `http://localhost:5173/`, `https://www.mindfulqalb.com/`).

This way both Google and Supabase allow your local and Vercel origins.
