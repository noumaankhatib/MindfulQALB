import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';

// Pricing configuration
const PRICING = {
  individual: {
    chat: { amount: 499, currency: 'INR' },
    audio: { amount: 899, currency: 'INR' },
    video: { amount: 1299, currency: 'INR' },
  },
  couples: {
    audio: { amount: 1499, currency: 'INR' },
    video: { amount: 1999, currency: 'INR' },
  },
  family: {
    audio: { amount: 1799, currency: 'INR' },
    video: { amount: 2499, currency: 'INR' },
  },
} as const;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(503).json({
      success: false,
      error: 'Razorpay not configured',
    });
  }

  try {
    const { sessionType, format } = req.body;

    if (!sessionType || !format) {
      return res.status(400).json({ error: 'sessionType and format are required' });
    }

    // Get price from server-side config (secure)
    const therapyPricing = PRICING[sessionType as keyof typeof PRICING];
    if (!therapyPricing) {
      return res.status(400).json({ error: 'Invalid session type' });
    }

    const formatPricing = therapyPricing[format as keyof typeof therapyPricing];
    if (!formatPricing) {
      return res.status(400).json({ error: 'Invalid format' });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: formatPricing.amount * 100, // Amount in paise
      currency: formatPricing.currency,
      receipt: `receipt_${Date.now()}`,
      notes: { sessionType, format },
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: formatPricing.amount * 100,
      currency: formatPricing.currency,
      keyId: keyId,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order',
    });
  }
}
