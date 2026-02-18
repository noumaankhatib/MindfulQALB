/**
 * Local development server for API functions
 * Runs the API endpoints without requiring Vercel CLI login
 */

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = 3001;

// Razorpay configuration from environment
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Debug: Log if Razorpay keys are configured
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  console.log(`✅ Razorpay configured: ${RAZORPAY_KEY_ID.substring(0, 12)}...`);
} else {
  console.log('⚠️  Razorpay not configured - using mock mode');
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: 'local-development',
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

    const order = await razorpay.orders.create({
      amount: pricing * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

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
app.post('/api/payments/verify', (req, res) => {
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

// Create booking (mock)
app.post('/api/bookings', (req, res) => {
  const { sessionType, date, time, customer } = req.body;
  
  if (!sessionType || !date || !time || !customer?.name || !customer?.email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  res.json({
    success: true,
    bookingId: `booking_mock_${Date.now()}`,
    message: 'Booking created successfully (mock)',
  });
});

// Store consent (mock)
app.post('/api/consent', (req, res) => {
  const { sessionType, email, consentVersion, acknowledgments } = req.body;
  
  if (!sessionType || !email || !consentVersion || !acknowledgments?.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  res.json({
    success: true,
    consentId: `consent_mock_${Date.now()}`,
    message: 'Consent recorded (mock)',
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
