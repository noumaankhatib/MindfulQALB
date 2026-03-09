import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from '../_utils/cors.js';
import { rateLimiters } from '../_utils/rateLimit.js';
import { getSupabaseServer } from '../_utils/supabase.js';
import { requireAdmin } from '../_utils/adminAuth.js';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET?.trim();
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function parseTimeToMinutes(scheduledTime: string): number | null {
  const s = String(scheduledTime).trim();
  const match = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = (match[3] || '').toUpperCase();
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function getSessionStartUtc(scheduledDate: string, scheduledTime: string): Date | null {
  const minutesFromMidnight = parseTimeToMinutes(scheduledTime);
  if (minutesFromMidnight === null) return null;
  const [y, m, d] = scheduledDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  const istOffsetMinutes = 5 * 60 + 30;
  const utcMinutesFromMidnight = minutesFromMidnight - istOffsetMinutes;
  const utcMs = Date.UTC(y, m - 1, d, 0, 0, 0, 0) + utcMinutesFromMidnight * 60 * 1000;
  const date = new Date(utcMs);
  return isNaN(date.getTime()) ? null : date;
}

/** Refund policy: 24+ hours before session = full; less = 50%. */
function getRefundAmount(amount: number, sessionStartUtc: Date | null): number {
  if (!sessionStartUtc) return amount;
  const now = Date.now();
  const diff = sessionStartUtc.getTime() - now;
  if (diff >= TWENTY_FOUR_HOURS_MS) return amount;
  return Math.floor(amount / 2);
}

interface PaymentRow {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  booking_id: string | null;
  amount_paise: number;
  currency: string;
  status: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const corsResult = handleCorsPrelight(req, res);
    if (corsResult === true) return;
    if (!validateMethod(req, res, ['POST'])) return;
    if (rateLimiters.payment(req, res)) return;

    const adminResult = await requireAdmin(req);
    if (!adminResult.ok) {
      return res.status(adminResult.status).json(adminResult.body);
    }

    const { booking_id: bookingId, razorpay_payment_id: paymentId } = req.body ?? {};
    if (!bookingId && !paymentId) {
      return res.status(400).json({ error: 'Provide booking_id or razorpay_payment_id' });
    }

    const supabase = getSupabaseServer();
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    let payment: PaymentRow | null = null;
    let sessionStartUtc: Date | null = null;

    if (bookingId) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('id, scheduled_date, scheduled_time')
        .eq('id', bookingId)
        .single();
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      sessionStartUtc = getSessionStartUtc(String(booking.scheduled_date ?? ''), String(booking.scheduled_time ?? ''));

      const { data: payRow } = await supabase
        .from('payments')
        .select('id, razorpay_order_id, razorpay_payment_id, booking_id, amount_paise, currency, status')
        .eq('booking_id', bookingId)
        .eq('status', 'paid')
        .maybeSingle();
      payment = payRow as PaymentRow | null;
    } else if (paymentId) {
      const { data: payRow } = await supabase
        .from('payments')
        .select('id, razorpay_order_id, razorpay_payment_id, booking_id, amount_paise, currency, status')
        .eq('razorpay_payment_id', paymentId)
        .eq('status', 'paid')
        .maybeSingle();
      payment = payRow as PaymentRow | null;
      if (payment?.booking_id) {
        const { data: booking } = await supabase
          .from('bookings')
          .select('scheduled_date, scheduled_time')
          .eq('id', payment.booking_id)
          .single();
        if (booking) {
          sessionStartUtc = getSessionStartUtc(String(booking.scheduled_date ?? ''), String(booking.scheduled_time ?? ''));
        }
      }
    }

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'No paid payment found for this booking/payment',
      });
    }

    if (payment.status !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Payment is not in paid state',
      });
    }

    const razorpayPaymentId = payment.razorpay_payment_id;
    if (!razorpayPaymentId || razorpayPaymentId.startsWith('pay_mock_')) {
      const { error: updateErr } = await supabase
        .from('payments')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
        })
        .eq('id', payment.id);
      if (updateErr) {
        console.error('Refund mock update failed:', updateErr.message);
        return res.status(500).json({
          success: false,
          error: updateErr.message || 'Failed to update payment.',
        });
      }
      return res.json({
        success: true,
        refunded: true,
        amount_paise: payment.amount_paise,
        currency: payment.currency,
        mode: 'mock',
      });
    }

    if (!RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ success: false, error: 'Payment service not configured' });
    }

    const refundAmount = getRefundAmount(payment.amount_paise, sessionStartUtc);
    if (refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'No refund amount (session may have passed)',
      });
    }

    try {
      const Razorpay = (await import('razorpay')).default;
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: RAZORPAY_KEY_SECRET,
      });
      const refundParams: { amount?: number; notes?: Record<string, string> } = {
        notes: { booking_id: bookingId || payment.booking_id || '', reason: 'cancellation' },
      };
      if (refundAmount < payment.amount_paise) {
        refundParams.amount = refundAmount;
      }
      await (razorpay as any).payments.refund(razorpayPaymentId, refundParams);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Razorpay refund failed';
      console.error('Razorpay refund error:', err);
      return res.status(502).json({
        success: false,
        error: msg,
      });
    }

    const { error: updateErr } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateErr) {
      console.error('Refund DB update failed:', updateErr.message);
      return res.status(500).json({
        success: false,
        error: updateErr.message || 'Refund issued but failed to update payment record.',
      });
    }

    return res.json({
      success: true,
      refunded: true,
      amount_paise: refundAmount,
      currency: payment.currency,
      full_refund: refundAmount >= payment.amount_paise,
    });
  } catch (err: unknown) {
    console.error('Refund handler error:', err);
    const msg = err instanceof Error ? err.message : 'Refund request failed';
    return res.status(500).json({ success: false, error: msg });
  }
}
