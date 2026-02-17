import { Router } from 'express';
import { isCalComConfigured, isRazorpayConfigured, isStripeConfigured } from '../utils/config';

const router = Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      calcom: isCalComConfigured() ? 'configured' : 'not configured',
      razorpay: isRazorpayConfigured() ? 'configured' : 'not configured',
      stripe: isStripeConfigured() ? 'configured' : 'not configured',
    },
  });
});

export default router;
