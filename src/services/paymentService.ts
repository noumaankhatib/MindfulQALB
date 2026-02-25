// Payment service for handling Razorpay payments

import { SessionRecommendation } from '../data/chatbotFlow';
import { PAYMENT_CONFIG } from '../config/paymentConfig';
import { safeParseJson } from '../utils/safeJson';
import { logError } from '../lib/logger';
import { supabase, isSupabaseConfigured } from '../lib/supabase';


// Types
export interface PaymentConfig {
  razorpayKeyId: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  /** Actual amount charged in paise (after coupon discount) */
  amountPaise?: number;
  /** Discount applied in paise, if any */
  discountPaise?: number;
  error?: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      close: () => void;
    };
  }
}

// Note: Razorpay key ID is now fetched from backend API during order creation
// This ensures the key is always in sync with the server configuration
export const getPaymentConfig = (): PaymentConfig => ({
  razorpayKeyId: '', // Populated from backend API response
});

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Process Razorpay payment (optional couponCode is applied server-side)
export const processRazorpayPayment = async (
  session: SessionRecommendation,
  customerInfo: { name?: string; email?: string; phone?: string },
  options?: { couponCode?: string }
): Promise<PaymentResult> => {
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    return {
      success: false,
      error: 'Failed to load payment gateway. Please try again.',
    };
  }

  // Same as apiService: VITE_BACKEND_URL in frontend .env (default /api for relative proxy)
  const base = (typeof import.meta.env.VITE_BACKEND_URL === 'string' && import.meta.env.VITE_BACKEND_URL) || '/api';
  const apiBase = base.replace(/\/$/, '');
  const createOrderUrl = `${apiBase}/payments/create-order`;
  const verifyUrl = `${apiBase}/payments/verify`;

  // SECURITY: Always create orders via backend API
  // This ensures server-side price verification and prevents price manipulation
  let orderId: string | undefined;
  let amount: number | undefined;
  let keyId: string | undefined;
  /** Amount actually charged in paise (discounted when coupon applied); set from create-order response */
  let paidAmountPaise: number | undefined;
  /** Discount applied in paise, when coupon was used */
  let discountPaiseFromOrder: number | undefined;

  const sessionType = session.id?.split('-')[0] || 'individual';
  const format = session.id?.split('-')[1] || 'video';
  const rawCoupon = options?.couponCode?.trim() || '';
  const couponCodeToSend = rawCoupon ? rawCoupon.toUpperCase() : undefined;
  const body: { sessionType: string; format: string; couponCode?: string; coupon_code?: string } = { sessionType, format };
  if (couponCodeToSend) {
    body.couponCode = couponCodeToSend;
    body.coupon_code = couponCodeToSend;
  }

  const fullPricePaise = (session.priceINR ?? 0) * 100;

  const callCreateOrder = async (): Promise<Response> => {
    if (import.meta.env.DEV && couponCodeToSend) {
      console.log('[payment] create-order request body (coupon included):', { ...body });
    }
    const bodyStr = JSON.stringify(body);
    const request = new Request(createOrderUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyStr,
    });
    return fetch(request);
  };

  try {
    let response = await callCreateOrder();
    let data = await safeParseJson<{ isFree?: boolean; orderId?: string; amount?: number; keyId?: string; discountPaise?: number; error?: string }>(response);

    if (response.ok && couponCodeToSend && fullPricePaise > 0 && data.amount != null && data.amount >= fullPricePaise) {
      response = await callCreateOrder();
      data = await safeParseJson<{ isFree?: boolean; orderId?: string; amount?: number; keyId?: string; discountPaise?: number; error?: string }>(response);
    }

    if (!response.ok) {
      const serverError =
        typeof data.error === 'string' && data.error
          ? data.error
          : 'Failed to create payment order';
      return {
        success: false,
        error: serverError,
      };
    }

    if (data.isFree) {
      return {
        success: true,
        paymentId: data.orderId,
        orderId: data.orderId,
        amountPaise: 0,
      };
    }
    if (data.orderId == null || data.amount == null || !data.keyId) {
      return {
        success: false,
        error: 'Invalid response from payment server. Please try again.',
      };
    }

    if (couponCodeToSend && fullPricePaise > 0 && data.amount >= fullPricePaise) {
      const couponReceived = response.headers.get('X-Coupon-Received');
      const discountApplied = response.headers.get('X-Discount-Applied');
      let hint = '';
      if (couponReceived === 'false') {
        hint = ' The server did not receive the coupon (check that the API is running at npm run dev:api and Vite proxy is used, or set VITE_BACKEND_URL=http://localhost:3001/api in .env).';
      } else if (couponReceived === 'true' && discountApplied === 'false') {
        hint = ' The server received the coupon but could not apply it (check Supabase coupons table and SUPABASE_SERVICE_ROLE_KEY in .env).';
      }
      return {
        success: false,
        error: `The discount could not be applied. Remove the coupon and pay the full amount, or start the API server (npm run dev:api) with Supabase configured and try again.${hint}`,
      };
    }

    orderId = data.orderId;
    amount = data.amount;
    keyId = data.keyId;
    paidAmountPaise = data.amount;
    discountPaiseFromOrder = typeof data.discountPaise === 'number' ? data.discountPaise : undefined;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment service unavailable',
    };
  }
  
  if (!keyId || !orderId || amount == null) {
    return {
      success: false,
      error: 'Payment configuration error. Please contact support.',
    };
  }

  return new Promise((resolve) => {
    const options: RazorpayOptions = {
      key: keyId,
      amount,
      currency: 'INR',
      name: 'MindfulQALB',
      description: `${session.title} - ${session.duration}`,
      order_id: orderId,
      prefill: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone,
      },
      theme: {
        color: '#8B7EC8', // Lavender theme color
      },
      handler: async (response: RazorpayResponse) => {
        // SECURITY: Always verify payment signature via backend
        // Never trust client-side payment confirmation without server verification
        if (!response.razorpay_signature || !response.razorpay_order_id) {
          resolve({
            success: false,
            error: 'Invalid payment response - missing verification data',
          });
          return;
        }

        try {
          const verifyResponse = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          
          if (verifyResponse.ok) {
            const data = await safeParseJson<{ verified?: boolean }>(verifyResponse);
            if (data.verified) {
              resolve({
                success: true,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amountPaise: paidAmountPaise,
                discountPaise: discountPaiseFromOrder,
              });
            } else {
              resolve({
                success: false,
                error: 'Payment verification failed - signature mismatch',
              });
            }
          } else {
            resolve({
              success: false,
              error: 'Payment verification failed - server error',
            });
          }
        } catch (error) {
          logError('Payment verification error', error);
          resolve({
            success: false,
            error: 'Payment verification failed - please contact support',
          });
        }
      },
      modal: {
        ondismiss: () => {
          resolve({
            success: false,
            error: 'Payment cancelled by user',
          });
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  });
};

// Mock payment processor (for testing when payment is disabled)
export const processMockPayment = async (
  _session: SessionRecommendation,
  _customerInfo: { name?: string; email?: string; phone?: string }
): Promise<PaymentResult> => {
  const { MOCK_SETTINGS } = PAYMENT_CONFIG;

  return new Promise((resolve) => {
    // Simulate processing delay
    setTimeout(() => {
      // Simulate success rate
      const isSuccess = Math.random() < MOCK_SETTINGS.SUCCESS_RATE;

      if (isSuccess) {
        resolve({
          success: true,
          paymentId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          orderId: `order_mock_${Date.now()}`,
        });
      } else {
        resolve({
          success: false,
          error: 'Payment failed (simulated failure for testing)',
        });
      }
    }, MOCK_SETTINGS.PROCESSING_DELAY);
  });
};

// Main payment processor - uses Razorpay for all payments
export const processPayment = async (
  session: SessionRecommendation,
  _isIndia: boolean, // Kept for API compatibility, but always uses Razorpay
  customerInfo: { name?: string; email?: string; phone?: string },
  paymentOptions?: { couponCode?: string }
): Promise<PaymentResult> => {
  // Check if payment is enabled
  if (!PAYMENT_CONFIG.isPaymentEnabled) {
    // Test mode - using mock payment
    return processMockPayment(session, customerInfo);
  }

  // Real payment processing with Razorpay
  return processRazorpayPayment(session, customerInfo, paymentOptions);
};

// Validate payment configuration
export const isPaymentConfigured = (_isIndia?: boolean): boolean => {
  // Always return true - the backend API handles Razorpay configuration
  // If backend is not configured, the payment request will fail gracefully
  return true;
};

// Validate coupon: tries API first, then Supabase RPC (works when API returns 404 or is down)
export const validateCoupon = async (code: string, amountPaise: number): Promise<{
  valid: boolean;
  discountPaise?: number;
  message?: string;
  code?: string;
  couponId?: string;
}> => {
  const raw = (code || '').trim();
  if (!raw) return { valid: false, message: 'Coupon code is required' };

  const amount = Math.max(0, Math.floor(amountPaise));
  const mapRpcResult = (r: { valid?: boolean; discount_paise?: number; message?: string; code?: string; coupon_id?: string }) => ({
    valid: !!r.valid,
    discountPaise: r.discount_paise,
    message: typeof r.message === 'string' ? r.message : (!r.valid ? 'Invalid or inactive coupon code' : undefined),
    code: r.code,
    couponId: r.coupon_id,
  });

  // 1) Try API (local server or Vercel)
  try {
    const response = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: raw, amountPaise: amount }),
    });
    const data = await safeParseJson<{ valid?: boolean; discountPaise?: number; message?: string; code?: string; couponId?: string; error?: string }>(response);
    if (response.ok) {
      const message = typeof data.message === 'string' ? data.message : undefined;
      return {
        valid: !!data.valid,
        discountPaise: data.discountPaise,
        message: !data.valid ? (message || 'Invalid or inactive coupon code') : message,
        code: data.code,
        couponId: data.couponId,
      };
    }
    if (response.status !== 404 && response.status !== 502 && response.status !== 503) {
      const msg =
        (typeof data.message === 'string' && data.message) ||
        (typeof data.error === 'string' && data.error) ||
        (response.status === 503 ? 'Coupon service unavailable.' : null) ||
        (response.status === 500 ? 'Could not validate coupon. Run docs/supabase-coupons-migration.sql in Supabase.' : null) ||
        `Coupon validation failed (${response.status}). Please try again.`;
      return { valid: false, message: msg };
    }
  } catch {
    // Network error or API unreachable – fall through to Supabase RPC
  }

  // 2) Fallback: validate via Supabase RPC (works without API server)
  if (isSupabaseConfigured()) {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('validate_coupon', {
        p_code: raw,
        p_amount_paise: amount,
      } as any);
      if (rpcError) {
        if (rpcError.message?.includes('does not exist') || rpcError.code === '42883') {
          return { valid: false, message: 'Coupon validation not set up. Run docs/supabase-coupons-migration.sql in Supabase SQL Editor.' };
        }
        return { valid: false, message: rpcError.message || 'Could not validate coupon.' };
      }
      if (rpcData && typeof rpcData === 'object') {
        const r = rpcData as { valid?: boolean; discount_paise?: number; message?: string; code?: string; coupon_id?: string };
        return mapRpcResult(r);
      }
    } catch (e) {
      logError('Supabase validate_coupon RPC error', e);
    }
  }

  return { valid: false, message: 'Could not validate coupon. Run docs/supabase-coupons-migration.sql in Supabase and try again.' };
};

// Check if we're in test mode
export const isTestMode = (): boolean => {
  return PAYMENT_CONFIG.isTestMode;
};

// Get payment mode label
export const getPaymentModeLabel = (): string => {
  return PAYMENT_CONFIG.modeLabel;
};

export default {
  processPayment,
  processRazorpayPayment,
  processMockPayment,
  isPaymentConfigured,
  isTestMode,
  getPaymentModeLabel,
  getPaymentConfig,
};
