import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from '../_utils/cors.js';
import { rateLimiters } from '../_utils/rateLimit.js';
import { getSupabaseServer } from '../_utils/supabase.js';

/**
 * POST /api/coupons/validate
 * Body: { code: string, amountPaise: number } — amountPaise is the order amount before discount (for min check and percent).
 * Returns: { valid: boolean, discountPaise?: number, message?: string, code?: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  if (!validateMethod(req, res, ['POST'])) return;
  if (rateLimiters.default(req, res)) return;

  const supabase = getSupabaseServer();
  if (!supabase) {
    return res.status(503).json({ valid: false, message: 'Service unavailable' });
  }

  const { code, amountPaise } = req.body ?? {};
  const rawCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
  const amount = typeof amountPaise === 'number' ? Math.max(0, Math.floor(amountPaise)) : 0;

  if (!rawCode) {
    return res.status(400).json({ valid: false, message: 'Coupon code is required' });
  }

  const { data: row, error } = await supabase
    .from('coupons')
    .select('id, code, discount_type, discount_value, min_amount_paise, valid_from, valid_until, max_uses, used_count, is_active')
    .ilike('code', rawCode)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ valid: false, message: 'Could not validate coupon' });
  }

  if (!row || !row.is_active) {
    return res.json({ valid: false, message: 'Invalid or inactive coupon code' });
  }

  const now = new Date();
  if (row.valid_from && new Date(row.valid_from) > now) {
    return res.json({ valid: false, message: 'This coupon is not yet valid' });
  }
  if (row.valid_until && new Date(row.valid_until) < now) {
    return res.json({ valid: false, message: 'This coupon has expired' });
  }

  if (row.max_uses != null && (row.used_count ?? 0) >= row.max_uses) {
    return res.json({ valid: false, message: 'This coupon has reached its usage limit' });
  }

  const minPaise = Number(row.min_amount_paise) || 0;
  if (amount < minPaise) {
    return res.json({
      valid: false,
      message: minPaise > 0 ? `Minimum order amount is ₹${Math.round(minPaise / 100)} for this coupon` : 'Invalid amount',
    });
  }

  const discountValue = Number(row.discount_value) || 0;
  let discountPaise = 0;
  if (row.discount_type === 'percent') {
    const pct = Math.min(100, Math.max(0, discountValue));
    discountPaise = Math.floor((amount * pct) / 100);
  } else {
    discountPaise = Math.min(amount, Math.floor(discountValue * 100));
  }

  if (discountPaise <= 0) {
    return res.json({ valid: false, message: 'No discount applies to this order' });
  }

  return res.json({
    valid: true,
    discountPaise,
    code: row.code,
    couponId: row.id,
  });
}
