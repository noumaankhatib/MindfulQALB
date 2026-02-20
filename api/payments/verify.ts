import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { handleCorsPrelight, validateMethod } from '../_utils/cors.js';
import { rateLimiters } from '../_utils/rateLimit.js';
import { getSupabaseServer } from '../_utils/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  const requestId = corsResult as string;
  
  // Strict rate limiting for payment verification
  if (rateLimiters.strict(req, res)) return;
  
  if (!validateMethod(req, res, ['POST'])) return;

  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return res.status(503).json({
      success: false,
      error: 'Payment service not configured',
    });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate required fields
    if (!razorpay_order_id || typeof razorpay_order_id !== 'string') {
      return res.status(400).json({ error: 'Order ID is required' });
    }
    if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string') {
      return res.status(400).json({ error: 'Payment ID is required' });
    }
    if (!razorpay_signature || typeof razorpay_signature !== 'string') {
      return res.status(400).json({ error: 'Signature is required' });
    }

    // Validate format (basic sanity check)
    if (!razorpay_order_id.startsWith('order_')) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    if (!razorpay_payment_id.startsWith('pay_')) {
      return res.status(400).json({ error: 'Invalid payment ID format' });
    }

    // Verify signature using HMAC SHA256 (constant-time comparison)
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    // timingSafeEqual throws if lengths differ; ensure same length to avoid throw + info leak
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const actualBuf = Buffer.from(razorpay_signature, 'utf8');
    const isValid =
      expectedBuf.length === actualBuf.length &&
      crypto.timingSafeEqual(expectedBuf, actualBuf);

    if (isValid) {
      const supabase = getSupabaseServer();
      if (supabase) {
        const { error: updateErr } = await supabase
          .from('payments')
          .update({
            razorpay_payment_id,
            razorpay_signature: razorpay_signature || null,
            status: 'paid',
            paid_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', razorpay_order_id);
        if (updateErr) console.warn('Payment update failed:', updateErr.message);
      }
      res.json({
        success: true,
        verified: true,
        paymentId: razorpay_payment_id,
      });
    } else {
      // Log failed verification attempt (potential fraud) - truncate sensitive data
      console.warn(`[${requestId}] Payment verification failed:`, {
        orderIdPrefix: razorpay_order_id.substring(0, 12) + '***',
        timestamp: new Date().toISOString(),
      });
      
      res.status(400).json({
        success: false,
        verified: false,
        error: 'Invalid payment signature',
        requestId,
      });
    }
  } catch (error) {
    console.error(`[${requestId}] Verify payment error:`, error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({
      success: false,
      error: 'Payment verification failed',
      requestId,
    });
  }
}
