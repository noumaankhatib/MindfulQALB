/**
 * GET /api/packages?email=...&userId=...
 *
 * Returns the caller's session packages. Authenticated by email + userId match.
 * Admin can also fetch by email without userId restriction.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from '../_utils/cors.js';
import { getSupabaseServer } from '../_utils/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;

  if (!validateMethod(req, res, ['GET'])) return;

  const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';
  const userId = typeof req.query.userId === 'string' ? req.query.userId.trim() : '';

  if (!email && !userId) {
    return res.status(400).json({ error: 'email or userId is required' });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    let query = supabase
      .from('session_packages')
      .select('id, package_id, package_title, session_type, session_format, duration_minutes, total_sessions, sessions_used, sessions_remaining, status, valid_until, amount_paid_paise, currency, created_at')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('customer_email', email);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch packages' });
    }

    return res.json({ success: true, packages: data ?? [] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch packages' });
  }
}
