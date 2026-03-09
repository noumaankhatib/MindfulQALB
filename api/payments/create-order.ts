import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from '../_utils/cors.js';
import { validateSessionType, validateFormat } from '../_utils/validation.js';
import { rateLimiters } from '../_utils/rateLimit.js';
import { getSupabaseServer } from '../_utils/supabase.js';

const getRazorpay = async () => {
  const Razorpay = (await import('razorpay')).default;
  return Razorpay;
};

// Pricing in major currency units (INR for India, USD for international)
const PRICING_INR: Record<string, Record<string, number>> = {
  individual: { chat: 499, audio: 899, video: 1299 },
  couples: { audio: 1499, video: 1999 },
  family: { audio: 1799, video: 2499 },
  free: { call: 0, chat: 0, audio: 0, video: 0 },
};

const PRICING_USD: Record<string, Record<string, number>> = {
  individual: { chat: 6, audio: 11, video: 16 },
  couples: { audio: 18, video: 24 },
  family: { audio: 21, video: 30 },
  free: { call: 0, chat: 0, audio: 0, video: 0 },
};

const ALLOWED_CURRENCIES = ['INR', 'USD'] as const;
type Currency = (typeof ALLOWED_CURRENCIES)[number];

/** Approximate INR per 1 USD for fixed-value coupon discount on USD orders (coupons stored in INR). */
const APPROX_INR_PER_USD = 83;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  const requestId = corsResult as string;

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
    const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
    const customerEmail = typeof body.customerEmail === 'string' ? body.customerEmail.trim().toLowerCase() : '';
    const customerPhone = typeof body.customerPhone === 'string' ? body.customerPhone.trim() : '';

    // Currency: default INR, accept USD for international clients
    const rawCurrency = typeof body.currency === 'string' ? body.currency.toUpperCase() : 'INR';
    const currency: Currency = ALLOWED_CURRENCIES.includes(rawCurrency as Currency) ? (rawCurrency as Currency) : 'INR';
    const isInternational = currency === 'USD';
    const pricingTable = isInternational ? PRICING_USD : PRICING_INR;
    const currencySymbol = isInternational ? '$' : '₹';

    const sessionTypeResult = validateSessionType(sessionType);
    if (!sessionTypeResult.valid) {
      return res.status(400).json({ error: sessionTypeResult.error });
    }
    const formatResult = validateFormat(format);
    if (!formatResult.valid) {
      return res.status(400).json({ error: formatResult.error });
    }

    const therapyPricing = pricingTable[sessionType];
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
        currency,
        keyId: keyId,
        isFree: true,
      });
    }

    // Convert to smallest unit (paise for INR, cents for USD)
    let amountSmallest = amount * 100;
    let couponMeta: { coupon_id: string; coupon_code: string; discount_amount: number } | null = null;
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
      const minSmallest = Number(coupon.min_amount_paise) || 0;
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
      // For international orders, skip min-amount check (coupons are INR-denominated)
      if (!isInternational && amountSmallest < minSmallest) {
        return res.status(400).json({
          error: minSmallest > 0 ? `Minimum order amount is ${currencySymbol}${Math.round(minSmallest / 100)} for this coupon.` : 'Invalid amount.',
        });
      }

      const discountValue = Number(coupon.discount_value) || 0;
      let discountSmallest = 0;
      if (coupon.discount_type === 'percent') {
        const pct = Math.min(100, Math.max(0, discountValue));
        discountSmallest = Math.floor((amountSmallest * pct) / 100);
      } else {
        const fixedSmallest = isInternational
          ? Math.floor((discountValue * 100) / APPROX_INR_PER_USD)
          : Math.floor(discountValue * 100);
        discountSmallest = Math.min(amountSmallest, fixedSmallest);
      }
      if (discountSmallest > 0) {
        amountSmallest = Math.max(0, amountSmallest - discountSmallest);
        couponMeta = { coupon_id: coupon.id, coupon_code: coupon.code, discount_amount: discountSmallest };
      }
    }

    const Razorpay = await getRazorpay();
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amountSmallest,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: { sessionType, format, currency, ...(couponMeta && { coupon_code: couponMeta.coupon_code }) },
    });

    const supabase = getSupabaseServer();
    if (supabase) {
      const meta: Record<string, unknown> = {};
      if (couponMeta) {
        meta.coupon_id = couponMeta.coupon_id;
        meta.coupon_code = couponMeta.coupon_code;
        meta.discount_amount = couponMeta.discount_amount;
      }
      if (customerName) meta.customer_name = customerName;
      if (customerEmail) meta.customer_email = customerEmail;
      if (customerPhone) meta.customer_phone = customerPhone;

      const { error: insertErr } = await supabase.from('payments').insert({
        razorpay_order_id: order.id,
        amount_paise: amountSmallest,
        currency,
        status: 'pending',
        metadata: meta,
      });
      if (insertErr) console.error(`[${requestId}] Payment row insert failed:`, insertErr.message);
    }

    res.json({
      success: true,
      orderId: order.id,
      amount: amountSmallest,
      currency,
      keyId: keyId,
      ...(couponMeta && { discountPaise: couponMeta.discount_amount }),
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
