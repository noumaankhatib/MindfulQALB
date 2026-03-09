/**
 * Local development server for API functions
 * Runs the API endpoints without requiring Vercel CLI login
 * When SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set, bookings are inserted into Supabase (same as Vercel).
 */

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load backend/.env first so all API keys and secrets live in one place (backend/.env).
// Then root .env and .env.local can add overrides or frontend-only vars (e.g. VITE_*).
dotenv.config({ path: path.resolve(__dirname, 'backend', '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const app = express();
const PORT = 3001;

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
// Use SUPABASE_URL or fallback to VITE_SUPABASE_URL (same value, different name)
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

// Treat placeholders and invalid values as missing (avoids "Invalid API key undefined")
const isValidKey = (v) => typeof v === 'string' && v.length > 20 && !/^undefined$|^your-|^<\w+>$/i.test(v);
const supabaseUrlOk = SUPABASE_URL.length > 10 && SUPABASE_URL.startsWith('https://');
const supabaseKeyOk = isValidKey(SUPABASE_SERVICE_ROLE_KEY);

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  console.log(`✅ Razorpay configured: ${RAZORPAY_KEY_ID.substring(0, 12)}...`);
} else {
  console.log('⚠️  Razorpay not configured - using mock mode');
}

if (supabaseUrlOk && supabaseKeyOk) {
  console.log('✅ Supabase configured - bookings will be saved to database');
} else {
  if (SUPABASE_URL || SUPABASE_SERVICE_ROLE_KEY) {
    if (!supabaseUrlOk) console.log('⚠️  Supabase: SUPABASE_URL missing or invalid (need https://... in .env)');
    if (!supabaseKeyOk) console.log('⚠️  Supabase: SUPABASE_SERVICE_ROLE_KEY missing or invalid (use service_role key from Supabase Dashboard → Settings → API)');
  } else {
    console.log('⚠️  Supabase not configured - bookings are mock-only (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in backend/.env to persist)');
  }
}

const googleCalId = process.env.GOOGLE_CALENDAR_ID?.trim();
const googleSaEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
const googleSaKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();
const isGoogleCalConfigured = !!(googleCalId && googleSaEmail && googleSaKey);
if (isGoogleCalConfigured) {
  console.log(`✅ Google Calendar configured: ${googleCalId}`);
} else {
  console.log('⚠️  Google Calendar not configured - availability uses fallback slots, no Meet links on confirm');
}

// Lazy-load google-auth-library (not available until npm install)
let _googleAuth = null;
async function getGoogleAccessToken() {
  if (!isGoogleCalConfigured) throw new Error('Google Calendar not configured');
  if (!_googleAuth) {
    const { GoogleAuth } = await import('google-auth-library');
    const key = googleSaKey.replace(/\\n/g, '\n');
    _googleAuth = new GoogleAuth({ credentials: { client_email: googleSaEmail, private_key: key }, scopes: ['https://www.googleapis.com/auth/calendar'] });
  }
  const client = await _googleAuth.getClient();
  const tokenRes = await client.getAccessToken();
  const token = typeof tokenRes === 'string' ? tokenRes : tokenRes?.token;
  if (!token) throw new Error('Failed to obtain Google access token');
  return token;
}

// Middleware
app.use(cors());
app.use(express.json());

// Pricing configuration (INR for India, USD for international)
const PRICING = {
  individual: { chat: 499, audio: 899, video: 1299 },
  couples: { audio: 1499, video: 1999 },
  family: { audio: 1799, video: 2499 },
};

const PRICING_USD = {
  individual: { chat: 6, audio: 11, video: 16 },
  couples: { audio: 18, video: 24 },
  family: { audio: 21, video: 30 },
  free: { call: 0, chat: 0, audio: 0, video: 0 },
};
const APPROX_INR_PER_USD = 83; // for fixed coupon discount on USD orders

// Mock time slots (only allowed times: 9 AM, 10 AM, 5 PM, 6 PM, 7 PM, 8 PM)
const getMockSlots = () => [
  { time: '9:00 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '5:00 PM', available: true },
  { time: '6:00 PM', available: true },
  { time: '7:00 PM', available: true },
  { time: '8:00 PM', available: true },
];

// Check if date is a weekend (Saturday = 6, Sunday = 0)
const isWeekend = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 0 || day === 6;
};

// Geo proxy: ipapi.co does not allow CORS from browsers; backend fetches and returns JSON.
// Cache response to avoid 429 (ipapi.co free tier rate limit); use cache on 429 or timeout.
const GEO_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
let geoCache = { data: null, expires: 0 };

app.get('/api/geo', async (req, res) => {
  const now = Date.now();
  if (geoCache.data && geoCache.expires > now) {
    return res.json(geoCache.data);
  }
  try {
    const resp = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
    const data = await resp.json().catch(() => ({}));
    if (resp.ok) {
      geoCache = { data, expires: now + GEO_CACHE_TTL_MS };
      return res.json(data);
    }
    if (resp.status === 429 && geoCache.data) {
      return res.json(geoCache.data);
    }
    return res.status(resp.status).json(data.error ? data : { error: `Upstream ${resp.status}` });
  } catch (e) {
    if (geoCache.data) return res.json(geoCache.data);
    res.status(502).json({ error: e?.message || 'Upstream error' });
  }
});

// Health check (includes DB config so you can verify before booking)
// Also handles ?action=profile to fetch the authenticated user's profile (bypasses RLS).
app.get('/api/health', async (req, res) => {
  if (req.query.action === 'profile') {
    const supabase = getSupabase();
    if (!supabase) return res.status(503).json({ error: 'Server configuration error' });
    const authHeader = req.headers.authorization;
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    if (!token) return res.status(401).json({ error: 'Missing Authorization: Bearer <access_token>' });
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return res.status(401).json({ error: 'Invalid or expired token' });
    const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profileError) return res.status(profileError.code === 'PGRST116' ? 404 : 500).json({ error: profileError.message });
    return res.json(profile);
  }
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: 'local-development',
    supabaseConfigured: !!(supabaseUrlOk && supabaseKeyOk),
  });
});

// Allowed time slots (same for all session types – one therapist, one calendar)
const ALLOWED_SLOTS = ['9:00 AM', '10:00 AM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

function slotToDate(dateStr, timeStr) {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) throw new Error(`Invalid time: ${timeStr}`);
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  else if (period === 'AM' && hours === 12) hours = 0;
  const iso = `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
  return new Date(iso);
}

async function fetchGoogleCalendarAvailability(date) {
  if (!isGoogleCalConfigured) return null;
  try {
    const token = await getGoogleAccessToken();
    const timeMin = `${date}T00:00:00+05:30`;
    const timeMax = `${date}T23:59:59+05:30`;
    const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeMin, timeMax, items: [{ id: googleCalId }] }),
    });
    if (!res.ok) { console.error('FreeBusy API error:', res.status); return null; }
    const data = await res.json();
    const busyPeriods = data.calendars?.[googleCalId]?.busy ?? [];
    return ALLOWED_SLOTS.map((time) => {
      const slotStart = slotToDate(date, time);
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
      const isBusy = busyPeriods.some(bp => slotStart < new Date(bp.end) && slotEnd > new Date(bp.start));
      return { time, available: !isBusy };
    });
  } catch (e) {
    console.error('Google Calendar availability error:', e.message);
    return null;
  }
}

app.post('/api/availability', async (req, res) => {
  const { date } = req.body;
  if (!date) {
    return res.status(400).json({ error: 'Date required' });
  }
  if (isWeekend(date)) {
    return res.json({ success: true, date, slots: [], isWeekend: true, message: 'No slots available on weekends' });
  }
  const slots = await fetchGoogleCalendarAvailability(date);
  res.json({ success: true, date, slots: slots || getMockSlots() });
});

// Validate coupon (same contract as Vercel api/coupons/validate)
app.post('/api/coupons/validate', async (req, res) => {
  try {
    const sendJson = (status, body) => {
      res.status(status).set('Content-Type', 'application/json').json(body);
    };
    const { code, amountPaise } = req.body ?? {};
    const rawCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
    const amount = typeof amountPaise === 'number' ? Math.max(0, Math.floor(amountPaise)) : 0;

    if (!rawCode) {
      return sendJson(400, { valid: false, message: 'Coupon code is required' });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return sendJson(503, { valid: false, message: 'Service unavailable' });
    }

    const { data: row, error } = await supabase
      .from('coupons')
      .select('id, code, discount_type, discount_value, min_amount_paise, valid_from, valid_until, max_uses, used_count, is_active')
      .ilike('code', rawCode)
      .maybeSingle();

    if (error) {
      console.error('[coupons/validate] Supabase error:', error.message);
      const hint = error.message && error.message.includes('does not exist')
        ? ' Run docs/supabase-coupons-migration.sql in Supabase SQL Editor.'
        : '';
      return sendJson(500, { valid: false, message: 'Could not validate coupon.' + hint });
    }
    if (!row || !row.is_active) {
      return sendJson(200, { valid: false, message: 'Invalid or inactive coupon code' });
    }

    const now = new Date();
    if (row.valid_from && new Date(row.valid_from) > now) {
      return sendJson(200, { valid: false, message: 'This coupon is not yet valid' });
    }
    if (row.valid_until && new Date(row.valid_until) < now) {
      return sendJson(200, { valid: false, message: 'This coupon has expired' });
    }
    if (row.max_uses != null && (row.used_count ?? 0) >= row.max_uses) {
      return sendJson(200, { valid: false, message: 'This coupon has reached its usage limit' });
    }

    const minPaise = Number(row.min_amount_paise) || 0;
    if (amount < minPaise) {
      return sendJson(200, {
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
      return sendJson(200, { valid: false, message: 'No discount applies to this order' });
    }

    return sendJson(200, { valid: true, discountPaise, code: row.code, couponId: row.id });
  } catch (err) {
    console.error('[coupons/validate] Error:', err);
    res.status(500).set('Content-Type', 'application/json').json({ valid: false, message: 'Could not validate coupon. Please try again.' });
  }
});

// Create payment order (supports INR for India, USD for international)
app.post('/api/payments/create-order', async (req, res) => {
  const body = req.body || {};
  if (Object.keys(body).length === 0) {
    console.warn('[create-order] Empty body received');
    return res.status(400).json({ error: 'Missing request body. Send sessionType, format, and optionally couponCode.' });
  }
  console.log('[create-order] body keys:', Object.keys(body), '| couponCode present:', 'couponCode' in body || 'coupon_code' in body, body.couponCode != null ? '| value: ' + body.couponCode : '');
  const sessionType = body.sessionType;
  const format = body.format;
  const couponCode = body.couponCode ?? body.coupon_code ?? '';
  const code = typeof couponCode === 'string' ? couponCode.trim().toUpperCase() : '';
  const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
  const customerEmail = typeof body.customerEmail === 'string' ? body.customerEmail.trim().toLowerCase() : '';
  const customerPhone = typeof body.customerPhone === 'string' ? body.customerPhone.trim() : '';

  // Currency: default INR, accept USD for international clients
  const rawCurrency = typeof body.currency === 'string' ? body.currency.toUpperCase() : 'INR';
  const currency = ['INR', 'USD'].includes(rawCurrency) ? rawCurrency : 'INR';
  const isInternational = currency === 'USD';
  const pricingTable = isInternational ? PRICING_USD : PRICING;
  const currencySymbol = isInternational ? '$' : '₹';

  const setCouponHeaders = (received, applied) => {
    res.setHeader('X-Coupon-Received', received ? 'true' : 'false');
    res.setHeader('X-Discount-Applied', applied ? 'true' : 'false');
  };

  if (!sessionType || !format) {
    return res.status(400).json({ error: 'sessionType and format required' });
  }

  const pricing = pricingTable[sessionType]?.[format];
  if (pricing === undefined) {
    return res.status(400).json({ error: 'Invalid session type or format' });
  }

  if (pricing === 0) {
    return res.json({
      success: true,
      orderId: `free_${Date.now()}`,
      amount: 0,
      currency,
      keyId: RAZORPAY_KEY_ID || 'rzp_test_mock',
      isFree: true,
    });
  }

  let amountSmallest = pricing * 100;
  let couponMeta = null;

  if (code) {
    console.log('[create-order] Coupon received:', code, '| sessionType:', sessionType, '| format:', format, '| currency:', currency);
    const supabase = getSupabase();
    if (!supabase) {
      setCouponHeaders(true, false);
      console.warn('[create-order] Coupon sent but Supabase not configured – cannot apply discount');
      return res.status(503).json({
        error: 'Coupon cannot be applied right now. Please try without the coupon or try again later.',
      });
    }
    const { data: coupon, error: couponErr } = await supabase
      .from('coupons')
      .select('id, code, discount_type, discount_value, min_amount_paise, valid_from, valid_until, max_uses, used_count, is_active')
      .ilike('code', code)
      .maybeSingle();

    if (couponErr) {
      setCouponHeaders(true, false);
      console.error('[create-order] Coupon lookup failed:', couponErr.message);
      return res.status(500).json({
        error: 'Coupon could not be applied. Please remove the coupon and try again.',
      });
    }
    if (!coupon || !coupon.is_active) {
      setCouponHeaders(true, false);
      return res.status(400).json({
        error: 'Invalid or inactive coupon. Please remove it and try again.',
      });
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

  // Check if Razorpay is configured
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    setCouponHeaders(!!code, !!couponMeta);
    console.log('Razorpay not configured, using mock mode');
    return res.json({
      success: true,
      orderId: `order_mock_${Date.now()}`,
      amount: amountSmallest,
      currency,
      keyId: 'rzp_test_mock',
      mode: 'mock',
      ...(couponMeta && { discountPaise: couponMeta.discount_amount }),
    });
  }

  // Create real Razorpay order
  try {
    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amountSmallest,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: { sessionType, format, currency },
    });

    const supabase = getSupabase();
    if (supabase) {
      const meta = {};
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
      if (insertErr) console.error('Payment row insert failed:', insertErr.message);
    }

    setCouponHeaders(!!code, !!couponMeta);
    res.json({
      success: true,
      orderId: order.id,
      amount: amountSmallest,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
      mode: 'live',
      ...(couponMeta && { discountPaise: couponMeta.discount_amount }),
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify payment
app.post('/api/payments/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  if (!razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({ error: 'Missing payment details' });
  }

  // If mock mode or no secret configured
  if (!RAZORPAY_KEY_SECRET || razorpay_order_id.startsWith('order_mock_')) {
    return res.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      mode: 'mock',
    });
  }

  // Verify real Razorpay signature
  if (!razorpay_signature) {
    return res.status(400).json({ error: 'Missing signature for verification' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    const supabase = getSupabase();
    if (supabase) {
      const { data: payment } = await supabase
        .from('payments')
        .select('id, metadata')
        .eq('razorpay_order_id', razorpay_order_id)
        .maybeSingle();
      const { error: updateErr } = await supabase
        .from('payments')
        .update({
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature: razorpay_signature || null,
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', razorpay_order_id);
      if (updateErr) console.error('Payment update failed:', updateErr.message);
      const couponId = payment?.metadata?.coupon_id;
      if (couponId) {
        const { data: c } = await supabase.from('coupons').select('used_count').eq('id', couponId).single();
        if (c) await supabase.from('coupons').update({ used_count: (c.used_count ?? 0) + 1, updated_at: new Date().toISOString() }).eq('id', couponId);
      }
    }
    res.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      mode: 'live',
    });
  } else {
    res.status(400).json({
      success: false,
      verified: false,
      error: 'Invalid payment signature',
    });
  }
});

// Link payment to booking (so refunds can be done by booking_id)
app.post('/api/payments/link', async (req, res) => {
  const { razorpay_order_id, booking_id } = req.body || {};
  if (!razorpay_order_id || !booking_id) {
    return res.status(400).json({ error: 'razorpay_order_id and booking_id required' });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
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
});

// Refund: by booking_id or razorpay_payment_id. Applies 24h policy (full vs 50%).
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
function parseTimeToMinutes(s) {
  const match = String(s).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = (match[3] || '').toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}
function getSessionStartUtc(scheduledDate, scheduledTime) {
  const min = parseTimeToMinutes(scheduledTime);
  if (min === null) return null;
  const parts = scheduledDate.split('-').map(Number);
  if (!parts[0] || !parts[1] || !parts[2]) return null;
  const utcMs = Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0) + (min - (5 * 60 + 30)) * 60 * 1000;
  const d = new Date(utcMs);
  return isNaN(d.getTime()) ? null : d;
}
function getRefundAmountPaise(amountPaise, sessionStartUtc) {
  if (!sessionStartUtc) return amountPaise;
  if (sessionStartUtc.getTime() - Date.now() >= TWENTY_FOUR_HOURS_MS) return amountPaise;
  return Math.floor(amountPaise / 2);
}
app.post('/api/payments/refund', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const { booking_id: bookingId, razorpay_payment_id: paymentId } = req.body || {};
    if (!bookingId && !paymentId) {
      return res.status(400).json({ error: 'Provide booking_id or razorpay_payment_id' });
    }
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    let payment = null;
    let sessionStartUtc = null;
    if (bookingId) {
      const { data: booking } = await supabase.from('bookings').select('id, scheduled_date, scheduled_time').eq('id', bookingId).single();
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      sessionStartUtc = getSessionStartUtc(String(booking.scheduled_date || ''), String(booking.scheduled_time || ''));
      const { data: p } = await supabase.from('payments').select('id, razorpay_order_id, razorpay_payment_id, booking_id, amount_paise, currency, status').eq('booking_id', bookingId).eq('status', 'paid').maybeSingle();
      payment = p;
    } else {
      const { data: p } = await supabase.from('payments').select('id, razorpay_order_id, razorpay_payment_id, booking_id, amount_paise, currency, status').eq('razorpay_payment_id', paymentId).eq('status', 'paid').maybeSingle();
      payment = p;
      if (payment?.booking_id) {
        const { data: b } = await supabase.from('bookings').select('scheduled_date, scheduled_time').eq('id', payment.booking_id).single();
        if (b) sessionStartUtc = getSessionStartUtc(String(b.scheduled_date || ''), String(b.scheduled_time || ''));
      }
    }
    if (!payment) {
      return res.status(404).json({ success: false, error: 'No paid payment found for this booking/payment' });
    }
    if (payment.status !== 'paid') {
      return res.status(400).json({ success: false, error: 'Payment is not in paid state' });
    }
    const razorpayPaymentId = payment.razorpay_payment_id;
    if (!razorpayPaymentId || String(razorpayPaymentId).startsWith('pay_mock_')) {
      const { error: updateErr } = await supabase.from('payments').update({ status: 'refunded', refunded_at: new Date().toISOString() }).eq('id', payment.id);
      if (updateErr) {
        console.error('Refund mock update failed:', updateErr.message, updateErr.details);
        return res.status(500).json({ success: false, error: updateErr.message || 'Failed to update payment.' });
      }
      return res.json({ success: true, refunded: true, amount_paise: payment.amount_paise, currency: payment.currency, mode: 'mock' });
    }
    if (!RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ success: false, error: 'Payment service not configured' });
    }
    const refundAmount = getRefundAmountPaise(payment.amount_paise, sessionStartUtc);
    if (refundAmount <= 0) {
      return res.status(400).json({ success: false, error: 'No refund amount (session may have passed)' });
    }
    try {
      const Razorpay = (await import('razorpay')).default;
      const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
      const refundParams = { notes: { booking_id: bookingId || payment.booking_id || '', reason: 'cancellation' } };
      if (refundAmount < payment.amount_paise) refundParams.amount = refundAmount;
      await razorpay.payments.refund(razorpayPaymentId, refundParams);
    } catch (err) {
      console.error('Razorpay refund error:', err);
      return res.status(502).json({ success: false, error: err?.message || 'Razorpay refund failed' });
    }
    const { error: updateErr } = await supabase.from('payments').update({ status: 'refunded', refunded_at: new Date().toISOString() }).eq('id', payment.id);
    if (updateErr) {
      console.error('Refund DB update failed:', updateErr.message, updateErr.details);
      return res.status(500).json({ success: false, error: updateErr.message || 'Refund issued but failed to update payment record.' });
    }
    return res.json({ success: true, refunded: true, amount_paise: refundAmount, currency: payment.currency, full_refund: refundAmount >= payment.amount_paise });
  } catch (err) {
    console.error('Refund handler error:', err);
    const msg = err?.message || 'Refund request failed';
    return res.status(500).json({ success: false, error: msg });
  }
});

// Helpers for Supabase booking insert (match api/bookings.ts schema)
const DURATION_BY_RAW_FORMAT = { call: 15, chat: 30, audio: 45, video: 60 };
const toDbSessionType = (s) => (s === 'couples' || s === 'family' ? s : 'individual');
const toDbFormat = (f) => (f === 'chat' || f === 'audio' ? f : 'video');
const sanitize = (str) => (typeof str !== 'string' ? '' : str.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim());

function getSupabase() {
  if (!supabaseUrlOk || !supabaseKeyOk) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Parse date+time as Asia/Kolkata and return UTC ISO
function parseTimeToUTCISO(dateString, timeString) {
  const match = String(timeString).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) throw new Error('Invalid time format');
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  else if (period === 'AM' && hours === 12) hours = 0;
  const time24 = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  const isoInKolkata = `${dateString}T${time24}+05:30`;
  return new Date(isoInKolkata).toISOString();
}

// Create Google Calendar event with optional Meet link
async function createGoogleCalendarEvent(booking, requestId) {
  if (!isGoogleCalConfigured) return { eventId: null, meetingUrl: null };
  try {
    const token = await getGoogleAccessToken();
    const includeMeet = booking.session_format === 'video' || booking.session_format === 'audio';
    const formatLabel = booking.session_format.charAt(0).toUpperCase() + booking.session_format.slice(1);
    const typeLabel = booking.session_type.charAt(0).toUpperCase() + booking.session_type.slice(1);
    const summary = `${typeLabel} Therapy - ${formatLabel} (${booking.customer_name})`;
    const startISO = parseTimeToUTCISO(booking.scheduled_date, booking.scheduled_time);
    const endISO = new Date(new Date(startISO).getTime() + (booking.duration_minutes || 60) * 60_000).toISOString();

    const meetLink = includeMeet
      ? `https://meet.jit.si/MindfulQALB-${(booking.id || '').replace(/-/g, '').substring(0, 12)}`
      : null;

    const desc = `Client: ${booking.customer_name}\nEmail: ${booking.customer_email}` +
      (meetLink ? `\n\n--- Video Session ---\nJoin: ${meetLink}` : '');

    const body = {
      summary,
      description: desc,
      start: { dateTime: startISO, timeZone: 'Asia/Kolkata' },
      end: { dateTime: endISO, timeZone: 'Asia/Kolkata' },
    };

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(googleCalId)}/events`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      const err = new Error(`Calendar API ${response.status}: ${text}`);
      err.status = response.status;
      throw err;
    }
    const event = await response.json();
    return { eventId: event.id, meetingUrl: meetLink };
  } catch (err) {
    const is404 = err.status === 404 || (err.message && String(err.message).includes('404'));
    if (is404) {
      console.warn(`[${requestId}] Google Calendar not found (404). Check GOOGLE_CALENDAR_ID and that the calendar is shared with the service account. Using Jitsi Meet fallback.`);
    } else {
      console.error(`[${requestId}] Google Calendar event error:`, err.message);
    }
    return { eventId: null, meetingUrl: meetLink };
  }
}

// POST: Create booking (Supabase only, status = pending)
app.post('/api/bookings', async (req, res) => {
  const { sessionType, format, date, time, customer, user_id: userId } = req.body;
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (!sessionType || !date || !time || !customer?.name || !customer?.email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const fmt = format || 'video';
  const rawSessionType = String(sessionType).toLowerCase();
  const rawFormat = String(fmt).toLowerCase();
  const isFreeSession = rawSessionType === 'free';
  const session_type = toDbSessionType(rawSessionType);
  const session_format = toDbFormat(rawFormat);
  const duration_minutes = DURATION_BY_RAW_FORMAT[rawFormat] ?? DURATION_BY_RAW_FORMAT[session_format] ?? 60;

  const supabase = getSupabase();
  if (supabase) {
    try {
      const customerEmail = String(customer.email).toLowerCase().trim();
      // One booking per user per date+time: no clash across therapy types
      const { data: existingAtSlot } = await supabase
        .from('bookings')
        .select('id, user_id, customer_email')
        .eq('scheduled_date', date)
        .eq('scheduled_time', time)
        .in('status', ['pending', 'confirmed']);
      const rows = existingAtSlot ?? [];
      const hasConflict = rows.some(
        (r) =>
          (userId && r.user_id === userId) ||
          (r.customer_email && r.customer_email.toLowerCase() === customerEmail)
      );
      if (hasConflict) {
        return res.status(400).json({
          success: false,
          error: 'You already have a booking at this date and time. Please choose a different slot or cancel the existing one.',
        });
      }

      const row = {
        user_id: userId || null,
        session_type,
        session_format,
        duration_minutes,
        scheduled_date: date,
        scheduled_time: time,
        timezone: 'Asia/Kolkata',
        status: 'pending',
        calendar_event_id: null,
        meeting_url: null,
        customer_name: sanitize(customer.name),
        customer_email: customerEmail,
        customer_phone: customer.phone ? String(customer.phone).trim() : null,
        notes: isFreeSession
          ? (customer.notes ? `[FREE_CONSULTATION] ${sanitize(customer.notes)}` : '[FREE_CONSULTATION]')
          : (customer.notes ? sanitize(customer.notes) : null),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from('bookings').insert(row).select('id').single();
      if (error) {
        console.error('Supabase booking insert failed:', error.code, error.message, JSON.stringify(error.details));
        return res.status(500).json({ success: false, error: 'Failed to save booking.' });
      }
      console.log(`[${requestId}] Booking saved to DB: ${data.id}`);
      return res.json({
        success: true,
        bookingId: data.id,
        databaseId: data.id,
        message: 'Booking created successfully',
      });
    } catch (err) {
      console.error('Booking insert error:', err);
      return res.status(500).json({ success: false, error: 'Failed to save booking.' });
    }
  }

  console.log('Booking mock (no DB)');
  res.json({
    success: true,
    bookingId: `local_${Date.now()}`,
    message: 'Booking created (mock – DB not configured)',
    savedToDatabase: false,
  });
});

// Store consent – insert into Supabase when configured (same table as api/consent.ts)
app.post('/api/consent', async (req, res) => {
  const { sessionType, email, consentVersion, acknowledgments } = req.body;

  if (!sessionType || !email || !consentVersion || !acknowledgments?.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = {
        user_id: null,
        email: String(email).toLowerCase().trim(),
        consent_version: String(consentVersion).trim(),
        session_type: toDbSessionType(String(sessionType).toLowerCase()),
        acknowledgments: Array.isArray(acknowledgments) ? acknowledgments : [],
        ip_address: req.ip || req.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
        user_agent: req.get('user-agent') || null,
        consented_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from('consent_records').insert(row).select('id').single();
      if (error) {
        console.error('Supabase consent insert failed:', error.code, error.message);
        return res.status(500).json({ success: false, error: 'Failed to store consent.' });
      }
      return res.json({
        success: true,
        consentId: data.id,
        message: 'Consent recorded successfully',
      });
    } catch (err) {
      console.error('Consent insert error:', err);
      return res.status(500).json({ success: false, error: 'Failed to store consent.' });
    }
  }

  res.json({
    success: true,
    consentId: `consent_mock_${Date.now()}`,
    message: 'Consent recorded (mock – set SUPABASE_* in backend/.env to persist)',
  });
});

// PATCH: Confirm booking (admin only) – creates Calendar event + Meet link
app.patch('/api/bookings', async (req, res) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const adminCtx = await requireAdmin(req, res);
  if (!adminCtx) return;

  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

  const { supabase } = adminCtx;
  const { data: booking, error: fetchErr } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
  if (fetchErr || !booking) return res.status(404).json({ success: false, error: 'Booking not found' });
  if (booking.status !== 'pending') return res.status(400).json({ success: false, error: `Booking is already ${booking.status}` });

  const { eventId, meetingUrl: calendarMeetUrl } = await createGoogleCalendarEvent(booking, requestId);
  const includeMeet = booking.session_format === 'video' || booking.session_format === 'audio';
  const meetingUrl = calendarMeetUrl || (includeMeet ? `https://meet.jit.si/MindfulQALB-${(bookingId || '').replace(/-/g, '').substring(0, 12)}` : null);

  const payload = { status: 'confirmed', updated_at: new Date().toISOString() };
  if (eventId) payload.calendar_event_id = eventId;
  if (meetingUrl) payload.meeting_url = meetingUrl;

  const { error: updateErr } = await supabase.from('bookings').update(payload).eq('id', bookingId);
  if (updateErr) {
    console.error(`[${requestId}] Confirm update failed:`, updateErr.message);
    return res.status(500).json({ success: false, error: 'Failed to confirm booking' });
  }

  console.log(`[${requestId}] Booking ${bookingId} confirmed, meet: ${meetingUrl || 'none'}`);
  res.json({ success: true, bookingId, calendarEventId: eventId, meetingUrl, message: meetingUrl ? 'Booking confirmed with Google Meet link' : 'Booking confirmed' });
});

// --- Admin: require Bearer token and profile.role === 'admin' ---
async function requireAdmin(req, res) {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: 'Server configuration error' });
    return null;
  }
  const authHeader = req.headers.authorization;
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) {
    res.status(401).json({ error: 'Missing or invalid Authorization header. Use Bearer <access_token>.' });
    return null;
  }
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profileError || !profile || profile.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }
  return { supabase, callerUserId: user.id };
}

const ADMIN_ROLES = ['user', 'admin', 'therapist'];

// PATCH/PUT /api/admin/update-user – update user profile (and optionally auth email)
async function handleUpdateUser(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const { userId, full_name, phone, role, email } = req.body ?? {};
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' });
  }
  if (role && !ADMIN_ROLES.includes(role)) {
    return res.status(400).json({ error: 'role must be user, admin, or therapist' });
  }
  const { data: targetProfile } = await admin.supabase.from('profiles').select('role').eq('id', userId).single();
  if (role && targetProfile?.role === 'admin' && role !== 'admin') {
    const { data: admins } = await admin.supabase.from('profiles').select('id').eq('role', 'admin');
    if ((admins?.length ?? 0) <= 1) {
      return res.status(400).json({ error: 'Cannot remove the last admin. Assign another admin first.' });
    }
  }
  const profileUpdates = { updated_at: new Date().toISOString() };
  if (full_name !== undefined) profileUpdates.full_name = full_name === '' ? null : String(full_name);
  if (phone !== undefined) profileUpdates.phone = phone === '' ? null : String(phone);
  if (role !== undefined) profileUpdates.role = role;
  if (email !== undefined && email != null && String(email).trim()) profileUpdates.email = String(email).toLowerCase().trim();
  if (Object.keys(profileUpdates).length <= 1) {
    return res.status(400).json({ error: 'Provide at least one of: full_name, phone, role, email' });
  }
  const { error: profileError } = await admin.supabase.from('profiles').update(profileUpdates).eq('id', userId);
  if (profileError) {
    return res.status(500).json({ error: profileError.message || 'Failed to update profile' });
  }
  if (profileUpdates.email) {
    const { error: authError } = await admin.supabase.auth.admin.updateUserById(userId, { email: profileUpdates.email });
    if (authError) {
      console.error('Auth email update failed (profile updated):', authError.message);
      return res.json({ success: true, message: 'Profile updated; auth email could not be changed.' });
    }
  }
  res.json({ success: true, message: 'User updated successfully' });
}
app.patch('/api/admin/update-user', handleUpdateUser);
app.put('/api/admin/update-user', handleUpdateUser);

// POST/DELETE /api/admin/delete-user – delete user and all related data
async function handleDeleteUser(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const { userId } = req.body ?? {};
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' });
  }
  if (userId === admin.callerUserId) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }
  const { data: targetProfile } = await admin.supabase.from('profiles').select('role').eq('id', userId).single();
  if (targetProfile?.role === 'admin') {
    const { data: admins } = await admin.supabase.from('profiles').select('id').eq('role', 'admin');
    if ((admins?.length ?? 0) <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin' });
    }
  }
  const { data: userBookings } = await admin.supabase.from('bookings').select('id').eq('user_id', userId);
  const bookingIds = (userBookings ?? []).map((b) => b.id);
  if (bookingIds.length > 0) {
    await admin.supabase.from('payments').delete().in('booking_id', bookingIds);
  }
  await admin.supabase.from('payments').delete().eq('user_id', userId);
  await admin.supabase.from('bookings').delete().eq('user_id', userId);
  await admin.supabase.from('consent_records').delete().eq('user_id', userId);
  const { error: authError } = await admin.supabase.auth.admin.deleteUser(userId);
  if (authError) {
    return res.status(500).json({ error: authError.message || 'Failed to delete user from auth.' });
  }
  res.json({ success: true, message: 'User and all related data deleted' });
}
app.post('/api/admin/delete-user', handleDeleteUser);
app.delete('/api/admin/delete-user', (req, res, next) => {
  req.body = req.body || {};
  if (!req.body.userId && typeof req.query?.userId === 'string') req.body.userId = req.query.userId;
  return handleDeleteUser(req, res, next);
});

app.listen(PORT, () => {
  console.log(`
┌─────────────────────────────────────────────────┐
│                                                 │
│   🚀 Local API Server running!                  │
│                                                 │
│   API:      http://localhost:${PORT}/api          │
│   Health:   http://localhost:${PORT}/api/health   │
│                                                 │
│   Note: Using mock data for development         │
│                                                 │
└─────────────────────────────────────────────────┘

Now run the frontend in another terminal:
  npm run dev
  `);
});
