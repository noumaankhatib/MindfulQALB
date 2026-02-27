/**
 * Supabase auth/rest proxy for Vercel.
 * Forwards /sb/* to Supabase so auth works in regions where *.supabase.co is blocked.
 * Request body and headers are forwarded; avoids rewrite body-forwarding issues.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

const FORWARD_HEADERS = [
  'content-type',
  'authorization',
  'apikey',
  'x-client-info',
  'accept',
];

function buildSupabaseUrl(path: string, query: Record<string, string | string[] | undefined>): string {
  const pathPart = (path || '').replace(/^\//, '').trim() || 'auth/v1/health';
  const base = `${SUPABASE_URL}/${pathPart}`;
  const q = { ...query };
  delete q.path;
  const keys = Object.keys(q).filter((k) => q[k] !== undefined && q[k] !== '');
  if (keys.length === 0) return base;
  const params = new URLSearchParams();
  keys.forEach((k) => {
    const v = q[k];
    if (Array.isArray(v)) v.forEach((vv) => params.append(k, vv));
    else if (v != null) params.append(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!SUPABASE_URL) {
    return res.status(500).json({ error: 'Supabase proxy not configured' });
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, x-client-info');
    return res.status(200).end();
  }

  const rawPath = req.query.path;
  const path = typeof rawPath === 'string' ? decodeURIComponent(rawPath) : (Array.isArray(rawPath) ? rawPath[0] : '') || 'auth/v1/health';
  const url = buildSupabaseUrl(path, req.query as Record<string, string | string[] | undefined>);

  const headers: Record<string, string> = {};
  FORWARD_HEADERS.forEach((h) => {
    const v = req.headers[h];
    if (v && typeof v === 'string') headers[h] = v;
    else if (Array.isArray(v) && v[0]) headers[h] = v[0];
  });
  if (SUPABASE_ANON_KEY && !headers['apikey']) headers['apikey'] = SUPABASE_ANON_KEY;
  if (!headers['content-type'] && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
    headers['content-type'] = 'application/json';
  }

  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body !== undefined) {
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const upstream = await fetch(url, {
      method: req.method || 'GET',
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const contentType = upstream.headers.get('content-type') || '';
    const responseBody = await upstream.text();

    res.status(upstream.status);
    if (contentType) res.setHeader('content-type', contentType);
    const cacheControl = upstream.headers.get('cache-control');
    if (cacheControl) res.setHeader('cache-control', cacheControl);

    if (responseBody) {
      if (contentType.includes('application/json')) {
        try {
          res.json(JSON.parse(responseBody));
        } catch {
          res.end(responseBody);
        }
      } else {
        res.end(responseBody);
      }
    } else {
      res.end();
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upstream request failed';
    console.error('[sb-proxy]', path, msg);
    const hint = /timeout|abort|fetch failed|ECONNREFUSED|ENOTFOUND/i.test(msg)
      ? 'Supabase unreachable from server. Check SUPABASE_URL and status.supabase.com'
      : undefined;
    res.status(502).json({
      error: 'Supabase proxy error',
      message: msg,
      ...(hint ? { hint } : {}),
    });
  }
}
