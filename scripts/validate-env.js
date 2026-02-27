#!/usr/bin/env node
/**
 * Validate root .env and backend/.env. Report errors and warnings.
 * Run from project root: node scripts/validate-env.js
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv(filePath) {
  const env = {};
  if (!existsSync(filePath)) return env;
  const content = readFileSync(filePath, 'utf8');
  const seen = new Set();
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) {
      const key = m[1];
      const raw = m[2].trim();
      const val = raw.replace(/^["']|["']$/g, '').trim();
      if (seen.has(key)) {
        env[`__duplicate_${key}`] = { key, error: 'Duplicate key' };
      }
      seen.add(key);
      env[key] = val;
    }
  }
  return env;
}

const rootEnv = loadEnv(resolve(root, '.env'));
const backendEnv = loadEnv(resolve(root, 'backend', '.env'));

const errors = [];
const warnings = [];

const rootRules = [
  {
    key: 'VITE_SUPABASE_URL',
    required: true,
    placeholder: /your-project|placeholder\.supabase\.co|^https:\/\/xxxx/i,
    format: (v) => v.startsWith('https://') && (v.includes('supabase') || v.includes('.co')),
    formatMsg: 'Should be your Supabase project URL (https://....supabase.co)',
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    required: true,
    placeholder: /your-anon-key|placeholder-key|^undefined$/i,
    format: (v) => v.length >= 50 && (v.startsWith('eyJ') || v.length > 30),
    formatMsg: 'Should be a long JWT (starts with eyJ...)',
  },
  {
    key: 'VITE_GOOGLE_CLIENT_ID',
    required: false,
    placeholder: /^xxxx\.apps\.googleusercontent\.com$/i,
    format: (v) => /\.apps\.googleusercontent\.com$/i.test(v),
    formatMsg: 'Should end with .apps.googleusercontent.com',
  },
  {
    key: 'VITE_SUPABASE_USE_DIRECT',
    required: false,
    format: (v) => /^true$|^false$|^$/i.test(v),
    formatMsg: 'Should be true or false',
  },
  { key: 'VITE_BACKEND_URL', required: false },
  { key: 'VITE_USE_BACKEND_API', required: false },
];

const backendRules = [
  {
    key: 'SUPABASE_URL',
    required: false,
    format: (v) => !v || /^https:\/\/.+\.supabase\.co\/?$/i.test(v),
    formatMsg: 'Should be https://your-project.supabase.co',
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    required: false,
    placeholder: /your-service-role-key|placeholder/i,
    format: (v) => !v || v.length >= 50,
    formatMsg: 'Should be a long JWT',
  },
];

function check(env, rules, source) {
  for (const r of rules) {
    const val = env[r.key] ?? '';
    if (r.required && !val) {
      errors.push(`[${source}] Missing required: ${r.key}`);
      continue;
    }
    if (!val) continue;
    if (r.placeholder && r.placeholder.test(val)) {
      errors.push(`[${source}] Placeholder/invalid value: ${r.key} (replace with real value)`);
      continue;
    }
    if (r.format && !r.format(val)) {
      warnings.push(`[${source}] ${r.key}: ${r.formatMsg}`);
    }
  }
  for (const k of Object.keys(env)) {
    if (k.startsWith('__duplicate_')) {
      const { key } = env[k];
      errors.push(`[${source}] Duplicate key: ${key}`);
    }
  }
}

check(rootEnv, rootRules, 'root .env');
check(backendEnv, backendRules, 'backend/.env');

const rootUrl = rootEnv.VITE_SUPABASE_URL || '';
const backendUrl = backendEnv.SUPABASE_URL || '';
if (rootUrl && backendUrl && rootUrl.replace(/\/$/, '') !== backendUrl.replace(/\/$/, '')) {
  warnings.push('root VITE_SUPABASE_URL and backend SUPABASE_URL should be the same');
}

console.log('--- .env validation ---\n');
if (errors.length) {
  console.error('Errors:');
  errors.forEach((e) => console.error('  ✗', e));
  console.error('');
}
if (warnings.length) {
  console.warn('Warnings:');
  warnings.forEach((w) => console.warn('  ⚠', w));
  console.warn('');
}
if (errors.length === 0 && warnings.length === 0) {
  console.log('No issues found.');
} else if (errors.length === 0) {
  console.log('Validation passed with warnings (see above).');
} else {
  console.error('Fix errors above. See docs/ENV_VARIABLES.md and docs/LOCAL_SETUP.md.');
  process.exit(1);
}
process.exit(0);
