// Payment service for handling Razorpay payments

import { SessionRecommendation } from '../data/chatbotFlow';
import { PAYMENT_CONFIG } from '../config/paymentConfig';
import { safeParseJson } from '../utils/safeJson';


// Types
export interface PaymentConfig {
  razorpayKeyId: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
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

// Process Razorpay payment
export const processRazorpayPayment = async (
  session: SessionRecommendation,
  customerInfo: { name?: string; email?: string; phone?: string }
): Promise<PaymentResult> => {
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    return {
      success: false,
      error: 'Failed to load payment gateway. Please try again.',
    };
  }

  // SECURITY: Always create orders via backend API
  // This ensures server-side price verification and prevents price manipulation
  let orderId: string | undefined;
  let amount: number | undefined;
  let keyId: string | undefined;

  try {
    const response = await fetch(`/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionType: session.id?.split('-')[0] || 'individual',
        format: session.id?.split('-')[1] || 'video',
      }),
    });
    
    if (response.ok) {
      const data = await safeParseJson<{ isFree?: boolean; orderId?: string; amount?: number; keyId?: string }>(response);
      if (data.isFree) {
        return {
          success: true,
          paymentId: data.orderId,
          orderId: data.orderId,
        };
      }
      if (data.orderId == null || data.amount == null || !data.keyId) {
        return {
          success: false,
          error: 'Invalid response from payment server. Please try again.',
        };
      }
      orderId = data.orderId;
      amount = data.amount;
      keyId = data.keyId;
    } else {
      const errorData = await safeParseJson<{ error?: string }>(response);
      return {
        success: false,
        error: errorData.error || 'Failed to create payment order',
      };
    }
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
          const verifyResponse = await fetch(`/api/payments/verify`, {
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
          console.error('Payment verification error:', error);
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
  customerInfo: { name?: string; email?: string; phone?: string }
): Promise<PaymentResult> => {
  // Check if payment is enabled
  if (!PAYMENT_CONFIG.isPaymentEnabled) {
    // Test mode - using mock payment
    return processMockPayment(session, customerInfo);
  }

  // Real payment processing with Razorpay
  return processRazorpayPayment(session, customerInfo);
};

// Validate payment configuration
export const isPaymentConfigured = (_isIndia?: boolean): boolean => {
  // Always return true - the backend API handles Razorpay configuration
  // If backend is not configured, the payment request will fail gracefully
  return true;
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
