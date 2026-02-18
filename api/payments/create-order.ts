import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from '../_utils/cors.js';
import { validateSessionType, validateFormat } from '../_utils/validation.js';

// Dynamic import for Razorpay (CommonJS module)
const getRazorpay = async () => {
  const Razorpay = (await import('razorpay')).default;
  return Razorpay;
};

// Pricing configuration (server-side only - secure)
const PRICING: Record<string, Record<string, number>> = {
  individual: { chat: 499, audio: 899, video: 1299 },
  couples: { audio: 1499, video: 1999 },
  family: { audio: 1799, video: 2499 },
  free: { chat: 0, audio: 0, video: 0 },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCorsPrelight(req, res)) return;
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
    const { sessionType, format } = req.body;

    // Validate inputs
    const sessionTypeResult = validateSessionType(sessionType);
    if (!sessionTypeResult.valid) {
      return res.status(400).json({ error: sessionTypeResult.error });
    }
    
    const formatResult = validateFormat(format);
    if (!formatResult.valid) {
      return res.status(400).json({ error: formatResult.error });
    }

    // Get price from server-side config (secure - prevents price manipulation)
    const therapyPricing = PRICING[sessionType];
    if (!therapyPricing) {
      return res.status(400).json({ error: 'Invalid session type for pricing' });
    }

    const amount = therapyPricing[format];
    if (amount === undefined) {
      return res.status(400).json({ error: 'Invalid format for this session type' });
    }

    // Free sessions don't need payment
    if (amount === 0) {
      return res.json({
        success: true,
        orderId: `free_${Date.now()}`,
        amount: 0,
        currency: 'INR',
        keyId: keyId,
        isFree: true,
      });
    }

    const Razorpay = await getRazorpay();
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { sessionType, format },
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: amount * 100,
      currency: 'INR',
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
