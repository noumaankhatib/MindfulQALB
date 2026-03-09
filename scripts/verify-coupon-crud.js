#!/usr/bin/env node
/**
 * Verify coupon validate API and document Admin CRUD checks.
 * Run from project root. Start the API first: npm run dev:api
 * Usage: node scripts/verify-coupon-crud.js [baseUrl]
 * Default baseUrl: http://localhost:3001
 */
const baseUrl = process.argv[2] || 'http://localhost:3001';

async function main() {
  console.log('Coupon CRUD verification\n');
  console.log('1. Testing POST /api/coupons/validate (expect valid: false for unknown code)...');

  try {
    const res = await fetch(`${baseUrl}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'VERIFY_TEST_XYZ', amountPaise: 50000 }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.status === 503) {
      console.log('   → 503 Service Unavailable (Supabase not configured). Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in backend/.env');
      process.exitCode = 1;
    } else if (res.status === 500) {
      console.log('   → 500 Server error:', data.message || res.statusText);
      console.log('   → If "does not exist", run docs/supabase-coupons-migration.sql in Supabase SQL Editor.');
      process.exitCode = 1;
    } else if (res.status === 200 && data.valid === false) {
      console.log('   → 200 OK, valid: false (unknown code). Validate API and coupons table are working.');
    } else if (res.status === 200 && data.valid === true) {
      console.log('   → 200 OK, valid: true (code VERIFY_TEST_XYZ exists!). Validate API working.');
    } else {
      console.log('   → Unexpected:', res.status, data);
      process.exitCode = 1;
    }
  } catch (e) {
    console.log('   → Request failed:', e.message);
    console.log('   → Start the API first: npm run dev:api');
    process.exitCode = 1;
  }

  console.log('\n2. Admin CRUD (manual check in browser)');
  console.log('   - Log in as admin → Admin → Coupons tab.');
  console.log('   - Create: Add coupon (e.g. code WELCOME10, 10% discount). Save.');
  console.log('   - Read: List shows the new coupon.');
  console.log('   - Update: Edit coupon, change value, Save.');
  console.log('   - Toggle: Activate/Deactivate.');
  console.log('   - Delete: Delete one or select several and Delete selected.');
  console.log('   If "Could not load coupons" or RLS errors, run docs/supabase-coupons-migration.sql and set profiles.role = \'admin\' for your user.');
  console.log('');
}

main();
