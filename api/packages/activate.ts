/**
 * POST /api/packages/activate
 *
 * Called after successful Razorpay payment verification.
 * Verifies the HMAC signature, marks the session_packages row active,
 * sets valid_until = today + 6 months, and records payment details.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { handleCorsPrelight, validateMethod } from '../_utils/cors.js';
import { rateLimiters } from '../_utils/rateLimit.js';
import { getSupabaseServer } from '../_utils/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  const requestId = corsResult as string;

  if (rateLimiters.strict(req, res)) return;
  if (!validateMethod(req, res, ['POST'])) return;

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(503).json({ success: false, error: 'Payment service not configured' });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      packageRecordId,
    } = req.body ?? {};

    // Validate fields
    if (!razorpay_order_id || typeof razorpay_order_id !== 'string' || !razorpay_order_id.startsWith('order_')) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string' || !razorpay_payment_id.startsWith('pay_')) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }
    if (!razorpay_signature || typeof razorpay_signature !== 'string') {
      return res.status(400).json({ error: 'Signature is required' });
    }
    if (!packageRecordId || typeof packageRecordId !== 'string') {
      return res.status(400).json({ error: 'packageRecordId is required' });
    }

    // Verify HMAC signature
    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const expBuf = Buffer.from(expected, 'utf8');
    const actBuf = Buffer.from(razorpay_signature, 'utf8');
    const isValid = expBuf.length === actBuf.length && crypto.timingSafeEqual(expBuf, actBuf);

    if (!isValid) {
      console.warn(`[${requestId}] Package activate: invalid signature for order ${razorpay_order_id.substring(0, 12)}***`);
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    const supabase = getSupabaseServer();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    // Compute valid_until = 6 months from today
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 6);
    const validUntilStr = validUntil.toISOString().split('T')[0];

    // Verify the package record exists and belongs to this order
    const { data: pkg, error: fetchErr } = await supabase
      .from('session_packages')
      .select('id, status, razorpay_order_id')
      .eq('id', packageRecordId)
      .maybeSingle();

    if (fetchErr || !pkg) {
      return res.status(404).json({ success: false, error: 'Package record not found' });
    }
    if (pkg.razorpay_order_id !== razorpay_order_id) {
      return res.status(400).json({ success: false, error: 'Order ID mismatch' });
    }
    if (pkg.status === 'active') {
      // Already activated (idempotent)
      return res.json({ success: true, alreadyActive: true });
    }
    if (pkg.status !== 'pending_payment') {
      return res.status(400).json({ success: false, error: `Cannot activate package in status: ${pkg.status}` });
    }

    const { error: updateErr } = await supabase
      .from('session_packages')
      .update({
        status: 'active',
        razorpay_payment_id,
        razorpay_signature,
        valid_until: validUntilStr,
      })
      .eq('id', packageRecordId);

    if (updateErr) {
      console.error(`[${requestId}] Package activate update failed:`, updateErr.message);
      return res.status(500).json({ success: false, error: 'Failed to activate package' });
    }

    // Also update the payments table row that was created by create-order (if any)
    await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id);

    return res.json({
      success: true,
      activated: true,
      validUntil: validUntilStr,
      packageRecordId,
    });
  } catch (error) {
    console.error(`[${requestId}] Package activate error:`, error instanceof Error ? error.message : 'Unknown');
    return res.status(500).json({ success: false, error: 'Failed to activate package', requestId });
  }
}
