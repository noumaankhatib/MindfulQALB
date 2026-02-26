#!/usr/bin/env node
/**
 * Diagnose Cal.com integration issues.
 * Run: node scripts/diagnose-calcom.js
 * 
 * Requires: CALCOM_API_KEY in backend/.env or root .env
 */

import 'dotenv/config';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../backend/.env') });
config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = (process.env.CALCOM_API_KEY || '').trim();
const EVENT_TYPE_IDS = process.env.CALCOM_EVENT_TYPE_IDS || '';
const USERNAME = process.env.CALCOM_USERNAME || 'mindfulqalb';

console.log('\n=== Cal.com Integration Diagnosis ===\n');

// 1. Check API key
console.log('1. CALCOM_API_KEY:');
if (!API_KEY) {
  console.log('   ❌ NOT SET — This is required. Get it from https://app.cal.com/settings/developer/api-keys');
} else if (API_KEY.length < 20) {
  console.log(`   ❌ Too short (${API_KEY.length} chars) — probably invalid`);
} else {
  console.log(`   ✅ Set (${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}, ${API_KEY.length} chars)`);
}

// 2. Check event type IDs
console.log('\n2. CALCOM_EVENT_TYPE_IDS:');
if (!EVENT_TYPE_IDS) {
  console.log('   ❌ NOT SET — Bookings CANNOT sync to Cal.com without this!');
  console.log('   → We will fetch your event types below to help you set it up.');
} else {
  try {
    const parsed = JSON.parse(EVENT_TYPE_IDS);
    const keys = Object.keys(parsed);
    console.log(`   ✅ Set with ${keys.length} entries: ${keys.join(', ')}`);
    for (const [key, val] of Object.entries(parsed)) {
      console.log(`      ${key} → ${val}`);
    }
  } catch {
    console.log(`   ❌ Invalid JSON: ${EVENT_TYPE_IDS}`);
  }
}

// 3. Check username
console.log(`\n3. CALCOM_USERNAME: ${USERNAME}`);

// 4. Fetch event types from Cal.com API
if (API_KEY && API_KEY.length >= 20) {
  console.log('\n4. Fetching your Cal.com event types...\n');

  try {
    // Try v2 API first
    const v2Res = await fetch('https://api.cal.com/v2/event-types', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'cal-api-version': '2024-08-13',
        'Content-Type': 'application/json',
      },
    });

    if (v2Res.ok) {
      const v2Data = await v2Res.json();
      const eventTypes = v2Data.data || [];

      if (eventTypes.length === 0) {
        console.log('   ⚠️  No event types found on your Cal.com account.');
        console.log('   → Go to https://app.cal.com/event-types to create them.');
      } else {
        console.log(`   Found ${eventTypes.length} event type(s):\n`);
        const mapping = {};
        for (const et of eventTypes) {
          console.log(`   ID: ${et.id} | Slug: ${et.slug} | Title: "${et.title}" | Duration: ${et.lengthInMinutes ?? et.length ?? '?'}min`);
          if (et.slug) mapping[et.slug] = String(et.id);
        }

        console.log('\n   === SUGGESTED CALCOM_EVENT_TYPE_IDS ===');
        console.log('   Copy this into your Vercel Environment Variables:\n');

        // Try to create a smart mapping
        const smartMapping = {};
        for (const et of eventTypes) {
          const slug = (et.slug || '').toLowerCase();
          const title = (et.title || '').toLowerCase();
          const id = String(et.id);

          if (slug.includes('free') || title.includes('free') || title.includes('consultation')) {
            smartMapping['free-call'] = id;
          }
          if (slug.includes('individual') && slug.includes('video') || title.includes('individual') && title.includes('video')) {
            smartMapping['individual-video'] = id;
          }
          if (slug.includes('individual') && slug.includes('audio') || title.includes('individual') && title.includes('audio')) {
            smartMapping['individual-audio'] = id;
          }
          if (slug.includes('individual') && slug.includes('chat') || title.includes('individual') && title.includes('chat')) {
            smartMapping['individual-chat'] = id;
          }
          if (slug.includes('couples') || title.includes('couples') || title.includes('couple')) {
            if (slug.includes('video') || title.includes('video')) smartMapping['couples-video'] = id;
            else if (slug.includes('audio') || title.includes('audio')) smartMapping['couples-audio'] = id;
            else if (slug.includes('chat') || title.includes('chat')) smartMapping['couples-chat'] = id;
            else smartMapping['couples-video'] = id;
          }
          if (slug.includes('family') || title.includes('family')) {
            if (slug.includes('video') || title.includes('video')) smartMapping['family-video'] = id;
            else if (slug.includes('audio') || title.includes('audio')) smartMapping['family-audio'] = id;
            else if (slug.includes('chat') || title.includes('chat')) smartMapping['family-chat'] = id;
            else smartMapping['family-video'] = id;
          }
        }

        if (Object.keys(smartMapping).length > 0) {
          console.log(`   CALCOM_EVENT_TYPE_IDS=${JSON.stringify(smartMapping)}`);
        } else {
          console.log('   Could not auto-map. Manual mapping using IDs above:');
          console.log(`   CALCOM_EVENT_TYPE_IDS={"free-call":"${eventTypes[0]?.id}","individual-video":"${eventTypes[0]?.id}","individual-audio":"${eventTypes[0]?.id}","individual-chat":"${eventTypes[0]?.id}"}`);
        }

        console.log('\n   Keys your booking flow sends:');
        console.log('   free-call, individual-video, individual-audio, individual-chat,');
        console.log('   couples-video, couples-audio, couples-chat,');
        console.log('   family-video, family-audio, family-chat');
      }
    } else {
      const errText = await v2Res.text();
      console.log(`   ❌ Cal.com API returned ${v2Res.status}: ${errText}`);
      if (v2Res.status === 401) {
        console.log('   → Your API key is invalid or expired. Generate a new one at:');
        console.log('     https://app.cal.com/settings/developer/api-keys');
      }
    }
  } catch (err) {
    console.log(`   ❌ Failed to connect: ${err.message}`);
  }

  // 5. Test availability endpoint
  console.log('\n5. Testing availability fetch...');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1);
    if (tomorrow.getDay() === 6) tomorrow.setDate(tomorrow.getDate() + 2);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const slug = process.env.CALCOM_AVAILABILITY_SLUG || 'individual-therapy-video';
    const url = `https://api.cal.com/v1/slots?eventTypeSlug=${slug}&username=${USERNAME}&startTime=${dateStr}T00:00:00.000Z&endTime=${dateStr}T23:59:59.999Z`;

    const slotsRes = await fetch(url, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });

    if (slotsRes.ok) {
      const slotsData = await slotsRes.json();
      const dateSlots = slotsData.slots?.[dateStr] || [];
      console.log(`   ✅ Slots API works. ${dateSlots.length} slots for ${dateStr}`);
      if (dateSlots.length === 0) {
        console.log(`   ⚠️  No slots returned. Check that event type slug "${slug}" exists for user "${USERNAME}".`);
        console.log('   → You may need to set CALCOM_AVAILABILITY_SLUG to match one of your event type slugs above.');
      }
    } else {
      const errText = await slotsRes.text();
      console.log(`   ❌ Slots API returned ${slotsRes.status}: ${errText}`);
    }
  } catch (err) {
    console.log(`   ❌ Slots fetch failed: ${err.message}`);
  }
} else {
  console.log('\n4. Skipping API tests — no valid API key.\n');
}

console.log('\n=== Next Steps ===');
console.log('1. Set CALCOM_API_KEY on Vercel (Settings → Environment Variables)');
console.log('2. Set CALCOM_EVENT_TYPE_IDS on Vercel using the mapping above');
console.log('3. Redeploy and test a booking');
console.log('4. Check Vercel Function Logs for [requestId] messages\n');
