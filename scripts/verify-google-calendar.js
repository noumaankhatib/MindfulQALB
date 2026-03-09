#!/usr/bin/env node
/**
 * Verify Google Calendar access: env vars + Calendar API (ID and sharing).
 * Run from project root: node scripts/verify-google-calendar.js
 * Uses same env load order as server.js: backend/.env, .env, .env.local
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

dotenv.config({ path: path.resolve(root, 'backend', '.env') });
dotenv.config({ path: path.resolve(root, '.env') });
dotenv.config({ path: path.resolve(root, '.env.local') });

const googleCalId = process.env.GOOGLE_CALENDAR_ID?.trim();
const googleSaEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
const googleSaKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();

function log(msg, level = 'info') {
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
  console[level === 'error' ? 'error' : 'log'](`${prefix} ${msg}`);
}

async function main() {
  console.log('Google Calendar verification\n');

  // 1. Env vars
  if (!googleCalId) {
    log('GOOGLE_CALENDAR_ID is missing. Set it in .env or backend/.env', 'error');
    process.exit(1);
  }
  if (!googleSaEmail) {
    log('GOOGLE_SERVICE_ACCOUNT_EMAIL is missing.', 'error');
    process.exit(1);
  }
  if (!googleSaKey || !googleSaKey.includes('BEGIN PRIVATE KEY')) {
    log('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is missing or invalid (expect PEM).', 'error');
    process.exit(1);
  }
  log(`GOOGLE_CALENDAR_ID: ${googleCalId}`);
  log(`GOOGLE_SERVICE_ACCOUNT_EMAIL: ${googleSaEmail}`);
  log('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: set (PEM)\n');

  // 2. Access token
  let token;
  try {
    const { GoogleAuth } = await import('google-auth-library');
    const key = googleSaKey.replace(/\\n/g, '\n');
    const auth = new GoogleAuth({
      credentials: { client_email: googleSaEmail, private_key: key },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    const client = await auth.getClient();
    const tokenRes = await client.getAccessToken();
    token = typeof tokenRes === 'string' ? tokenRes : tokenRes?.token;
    if (!token) throw new Error('No token returned');
  } catch (err) {
    log('Failed to get Google access token: ' + (err?.message || err), 'error');
    process.exit(1);
  }
  log('Service account auth: access token obtained\n');

  // 3. Calendar GET (exists + shared)
  const calUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(googleCalId)}`;
  const calRes = await fetch(calUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (calRes.status === 404) {
    log('Calendar not found (404).', 'error');
    console.log('\nPossible causes:');
    console.log('  1. Wrong GOOGLE_CALENDAR_ID – in Google Calendar → Settings → that calendar → Integrate calendar, copy the Calendar ID.');
    console.log('  2. Calendar not shared with the service account – share with:');
    console.log(`     ${googleSaEmail}`);
    console.log('     Permission: "Make changes to events".');
    process.exit(1);
  }

  if (!calRes.ok) {
    const text = await calRes.text().catch(() => '');
    log(`Calendar API error ${calRes.status}: ${text.slice(0, 200)}`, 'error');
    process.exit(1);
  }

  const cal = await calRes.json();
  log(`Calendar access OK: "${cal.summary ?? cal.id}" (${cal.id})`);

  // 4. Optional: freeBusy for today (confirms read)
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const timeMin = `${dateStr}T00:00:00+05:30`;
  const timeMax = `${dateStr}T23:59:59+05:30`;
  const fbRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeMin, timeMax, items: [{ id: googleCalId }] }),
  });

  if (fbRes.ok) {
    const fb = await fbRes.json();
    const busy = fb.calendars?.[googleCalId]?.busy ?? [];
    log(`FreeBusy (${dateStr}): ${busy.length} busy block(s) – availability API will work.`);
  } else {
    log('FreeBusy request failed (availability may use fallback slots): ' + fbRes.status, 'warn');
  }

  console.log('\nDone. Calendar ID and sharing are OK.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
