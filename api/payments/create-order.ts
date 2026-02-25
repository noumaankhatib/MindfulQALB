import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from '../_utils/cors.js';
import { validateSessionType, validateFormat } from '../_utils/validation.js';
import { rateLimiters } from '../_utils/rateLimit.js';
import { getSupabaseServer } from '../_utils/supabase.js';

// Dynamic import for Razorpay (CommonJS module)
const getRazorpay = async () => {
  const Razorpay = (await import('razorpay')).default;
  return Razorpay;
};

// Pricing configuration (server-side only - secure)
const PRICING: Record<string, Record<string, number>> = {
  individual: { chat: 499, audio: 899, video: 1299 },
  couples: { audio: 1499, video: 1999 },
  family: { audio: 1799, video: 2499 },
  free: { call: 0, chat: 0, audio: 0, video: 0 },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  const requestId = corsResult as string;
  
  // Rate limiting for payment endpoints
  if (rateLimiters.payment(req, res)) return;
  
  if (!validateMethod(req, res, ['POST'])) return;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(503).json({
      success: false,
      error: 'Payment service not configured',
    });
  }

  try {
    const body = req.body ?? {};
    const sessionType = body.sessionType;
    const format = body.format;
    const couponCode = body.couponCode ?? body.coupon_code ?? '';

    const sessionTypeResult = validateSessionType(sessionType);
    if (!sessionTypeResult.valid) {
      return res.status(400).json({ error: sessionTypeResult.error });
    }
    const formatResult = validateFormat(format);
    if (!formatResult.valid) {
      return res.status(400).json({ error: formatResult.error });
    }

    const therapyPricing = PRICING[sessionType];
    if (!therapyPricing) {
      return res.status(400).json({ error: 'Invalid session type for pricing' });
    }
    const amount = therapyPricing[format];
    if (amount === undefined) {
      return res.status(400).json({ error: 'Invalid format for this session type' });
    }

    if (amount === 0) {
      return res.json({
        success: true,
        orderId: `free_${Date.now()}`,
        amount: 0,
        currency: 'INR',
        keyId: keyId,
        isFree: true,
      });
    }

    let amountPaise = amount * 100;
    let couponMeta: { coupon_id: string; coupon_code: string; discount_paise: number } | null = null;
    const code = typeof couponCode === 'string' ? couponCode.trim().toUpperCase() : '';

    if (code) {
      const supabaseForCoupon = getSupabaseServer();
      if (!supabaseForCoupon) {
        return res.status(503).json({
          error: 'Coupon cannot be applied right now. Please try without the coupon or try again later.',
        });
      }
      const { data: coupon, error: couponErr } = await supabaseForCoupon
        .from('coupons')
        .select('id, code, discount_type, discount_value, min_amount_paise, valid_from, valid_until, max_uses, used_count, is_active')
        .ilike('code', code)
        .maybeSingle();

      if (couponErr) {
        return res.status(500).json({ error: 'Coupon could not be applied. Please remove the coupon and try again.' });
      }
      if (!coupon || !coupon.is_active) {
        return res.status(400).json({ error: 'Invalid or inactive coupon. Please remove it and try again.' });
      }

      const now = new Date();
      const validFrom = coupon.valid_from ? new Date(coupon.valid_from) : null;
      const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;
      const minPaise = Number(coupon.min_amount_paise) || 0;
      const maxReached = coupon.max_uses != null && (coupon.used_count ?? 0) >= coupon.max_uses;

      if (validFrom && validFrom > now) {
        return res.status(400).json({ error: 'This coupon is not yet valid.' });
      }
      if (validUntil && validUntil < now) {
        return res.status(400).json({ error: 'This coupon has expired. Please remove it and try again.' });
      }
      if (maxReached) {
        return res.status(400).json({ error: 'This coupon has reached its usage limit.' });
      }
      if (amountPaise < minPaise) {
        return res.status(400).json({
          error: minPaise > 0 ? `Minimum order amount is ₹${Math.round(minPaise / 100)} for this coupon.` : 'Invalid amount.',
        });
      }

      const discountValue = Number(coupon.discount_value) || 0;
      let discountPaise = 0;
      if (coupon.discount_type === 'percent') {
        const pct = Math.min(100, Math.max(0, discountValue));
        discountPaise = Math.floor((amountPaise * pct) / 100);
      } else {
        discountPaise = Math.min(amountPaise, Math.floor(discountValue * 100));
      }
      if (discountPaise > 0) {
        amountPaise = Math.max(0, amountPaise - discountPaise);
        couponMeta = { coupon_id: coupon.id, coupon_code: coupon.code, discount_paise: discountPaise };
      }
    }

    const Razorpay = await getRazorpay();
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { sessionType, format, ...(couponMeta && { coupon_code: couponMeta.coupon_code }) },
    });

    const supabase = getSupabaseServer();
    if (supabase) {
      const { error: insertErr } = await supabase.from('payments').insert({
        razorpay_order_id: order.id,
        amount_paise: amountPaise,
        currency: 'INR',
        status: 'pending',
        metadata: couponMeta ? { coupon_id: couponMeta.coupon_id, coupon_code: couponMeta.coupon_code, discount_paise: couponMeta.discount_paise } : {},
      });
      if (insertErr) console.error(`[${requestId}] Payment row insert failed:`, insertErr.message);
    }

    res.json({
      success: true,
      orderId: order.id,
      amount: amountPaise,
      currency: 'INR',
      keyId: keyId,
      ...(couponMeta && { discountPaise: couponMeta.discount_paise }),
    });
  } catch (error) {
    console.error(`[${requestId}] Create order error:`, error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order',
      requestId,
    });
  }
}
