import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from '../_utils/cors.js';
import { rateLimiters } from '../_utils/rateLimit.js';
import { getSupabaseServer } from '../_utils/supabase.js';
import { requireAdmin } from '../_utils/adminAuth.js';

const ROLE_VALUES = ['user', 'admin', 'therapist'] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  if (!validateMethod(req, res, ['PATCH', 'PUT'])) return;
  if (rateLimiters.default(req, res)) return;

  const adminResult = await requireAdmin(req);
  if (!adminResult.ok) {
    return res.status(adminResult.status).json(adminResult.body);
  }

  const supabase = getSupabaseServer();
  if (!supabase) return res.status(503).json({ error: 'Server configuration error' });

  const { userId, full_name, phone, role, email } = req.body ?? {};
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' });
  }

  // Prevent demoting the last admin (self or others)
  if (role && ROLE_VALUES.includes(role as (typeof ROLE_VALUES)[number])) {
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
    const adminCount = admins?.length ?? 0;
    const targetIsAdmin = (await supabase.from('profiles').select('role').eq('id', userId).single()).data?.role === 'admin';
    if (targetIsAdmin && role !== 'admin' && adminCount <= 1) {
      return res.status(400).json({ error: 'Cannot remove the last admin. Assign another admin first.' });
    }
  }

  const profileUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (full_name !== undefined) profileUpdates.full_name = full_name === '' ? null : String(full_name);
  if (phone !== undefined) profileUpdates.phone = phone === '' ? null : String(phone);
  if (role !== undefined) {
    if (!ROLE_VALUES.includes(role as (typeof ROLE_VALUES)[number])) {
      return res.status(400).json({ error: 'role must be user, admin, or therapist' });
    }
    profileUpdates.role = role;
  }
  if (email !== undefined && email !== null && String(email).trim()) {
    profileUpdates.email = String(email).toLowerCase().trim();
  }

  if (Object.keys(profileUpdates).length <= 1) {
    return res.status(400).json({ error: 'Provide at least one of: full_name, phone, role, email' });
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update(profileUpdates)
    .eq('id', userId);

  if (profileError) {
    return res.status(500).json({ error: profileError.message || 'Failed to update profile' });
  }

  // If email was updated, sync to auth.users (requires Admin API)
  if (profileUpdates.email) {
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      email: profileUpdates.email as string,
    });
    if (authError) {
      // Profile was already updated; log and return success with a note
      console.error('Auth email update failed (profile updated):', authError.message);
      return res.json({
        success: true,
        message: 'Profile updated; auth email could not be changed (may require re-verification).',
      });
    }
  }

  return res.json({ success: true, message: 'User updated successfully' });
}
