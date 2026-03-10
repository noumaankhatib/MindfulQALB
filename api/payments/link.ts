import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from '../_utils/cors.js';
import { rateLimiters } from '../_utils/rateLimit.js';
import { getSupabaseServer } from '../_utils/supabase.js';
import { requireAuth } from '../_utils/adminAuth.js';

/**
 * Link a payment (by razorpay_order_id) to a booking.
 * Requires authentication; verifies the booking belongs to the caller.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  if (!validateMethod(req, res, ['POST'])) return;
  if (rateLimiters.payment(req, res)) return;

  const authResult = await requireAuth(req);
  if (!authResult.ok) {
    return res.status(authResult.status).json(authResult.body);
  }

  const { razorpay_order_id, booking_id } = req.body ?? {};
  if (!razorpay_order_id || typeof razorpay_order_id !== 'string') {
    return res.status(400).json({ error: 'razorpay_order_id is required' });
  }
  if (!booking_id || typeof booking_id !== 'string') {
    return res.status(400).json({ error: 'booking_id is required' });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  // Verify the booking belongs to the authenticated user
  const { data: booking } = await supabase
    .from('bookings')
    .select('user_id')
    .eq('id', booking_id)
    .single();

  if (!booking || booking.user_id !== authResult.caller.userId) {
    return res.status(403).json({ error: 'You can only link payments to your own bookings' });
  }

  const { error } = await supabase
    .from('payments')
    .update({ booking_id })
    .eq('razorpay_order_id', razorpay_order_id)
    .eq('status', 'paid');

  if (error) {
    console.error('Payment link failed:', error.message);
    return res.status(500).json({ error: 'Failed to link payment to booking' });
  }
  res.json({ success: true });
}
