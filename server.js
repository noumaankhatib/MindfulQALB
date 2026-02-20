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
// Load .env from project root (where server.js lives) so SUPABASE_* are always found
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
    console.log('⚠️  Supabase not configured - bookings are mock-only (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env to persist)');
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Pricing configuration
const PRICING = {
  individual: { chat: 499, audio: 899, video: 1299 },
  couples: { audio: 1499, video: 1999 },
  family: { audio: 1799, video: 2499 },
};

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

// Health check (includes DB config so you can verify before booking)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: 'local-development',
    supabaseConfigured: !!(supabaseUrlOk && supabaseKeyOk),
  });
});

// Availability
app.post('/api/availability', (req, res) => {
  const { date, sessionType } = req.body;
  
  if (!date || !sessionType) {
    return res.status(400).json({ error: 'Date and sessionType required' });
  }
  
  // Check if weekend - return empty slots
  if (isWeekend(date)) {
    return res.json({
      success: true,
      date,
      slots: [],
      isWeekend: true,
      message: 'No slots available on weekends',
    });
  }
  
  res.json({
    success: true,
    date,
    slots: getMockSlots(),
  });
});

// Create payment order
app.post('/api/payments/create-order', async (req, res) => {
  const { sessionType, format } = req.body;
  
  if (!sessionType || !format) {
    return res.status(400).json({ error: 'sessionType and format required' });
  }
  
  const pricing = PRICING[sessionType]?.[format];
  if (!pricing) {
    return res.status(400).json({ error: 'Invalid session type or format' });
  }

  // Check if Razorpay is configured
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.log('Razorpay not configured, using mock mode');
    return res.json({
      success: true,
      orderId: `order_mock_${Date.now()}`,
      amount: pricing * 100,
      currency: 'INR',
      keyId: 'rzp_test_mock',
      mode: 'mock',
    });
  }

  // Create real Razorpay order
  try {
    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const amountPaise = pricing * 100;
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    const supabase = getSupabase();
    if (supabase) {
      const { error: insertErr } = await supabase.from('payments').insert({
        razorpay_order_id: order.id,
        amount_paise: amountPaise,
        currency: 'INR',
        status: 'pending',
      });
      if (insertErr) console.error('Payment row insert failed:', insertErr.message);
    }

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
      mode: 'live',
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

// Helpers for Supabase booking insert (match api/bookings.ts schema)
const DURATION_BY_FORMAT = { chat: 30, audio: 45, video: 60 };
const toDbSessionType = (s) => (s === 'couples' || s === 'family' ? s : 'individual');
const toDbFormat = (f) => (f === 'chat' || f === 'audio' ? f : 'video');
const sanitize = (str) => (typeof str !== 'string' ? '' : str.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim());

function getSupabase() {
  if (!supabaseUrlOk || !supabaseKeyOk) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Create booking – insert into Supabase when configured so My Bookings & Admin show data
app.post('/api/bookings', async (req, res) => {
  const { sessionType, format, date, time, customer, user_id: userId } = req.body;

  if (!sessionType || !date || !time || !customer?.name || !customer?.email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const fmt = format || 'video';
  const bookingId = `local_${Date.now()}`;

  const supabase = getSupabase();
  if (supabase) {
    try {
      const session_type = toDbSessionType(String(sessionType).toLowerCase());
      const session_format = toDbFormat(String(fmt).toLowerCase());
      const row = {
        user_id: userId || null,
        session_type,
        session_format,
        duration_minutes: DURATION_BY_FORMAT[session_format] ?? 60,
        scheduled_date: date,
        scheduled_time: time,
        timezone: 'Asia/Kolkata',
        status: 'pending',
        calcom_booking_id: bookingId,
        calcom_booking_uid: null,
        customer_name: sanitize(customer.name),
        customer_email: String(customer.email).toLowerCase().trim(),
        customer_phone: customer.phone ? String(customer.phone).trim() : null,
        notes: customer.notes ? sanitize(customer.notes) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from('bookings').insert(row).select('id').single();
      if (error) {
        console.error('Supabase booking insert failed:', error.code, error.message, JSON.stringify(error.details));
        return res.status(500).json({
          success: false,
          error: 'Failed to save booking. Check server logs and docs/SUPABASE_SETUP.md (table + RLS).',
        });
      }
      console.log('Booking saved to DB:', data.id, 'user_id:', userId || '(guest)', 'email:', row.customer_email);
      return res.json({
        success: true,
        bookingId: data.id,
        databaseId: data.id,
        message: 'Booking created successfully',
        savedToDatabase: true,
      });
    } catch (err) {
      console.error('Booking insert error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to save booking.',
      });
    }
  }

  console.log('Booking mock (no DB) – add SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to .env to persist');
  res.json({
    success: true,
    bookingId,
    message: 'Booking created successfully (mock – set SUPABASE_SERVICE_ROLE_KEY in .env to save to DB)',
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
    message: 'Consent recorded (mock – set SUPABASE_* in .env to persist)',
  });
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
