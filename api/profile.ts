/**
 * Fetches the current user's profile using the service role (bypasses RLS).
 * Use when client-side profile fetch fails (e.g. CORS, proxy, RLS).
 * Requires Authorization: Bearer <access_token>.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServer } from './_utils/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return res.status(503).json({ error: 'Server configuration error' });
  }

  const authHeader = req.headers.authorization;
  const token =
    typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization: Bearer <access_token>' });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return res.status(profileError.code === 'PGRST116' ? 404 : 500).json({
      error: profileError.message,
    });
  }

  return res.status(200).json(profile);
}
