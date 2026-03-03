#!/usr/bin/env node
/**
 * Test that /api/profile exists and returns 401 without a valid token (expected).
 * Usage: node scripts/test-profile-api.js [base_url]
 */
const base = process.argv[2] || 'http://localhost:3000';

async function main() {
  const url = `${base.replace(/\/$/, '')}/api/profile`;
  console.log('Testing', url);
  try {
    const res = await fetch(url, {
      headers: { Authorization: 'Bearer invalid-token' },
    });
    console.log('Status:', res.status, res.statusText);
    const text = await res.text();
    if (res.headers.get('content-type')?.includes('json')) {
      const data = JSON.parse(text);
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('Response (first 150 chars):', text.slice(0, 150));
    }
    if (res.status === 401) {
      console.log('\n✓ /api/profile exists and correctly rejects invalid token.');
      process.exit(0);
    }
    if (res.status === 404 || text.includes('<!doctype html>')) {
      console.log('\n✗ /api/profile not found. Deploy the latest code with api/profile.ts');
      process.exit(1);
    }
    process.exit(res.status >= 400 ? 1 : 0);
  } catch (err) {
    console.error('✗ Request failed:', err.message);
    process.exit(1);
  }
}

main();
