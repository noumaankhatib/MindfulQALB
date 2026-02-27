#!/usr/bin/env node
/**
 * Quick test that /sb proxy is reachable (local or deployed).
 * Usage:
 *   node scripts/test-sb-proxy.js                    # test localhost:5173
 *   node scripts/test-sb-proxy.js https://your-site.com  # test deployed
 */
const base = process.argv[2] || 'http://localhost:5173';
const url = `${base.replace(/\/$/, '')}/sb/auth/v1/health`;

async function main() {
  console.log('Testing /sb proxy at:', url);
  try {
    const res = await fetch(url, { method: 'GET' });
    const status = res.status;
    const text = await res.text();
    console.log('Status:', status, res.statusText);
    if (text) console.log('Body:', text.slice(0, 200));
    if (status >= 200 && status < 500) {
      console.log('\n✓ Proxy is reachable. Auth requests should go through /sb.');
      process.exit(0);
    }
    console.log('\n✗ Unexpected status. Check proxy config and env (SUPABASE_URL on Vercel).');
    process.exit(1);
  } catch (err) {
    console.error('✗ Request failed:', err.message);
    if (base.includes('localhost')) console.log('  Make sure the dev server is running: npm run dev');
    process.exit(1);
  }
}

main();
