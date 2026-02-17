import Razorpay from 'razorpay';
import crypto from 'crypto';
import { RAZORPAY_CONFIG, isRazorpayConfigured, getPrice } from '../utils/config';

let razorpayInstance: Razorpay | null = null;

/**
 * Get or create Razorpay instance
 */
const getRazorpay = (): Razorpay => {
  if (!razorpayInstance) {
    if (!isRazorpayConfigured()) {
      throw new Error('Razorpay not configured');
    }
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_CONFIG.KEY_ID,
      key_secret: RAZORPAY_CONFIG.KEY_SECRET,
    });
  }
  return razorpayInstance;
};

/**
 * Create a Razorpay order
 */
export const createOrder = async (
  sessionType: string,
  format: string,
  receiptId?: string
): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}> => {
  const pricing = getPrice(sessionType, format);
  
  if (!pricing) {
    throw new Error('Invalid session type or format');
  }

  if (pricing.amount === 0) {
    throw new Error('Cannot create payment order for free session');
  }

  const razorpay = getRazorpay();
  
  const options = {
    amount: pricing.amount * 100, // Razorpay expects amount in paise
    currency: pricing.currency,
    receipt: receiptId || `receipt_${Date.now()}`,
    notes: {
      sessionType,
      format,
    },
  };

  const order = await razorpay.orders.create(options);

  return {
    orderId: order.id,
    amount: pricing.amount * 100,
    currency: pricing.currency,
    keyId: RAZORPAY_CONFIG.KEY_ID,
  };
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPayment = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  if (!isRazorpayConfigured()) {
    throw new Error('Razorpay not configured');
  }

  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_CONFIG.KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

/**
 * Check if Razorpay is configured
 */
export const isConfigured = (): boolean => {
  return isRazorpayConfigured();
};
