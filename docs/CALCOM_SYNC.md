# Cal.com sync – bookings appearing in your calendar

For bookings created on the website to show up in Cal.com (and your calendar), the backend must have Cal.com configured.

## 1. Get your Cal.com API key

1. Log in to [Cal.com](https://cal.com).
2. Go to **Settings** → **Developer** → **API Keys**.
3. Create an API key and copy it.

## 2. Get your Event Type IDs

The app maps each session type (e.g. Individual Video, Couples Audio) to a Cal.com **event type**. You need the **numeric ID** for each.

**Option A – Using the script (recommended)**

```bash
node scripts/fetch-calcom-events.js YOUR_CALCOM_API_KEY
```

This prints your event types and their IDs. Note the IDs for the event types you use (e.g. “Individual – Video”, “Couples – Video”).

**Option B – From Cal.com dashboard**

1. In Cal.com go to **Event Types**.
2. Open each event type and check the URL or settings for its **ID** (number).

## 3. Set environment variables

Put **all API keys** in **`backend/.env`**. The root server (`npm run dev:api`) loads `backend/.env` first, then root `.env`. So Cal.com (and other secrets) belong in `backend/.env`:

Also set them in **Vercel** → Project → Settings → Environment Variables if you deploy:

```env
# Required for Cal.com sync
CALCOM_API_KEY=cal_live_xxxxxxxxxxxx
CALCOM_USERNAME=your-username

# Map app session keys to Cal.com event type IDs (numbers as strings)
# Keys: individual-chat, individual-audio, individual-video, couples-audio, couples-video, family-audio, family-video, free-video
CALCOM_EVENT_TYPE_IDS={"individual-chat":"123","individual-audio":"124","individual-video":"125","couples-audio":"126","couples-video":"127","family-audio":"128","family-video":"129","free-video":"130"}
```

Replace the numbers with your real event type IDs from step 2. The **keys** (e.g. `individual-video`) must match exactly; the **values** are the Cal.com event type IDs as strings.

## 4. Restart the API server

After changing `.env`:

- **Local:** Restart `npm run dev:api` (or `node server.js`).
- **Vercel:** Redeploy or wait for the next deployment so new env vars are used.

## 5. Check that it works

1. Create a test booking on the website (while signed in).
2. In the **terminal** (local server) you should see: `Cal.com booking created: …`
3. In **Cal.com** → **Bookings**, the new booking should appear.

**Test Cal.com from the command line (recommended)**

Before testing in the app, verify Cal.com config and create a test booking directly:

```bash
# Check env and list your Cal.com event types
npm run test:calcom

# Create one test booking (e.g. individual-video) – appears in Cal.com dashboard
node scripts/test-calcom-booking.js individual-video
```

The script prints the exact request and response from Cal.com. If it fails, fix the reported issue (wrong API key, missing event type ID, etc.) then try again.

**Optional: debug Cal.com in the server**

When a booking is created via the website, the server calls Cal.com. To log the request and response:

```bash
DEBUG_CALCOM=1 npm run dev:api
```

Then create a booking in the app; the terminal will show `Cal.com request:` and `Cal.com response:`.

If you see in the terminal: `Cal.com failed (will still save to DB): …`, then:

- **"event type not configured"** → Add the missing key to `CALCOM_EVENT_TYPE_IDS` in **backend/.env** (e.g. `individual-video`) with the correct Cal.com event type ID. Restart the API.
- **"API key not configured"** → Set `CALCOM_API_KEY` in **backend/.env** and restart.
- **401 / 403** → Check that the API key is valid and has the right permissions in Cal.com.
- **Other message** → The server now logs the full Cal.com API error. Check the terminal for `Cal.com API error:` or `Cal.com returned error:` to see the exact reason (e.g. slot not available, past time, event type disabled).

## Session keys used by the app

| App session              | Env key             |
|---------------------------|---------------------|
| Individual – Chat         | `individual-chat`   |
| Individual – Audio        | `individual-audio`  |
| Individual – Video        | `individual-video`  |
| Couples – Audio           | `couples-audio`     |
| Couples – Video           | `couples-video`     |
| Family – Audio            | `family-audio`      |
| Family – Video            | `family-video`      |
| Free consultation (video) | `free` or `free-video` |

Create matching event types in Cal.com and map each to the correct ID in `CALCOM_EVENT_TYPE_IDS`.
