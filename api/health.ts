import type { VercelRequest, VercelResponse } from '@vercel/node';

// Configuration check
const isCalComConfigured = () => !!process.env.CALCOM_API_KEY;
const isRazorpayConfigured = () => !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;
const isStripeConfigured = () => !!process.env.STRIPE_SECRET_KEY;

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (_req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      calcom: isCalComConfigured() ? 'configured' : 'not configured',
      razorpay: isRazorpayConfigured() ? 'configured' : 'not configured',
      stripe: isStripeConfigured() ? 'configured' : 'not configured',
    },
  });
}
