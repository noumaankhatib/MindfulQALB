/**
 * POST /api/packages/purchase
 *
 * Creates a Razorpay order for a session package and stores a
 * pending session_packages row. The package is activated in
 * /api/packages/activate after payment verification.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from '../_utils/cors.js';
import { rateLimiters } from '../_utils/rateLimit.js';
import { getSupabaseServer } from '../_utils/supabase.js';

const getRazorpay = async () => {
  const Razorpay = (await import('razorpay')).default;
  return Razorpay;
};

// Package definitions — must stay in sync with GetHelp.tsx sessionPackages
const PACKAGES: Record<string, {
  title: string;
  sessionType: 'individual';
  sessionFormat: 'chat' | 'audio' | 'video';
  durationMinutes: number;
  totalSessions: number;
  priceINR: number;
  priceUSD: number;
}> = {
  chat_bundle: {
    title: 'Chat Bundle',
    sessionType: 'individual',
    sessionFormat: 'chat',
    durationMinutes: 30,
    totalSessions: 4,
    priceINR: 1697,
    priceUSD: 20,
  },
  starter_pack: {
    title: 'Starter Pack',
    sessionType: 'individual',
    sessionFormat: 'audio',
    durationMinutes: 45,
    totalSessions: 4,
    priceINR: 3057,
    priceUSD: 37,
  },
  growth_pack: {
    title: 'Growth Pack',
    sessionType: 'individual',
    sessionFormat: 'video',
    durationMinutes: 60,
    totalSessions: 8,
    priceINR: 8314,
    priceUSD: 102,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  const requestId = corsResult as string;

  if (rateLimiters.payment(req, res)) return;
  if (!validateMethod(req, res, ['POST'])) return;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(503).json({ success: false, error: 'Payment service not configured' });
  }

  try {
    const body = req.body ?? {};
    const packageId: string = typeof body.packageId === 'string' ? body.packageId.trim().toLowerCase() : '';
    const customerName: string = typeof body.customerName === 'string' ? body.customerName.trim() : '';
    const customerEmail: string = typeof body.customerEmail === 'string' ? body.customerEmail.trim().toLowerCase() : '';
    const customerPhone: string = typeof body.customerPhone === 'string' ? body.customerPhone.trim() : '';
    const userId: string | null = typeof body.userId === 'string' ? body.userId.trim() : null;
    const rawCurrency = typeof body.currency === 'string' ? body.currency.toUpperCase() : 'INR';
    const currency = rawCurrency === 'USD' ? 'USD' : 'INR';
    const isInternational = currency === 'USD';

    if (!PACKAGES[packageId]) {
      return res.status(400).json({ error: 'Invalid package ID. Must be one of: chat_bundle, starter_pack, growth_pack' });
    }
    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return res.status(400).json({ error: 'Valid customer email is required' });
    }
    if (!customerName) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    const pkg = PACKAGES[packageId];
    const priceUnit = isInternational ? pkg.priceUSD : pkg.priceINR;
    const amountSmallest = priceUnit * 100; // paise / cents

    const Razorpay = await getRazorpay();
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: amountSmallest,
      currency,
      receipt: `pkg_${packageId}_${Date.now()}`,
      notes: {
        type: 'package',
        packageId,
        packageTitle: pkg.title,
        customerEmail,
        customerName,
      },
    });

    const supabase = getSupabaseServer();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    // Compute valid_until = today + 6 months (set on activation, stored here as placeholder)
    const { data: pkgRow, error: insertErr } = await supabase
      .from('session_packages')
      .insert({
        user_id: userId || null,
        customer_email: customerEmail,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        package_id: packageId,
        package_title: pkg.title,
        session_type: pkg.sessionType,
        session_format: pkg.sessionFormat,
        duration_minutes: pkg.durationMinutes,
        total_sessions: pkg.totalSessions,
        sessions_used: 0,
        sessions_remaining: pkg.totalSessions,
        amount_paid_paise: amountSmallest,
        currency,
        razorpay_order_id: order.id,
        status: 'pending_payment',
      })
      .select('id')
      .single();

    if (insertErr || !pkgRow) {
      console.error(`[${requestId}] session_packages insert failed:`, insertErr?.message);
      return res.status(500).json({ success: false, error: 'Failed to create package record' });
    }

    return res.json({
      success: true,
      orderId: order.id,
      amount: amountSmallest,
      currency,
      keyId,
      packageRecordId: pkgRow.id,
      packageTitle: pkg.title,
      totalSessions: pkg.totalSessions,
    });
  } catch (error) {
    console.error(`[${requestId}] Package purchase error:`, error instanceof Error ? error.message : 'Unknown');
    return res.status(500).json({ success: false, error: 'Failed to create package order', requestId });
  }
}
