/**
 * Local development server for API functions
 * Runs the API endpoints without requiring Vercel CLI login
 */

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Pricing configuration
const PRICING = {
  individual: { chat: 499, audio: 899, video: 1299 },
  couples: { audio: 1499, video: 1999 },
  family: { audio: 1799, video: 2499 },
};

// Mock time slots
const getMockSlots = () => [
  { time: '10:00 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '12:00 PM', available: false },
  { time: '2:00 PM', available: true },
  { time: '3:00 PM', available: true },
  { time: '4:00 PM', available: true },
  { time: '5:00 PM', available: true },
];

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
  
  res.json({
    success: true,
    date,
    slots: getMockSlots(),
  });
});

// Create payment order (mock)
app.post('/api/payments/create-order', (req, res) => {
  const { sessionType, format } = req.body;
  
  if (!sessionType || !format) {
    return res.status(400).json({ error: 'sessionType and format required' });
  }
  
  const pricing = PRICING[sessionType]?.[format];
  if (!pricing) {
    return res.status(400).json({ error: 'Invalid session type or format' });
  }
  
  res.json({
    success: true,
    orderId: `order_mock_${Date.now()}`,
    amount: pricing * 100,
    currency: 'INR',
    keyId: 'rzp_test_mock',
    mode: 'mock',
  });
});

// Verify payment (mock - always succeeds in dev)
app.post('/api/payments/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id } = req.body;
  
  if (!razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({ error: 'Missing payment details' });
  }
  
  res.json({
    success: true,
    verified: true,
    paymentId: razorpay_payment_id,
    mode: 'mock',
  });
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
