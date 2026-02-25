/**
 * Test Cal.com integration: verify env, list event types, and optionally create a test booking.
 *
 * Usage:
 *   node scripts/test-calcom-booking.js                    # Check config and list event types
 *   node scripts/test-calcom-booking.js individual-video   # Create one test booking for that type
 *
 * Requires in backend/.env (or .env):
 *   CALCOM_API_KEY=cal_live_...
 *   CALCOM_EVENT_TYPE_IDS={"individual-video":"123",...}
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
// Load backend/.env first (single source for keys), then root .env and .env.local
dotenv.config({ path: path.join(root, 'backend', '.env') });
dotenv.config({ path: path.join(root, '.env') });
dotenv.config({ path: path.join(root, '.env.local') });

const API_KEY = process.env.CALCOM_API_KEY?.trim();
const EVENT_TYPE_IDS_RAW = process.env.CALCOM_EVENT_TYPE_IDS;

function parseEventTypeIds() {
  if (!EVENT_TYPE_IDS_RAW) return {};
  try {
    const parsed = JSON.parse(EVENT_TYPE_IDS_RAW);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (e) {
    console.error('Invalid CALCOM_EVENT_TYPE_IDS JSON:', e.message);
    return {};
  }
}

// Parse date+time as Asia/Kolkata and return UTC ISO (same as server.js)
function parseTimeToUTCISO(dateString, timeString) {
  const match = String(timeString).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) throw new Error('Invalid time format');
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  else if (period === 'AM' && hours === 12) hours = 0;
  const time24 = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  const isoInKolkata = `${dateString}T${time24}+05:30`;
  return new Date(isoInKolkata).toISOString();
}

async function listEventTypesV1() {
  if (!API_KEY) return null;
  const url = `https://api.cal.com/v1/event-types?apiKey=${API_KEY}`;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) {
    console.error('Cal.com v1 event-types error:', res.status, await res.text());
    return null;
  }
  const data = await res.json();
  return data.event_types || [];
}

async function createBookingV2(combinedKey, date, time, customer) {
  const eventTypeIds = parseEventTypeIds();
  const eventTypeId = eventTypeIds[combinedKey];
  if (!eventTypeId) {
    throw new Error(`No event type ID for "${combinedKey}". Set CALCOM_EVENT_TYPE_IDS in backend/.env`);
  }
  const startTime = parseTimeToUTCISO(date, time);
  const body = {
    eventTypeId: parseInt(eventTypeId, 10),
    start: startTime,
    attendee: {
      name: customer.name,
      email: customer.email,
      timeZone: 'Asia/Kolkata',
      language: 'en',
      ...(customer.phone ? { phoneNumber: customer.phone } : {}),
    },
    metadata: { source: 'test-calcom-booking-script' },
  };
  const url = 'https://api.cal.com/v2/bookings';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      'cal-api-version': '2024-08-13',
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body, json };
}

function getTomorrowYYYYMMDD() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const testKey = process.argv[2] || null;

  console.log('\n--- Cal.com integration test ---\n');

  if (!API_KEY || API_KEY.length < 20) {
    console.log('❌ CALCOM_API_KEY is missing or too short. Set it in backend/.env');
    console.log('   Get it from: Cal.com → Settings → API Keys\n');
    process.exit(1);
  }
  console.log('✅ CALCOM_API_KEY set:', API_KEY.substring(0, 14) + '...');

  const eventTypeIds = parseEventTypeIds();
  const keys = Object.keys(eventTypeIds);
  if (keys.length === 0) {
    console.log('❌ CALCOM_EVENT_TYPE_IDS is missing or invalid. Set it in backend/.env');
    console.log('   Example: CALCOM_EVENT_TYPE_IDS={"individual-video":"123","individual-chat":"124"}');
    console.log('   Run: node scripts/fetch-calcom-events.js YOUR_API_KEY  to get event IDs.\n');
    process.exit(1);
  }
  console.log('✅ CALCOM_EVENT_TYPE_IDS has', keys.length, 'keys:', keys.join(', '));

  const eventTypes = await listEventTypesV1();
  if (eventTypes && eventTypes.length > 0) {
    console.log('\n📅 Your Cal.com event types (from API):');
    eventTypes.forEach((et) => {
      console.log(`   ID ${et.id}  slug: ${et.slug}  title: ${et.title}`);
    });
  } else {
    console.log('\n⚠️  Could not list event types (v1 API). Check API key permissions.');
  }

  if (!testKey) {
    console.log('\n💡 To create a test booking, run:');
    console.log('   node scripts/test-calcom-booking.js <session-key>');
    console.log('   e.g. node scripts/test-calcom-booking.js individual-video\n');
    process.exit(0);
  }

  if (!eventTypeIds[testKey]) {
    console.log('\n❌ No event type ID for key:', testKey);
    console.log('   Available keys in CALCOM_EVENT_TYPE_IDS:', keys.join(', '));
    process.exit(1);
  }

  const date = getTomorrowYYYYMMDD();
  const time = '10:00 AM';
  const customer = {
    name: 'Test User (Script)',
    email: 'test-calcom@example.com',
    phone: '+919876543210',
  };

  console.log('\n📤 Creating test booking on Cal.com...');
  console.log('   Session key:', testKey);
  console.log('   Date:', date, 'Time:', time, '(Asia/Kolkata)');
  console.log('   Attendee:', customer.name, customer.email);

  const { ok, status, body, json } = await createBookingV2(testKey, date, time, customer);

  console.log('\n--- Cal.com v2 API response ---');
  console.log('HTTP status:', status);
  console.log('Request body (sent):', JSON.stringify(body, null, 2));
  console.log('Response:', JSON.stringify(json, null, 2));

  if (ok && json.status !== 'error') {
    const uid = json.data?.uid ?? json.data?.id;
    console.log('\n✅ Test booking created on Cal.com. UID:', uid);
    console.log('   Check Cal.com dashboard → Bookings to see it.\n');
  } else {
    console.log('\n❌ Cal.com booking failed.');
    console.log('   Message:', json.message || json.error || 'No message');
    console.log('   Fix CALCOM_API_KEY / CALCOM_EVENT_TYPE_IDS and try again.\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
