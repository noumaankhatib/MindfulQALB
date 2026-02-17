import { Router, Request, Response } from 'express';
import * as razorpayService from '../services/razorpayService';
import {
  paymentOrderValidation,
  paymentVerifyValidation,
  validate,
} from '../utils/validation';

const router = Router();

/**
 * Create Razorpay order
 * POST /api/payments/create-order
 */
router.post('/create-order', paymentOrderValidation, validate, async (req: Request, res: Response) => {
  try {
    const { sessionType, format } = req.body;

    if (!razorpayService.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Razorpay payment gateway not configured',
      });
    }

    const order = await razorpayService.createOrder(sessionType, format);
    
    res.json({
      success: true,
      ...order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment order',
    });
  }
});

/**
 * Verify Razorpay payment
 * POST /api/payments/verify
 */
router.post('/verify', paymentVerifyValidation, validate, async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpayService.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Razorpay payment gateway not configured',
      });
    }

    const isValid = razorpayService.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (isValid) {
      res.json({
        success: true,
        verified: true,
        paymentId: razorpay_payment_id,
      });
    } else {
      res.status(400).json({
        success: false,
        verified: false,
        error: 'Invalid payment signature',
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed',
    });
  }
});

/**
 * Get payment gateway status
 * GET /api/payments/status
 */
router.get('/status', (_req, res) => {
  res.json({
    razorpay: razorpayService.isConfigured(),
  });
});

export default router;
