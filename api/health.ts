import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from './_utils/cors.js';
import { rateLimiters } from './_utils/rateLimit.js';
import { getSupabaseServer } from './_utils/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  const requestId = corsResult as string;

  if (rateLimiters.default(req, res)) return;

  // Route: GET /api/health?action=profile → fetch current user's profile (bypasses RLS).
  if (req.query.action === 'profile') {
    if (!validateMethod(req, res, ['GET'])) return;
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

  if (!validateMethod(req, res, ['GET'])) return;

  const isProduction = process.env.NODE_ENV === 'production';

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    requestId,
    ...(isProduction ? {} : {
      services: {
        calcom: !!process.env.CALCOM_API_KEY ? 'configured' : 'not configured',
        razorpay: !!process.env.RAZORPAY_KEY_ID ? 'configured' : 'not configured',
        supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) ? 'configured' : 'not configured',
      },
    }),
  });
}
