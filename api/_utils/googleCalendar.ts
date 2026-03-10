/**
 * Google Calendar API helpers for availability (FreeBusy) and event creation (with Meet link).
 * Uses a service account for server-to-server auth.
 *
 * Required env vars:
 *   GOOGLE_CALENDAR_ID            – Calendar to query/insert events into
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  – Service account email
 *   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY – PEM private key (newlines as literal \n)
 */

import { GoogleAuth } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

let cachedAuth: GoogleAuth | null = null;

function getAuth(): GoogleAuth {
  if (cachedAuth) return cachedAuth;

  const email = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim();
  const rawKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').trim();
  // Vercel stores multiline env vars with literal \n – convert to real newlines
  const key = rawKey.replace(/\\n/g, '\n');

  if (!email || !key) {
    throw new Error('Google Calendar service account not configured (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)');
  }

  cachedAuth = new GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: SCOPES,
  });
  return cachedAuth;
}

async function getAccessToken(): Promise<string> {
  const auth = getAuth();
  const tokenPromise = (async () => {
    const client = await auth.getClient();
    const tokenRes = await client.getAccessToken();
    const token = typeof tokenRes === 'string' ? tokenRes : tokenRes?.token;
    if (!token) throw new Error('Failed to obtain Google access token');
    return token;
  })();

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Google auth token timeout (5s)')), 5000)
  );

  return Promise.race([tokenPromise, timeout]);
}

export function getCalendarId(): string {
  const id = (process.env.GOOGLE_CALENDAR_ID || '').trim();
  if (!id) throw new Error('GOOGLE_CALENDAR_ID not set');
  return id;
}

export function isGoogleCalendarConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CALENDAR_ID?.trim() &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() &&
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim()
  );
}

// ─── FreeBusy ────────────────────────────────────────────────────────────────

export interface BusyPeriod {
  start: string;
  end: string;
}

export async function getFreeBusy(dateStr: string): Promise<BusyPeriod[]> {
  const token = await getAccessToken();
  const calendarId = getCalendarId();

  const timeMin = `${dateStr}T00:00:00+05:30`;
  const timeMax = `${dateStr}T23:59:59+05:30`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        items: [{ id: calendarId }],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`FreeBusy API ${res.status}: ${text}`);
    }

    const data = await res.json() as {
      calendars: Record<string, { busy: BusyPeriod[] }>;
    };
    return data.calendars?.[calendarId]?.busy ?? [];
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Jitsi Meet link generation ──────────────────────────────────────────────

function generateMeetingUrl(bookingId: string): string {
  const slug = bookingId.replace(/-/g, '').substring(0, 12);
  return `https://meet.jit.si/MindfulQALB-${slug}`;
}

// ─── Event creation + meeting link ──────────────────────────────────────────

export interface CalendarEventResult {
  eventId: string;
  meetingUrl: string | null;
  htmlLink: string;
}

export async function createCalendarEvent(params: {
  summary: string;
  description?: string;
  startISO: string;
  endISO: string;
  attendeeEmail: string;
  includeMeet: boolean;
  requestId?: string;
}): Promise<CalendarEventResult> {
  const token = await getAccessToken();
  const calendarId = getCalendarId();

  const meetingUrl = params.includeMeet
    ? generateMeetingUrl(params.requestId ?? `mq-${Date.now()}`)
    : null;

  const descParts = [params.description ?? ''];
  if (meetingUrl) {
    descParts.push(`\n--- Video Session ---\nJoin: ${meetingUrl}`);
  }

  const body: Record<string, unknown> = {
    summary: params.summary,
    description: descParts.join('\n'),
    start: { dateTime: params.startISO, timeZone: 'Asia/Kolkata' },
    end: { dateTime: params.endISO, timeZone: 'Asia/Kolkata' },
  };

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Calendar Events API ${res.status}: ${text}`);
  }

  const event = await res.json() as {
    id: string;
    htmlLink?: string;
  };

  return {
    eventId: event.id,
    meetingUrl,
    htmlLink: event.htmlLink ?? '',
  };
}
