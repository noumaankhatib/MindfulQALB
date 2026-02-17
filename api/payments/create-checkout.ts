import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Pricing configuration (USD)
const PRICING_USD = {
  individual: {
    chat: { amount: 6 },
    audio: { amount: 11 },
    video: { amount: 16 },
  },
  couples: {
    audio: { amount: 18 },
    video: { amount: 24 },
  },
  family: {
    audio: { amount: 22 },
    video: { amount: 30 },
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

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return res.status(503).json({
      success: false,
      error: 'Stripe not configured',
    });
  }

  try {
    const { sessionType, format, customer, successUrl, cancelUrl } = req.body;

    if (!sessionType || !format || !customer?.email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get price from server-side config
    const therapyPricing = PRICING_USD[sessionType as keyof typeof PRICING_USD];
    if (!therapyPricing) {
      return res.status(400).json({ error: 'Invalid session type' });
    }

    const formatPricing = therapyPricing[format as keyof typeof therapyPricing];
    if (!formatPricing) {
      return res.status(400).json({ error: 'Invalid format' });
    }

    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Therapy - ${format.charAt(0).toUpperCase() + format.slice(1)}`,
              description: 'Online therapy session',
            },
            unit_amount: formatPricing.amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: customer.email,
      success_url: successUrl || `${process.env.VERCEL_URL || 'http://localhost:5173'}/booking/success`,
      cancel_url: cancelUrl || `${process.env.VERCEL_URL || 'http://localhost:5173'}/booking/cancel`,
      metadata: { sessionType, format },
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session',
    });
  }
}
