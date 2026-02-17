import { Router } from 'express';
import { isCalComConfigured, isRazorpayConfigured } from '../utils/config';

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
    },
  });
});

export default router;
