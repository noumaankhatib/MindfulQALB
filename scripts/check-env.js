#!/usr/bin/env node
/**
 * Pre-deploy env check for MindfulQALB (Step 2 of go-live checklist).
 * Run from project root: node scripts/check-env.js
 * Exits 0 if OK, 1 if critical vars are missing or still placeholders.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, '.env');

const required = [
  { key: 'VITE_SUPABASE_URL', placeholder: /your-project|placeholder\.supabase\.co/i },
  { key: 'VITE_SUPABASE_ANON_KEY', placeholder: /your-anon-key|placeholder-key/i },
];
const optionalServer = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RAZORPAY_KEY_ID', 'CALCOM_API_KEY'];

function loadEnv() {
  const env = {};
  if (!existsSync(envPath)) return env;
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return env;
}

const env = loadEnv();
let failed = false;

for (const { key, placeholder } of required) {
  const val = env[key] || process.env[key] || '';
  if (!val) {
    console.error(`Missing: ${key} (required for auth / Google login)`);
    failed = true;
  } else if (placeholder.test(val)) {
    console.error(`Placeholder detected: ${key} – set a real value before deploy`);
    failed = true;
  }
}

for (const key of optionalServer) {
  const val = env[key] || process.env[key] || '';
  if (!val && (key === 'SUPABASE_URL' || key === 'SUPABASE_SERVICE_ROLE_KEY')) {
    console.warn(`Warning: ${key} not set – bookings/consent/payments won't persist to DB`);
  }
}

if (failed) {
  console.error('\nFix the above and set vars in Vercel → Settings → Environment Variables, then redeploy.');
  process.exit(1);
}
console.log('Env check passed. Required frontend vars are set.');
process.exit(0);
