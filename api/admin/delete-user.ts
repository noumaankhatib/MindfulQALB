import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from '../_utils/cors.js';
import { rateLimiters } from '../_utils/rateLimit.js';
import { getSupabaseServer } from '../_utils/supabase.js';
import { requireAdmin } from '../_utils/adminAuth.js';

/**
 * Delete a user and all related data: payments (where user_id or booking belongs to user),
 * bookings, consent_records, then auth user (profile cascades).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  if (!validateMethod(req, res, ['POST', 'DELETE'])) return;
  if (rateLimiters.default(req, res)) return;

  const adminResult = await requireAdmin(req);
  if (!adminResult.ok) {
    return res.status(adminResult.status).json(adminResult.body);
  }

  const supabase = getSupabaseServer();
  if (!supabase) return res.status(503).json({ error: 'Server configuration error' });

  const { userId } = req.body ?? {};
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' });
  }

  // Prevent deleting self
  if (userId === adminResult.caller.userId) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }

  // Prevent deleting the last admin
  const { data: targetProfile } = await supabase.from('profiles').select('role').eq('id', userId).single();
  if (targetProfile?.role === 'admin') {
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
    if ((admins?.length ?? 0) <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin' });
    }
  }

  // 1) Get booking IDs for this user (to delete payments linked to those bookings)
  const { data: userBookings } = await supabase.from('bookings').select('id').eq('user_id', userId);
  const bookingIds = (userBookings ?? []).map((b) => b.id);

  // 2) Delete payments: where user_id = userId OR booking_id in user's bookings
  if (bookingIds.length > 0) {
    await supabase.from('payments').delete().in('booking_id', bookingIds);
  }
  await supabase.from('payments').delete().eq('user_id', userId);

  // 3) Delete bookings for this user
  await supabase.from('bookings').delete().eq('user_id', userId);

  // 4) Delete consent records for this user
  await supabase.from('consent_records').delete().eq('user_id', userId);

  // 5) Delete auth user (profile is ON DELETE CASCADE from auth.users, so it will be removed)
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) {
    return res.status(500).json({
      error: authError.message || 'Failed to delete user from auth. Related data may have been removed.',
    });
  }

  return res.json({ success: true, message: 'User and all related data deleted' });
}
