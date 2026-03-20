import { SessionRecommendation } from '../data/chatbotFlow';
import { PAYMENT_CONFIG } from '../config/paymentConfig';
import { safeParseJson } from '../utils/safeJson';
import { logError } from '../lib/logger';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function getApiBase(): string {
  const base = (typeof import.meta.env.VITE_BACKEND_URL === 'string' && import.meta.env.VITE_BACKEND_URL) || '/api';
  return base.replace(/\/$/, '');
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  /** Actual amount charged in smallest currency unit (paise or cents) */
  amountPaise?: number;
  /** Discount applied in smallest currency unit, if any */
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

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      close: () => void;
    };
  }
}

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

// Process Razorpay payment (supports INR and USD via Razorpay International)
export const processRazorpayPayment = async (
  session: SessionRecommendation,
  isIndia: boolean,
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

  const apiBase = getApiBase();
  const createOrderUrl = `${apiBase}/payments/create-order`;
  const verifyUrl = `${apiBase}/payments/verify`;

  const currency = isIndia ? 'INR' : 'USD';

  let orderId: string | undefined;
  let amount: number | undefined;
  let keyId: string | undefined;
  let orderCurrency: string | undefined;
  let paidAmount: number | undefined;
  let discountFromOrder: number | undefined;

  const sessionType = session.id?.split('-')[0] || 'individual';
  const format = session.id?.split('-')[1] || 'video';
  const rawCoupon = options?.couponCode?.trim() || '';
  if (rawCoupon && !/^[A-Z0-9_-]{1,32}$/i.test(rawCoupon)) {
    return { success: false, error: 'Invalid coupon code format.' };
  }
  const couponCodeToSend = rawCoupon ? rawCoupon.toUpperCase() : undefined;
  const body: Record<string, unknown> = { sessionType, format, currency };
  if (customerInfo.name) body.customerName = customerInfo.name;
  if (customerInfo.email) body.customerEmail = customerInfo.email;
  if (customerInfo.phone) body.customerPhone = customerInfo.phone;
  if (couponCodeToSend) {
    body.couponCode = couponCodeToSend;
    body.coupon_code = couponCodeToSend;
  }

  const fullPriceSmallest = isIndia
    ? (session.priceINR ?? 0) * 100
    : (session.priceUSD ?? 0) * 100;

  const callCreateOrder = async (): Promise<Response> => {
    if (import.meta.env.DEV && couponCodeToSend) {
      console.log('[payment] create-order request body (coupon included):', { ...body });
    }
    return fetch(createOrderUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  type CreateOrderResponse = { isFree?: boolean; orderId?: string; amount?: number; currency?: string; keyId?: string; discountPaise?: number; error?: string };

  try {
    let response = await callCreateOrder();
    let data = await safeParseJson<CreateOrderResponse>(response);

    if (response.ok && couponCodeToSend && fullPriceSmallest > 0 && data.amount != null && data.amount >= fullPriceSmallest) {
      response = await callCreateOrder();
      data = await safeParseJson<CreateOrderResponse>(response);
    }

    if (!response.ok) {
      const serverError =
        typeof data.error === 'string' && data.error
          ? data.error
          : 'Failed to create payment order';
      return { success: false, error: serverError };
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

    if (couponCodeToSend && fullPriceSmallest > 0 && data.amount >= fullPriceSmallest) {
      const couponReceived = response.headers.get('X-Coupon-Received');
      const discountApplied = response.headers.get('X-Discount-Applied');
      if (import.meta.env.DEV) {
        let hint = '';
        if (couponReceived === 'false') {
          hint = ' [DEV] Server did not receive the coupon. Check API proxy config.';
        } else if (couponReceived === 'true' && discountApplied === 'false') {
          hint = ' [DEV] Server received coupon but could not apply. Check coupons table.';
        }
        console.warn('[payment] Coupon not applied:', hint);
      }
      return {
        success: false,
        error: 'The discount could not be applied. Please remove the coupon and pay the full amount, or contact support.',
      };
    }

    orderId = data.orderId;
    amount = data.amount;
    keyId = data.keyId;
    orderCurrency = data.currency || currency;
    paidAmount = data.amount;
    discountFromOrder = typeof data.discountPaise === 'number' ? data.discountPaise : undefined;
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
    const rzpOptions: RazorpayOptions = {
      key: keyId,
      amount,
      currency: orderCurrency || currency,
      name: 'MindfulQALB',
      description: `${session.title} - ${session.duration}`,
      order_id: orderId,
      prefill: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone,
      },
      theme: {
        color: '#8B7EC8',
      },
      handler: async (response: RazorpayResponse) => {
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
            const vData = await safeParseJson<{ verified?: boolean }>(verifyResponse);
            if (vData.verified) {
              resolve({
                success: true,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amountPaise: paidAmount,
                discountPaise: discountFromOrder,
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

    const razorpay = new window.Razorpay(rzpOptions);
    razorpay.open();
  });
};

export const processMockPayment = async (
  _session: SessionRecommendation,
  _customerInfo: { name?: string; email?: string; phone?: string }
): Promise<PaymentResult> => {
  const { MOCK_SETTINGS } = PAYMENT_CONFIG;

  return new Promise((resolve) => {
    setTimeout(() => {
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

// Main payment processor — Razorpay for all (INR for India, USD for international)
export const processPayment = async (
  session: SessionRecommendation,
  isIndia: boolean,
  customerInfo: { name?: string; email?: string; phone?: string },
  paymentOptions?: { couponCode?: string }
): Promise<PaymentResult> => {
  if (!PAYMENT_CONFIG.isPaymentEnabled) {
    return processMockPayment(session, customerInfo);
  }

  return processRazorpayPayment(session, isIndia, customerInfo, paymentOptions);
};

export const isPaymentConfigured = (_isIndia?: boolean): boolean => {
  return true;
};

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

  try {
    const response = await fetch(`${getApiBase()}/coupons/validate`, {
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
    // Network error — fall through to Supabase RPC
  }

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

export const isTestMode = (): boolean => {
  return PAYMENT_CONFIG.isTestMode;
};

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
};
