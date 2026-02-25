/**
 * Require that the request is from an authenticated user with profile.role === 'admin'.
 * Expects Authorization: Bearer <access_token> (Supabase session access_token).
 */
import type { VercelRequest } from '@vercel/node';
import { getSupabaseServer } from './supabase.js';

export interface AdminCaller {
  userId: string;
  email?: string;
}

export async function requireAdmin(req: VercelRequest): Promise<{ ok: true; caller: AdminCaller } | { ok: false; status: number; body: { error: string } }> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { ok: false, status: 503, body: { error: 'Server configuration error' } };
  }

  const authHeader = req.headers.authorization;
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) {
    return { ok: false, status: 401, body: { error: 'Missing or invalid Authorization header. Use Bearer <access_token>.' } };
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return { ok: false, status: 401, body: { error: 'Invalid or expired token' } };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return { ok: false, status: 403, body: { error: 'Admin access required' } };
  }

  return {
    ok: true,
    caller: { userId: user.id, email: user.email },
  };
}
