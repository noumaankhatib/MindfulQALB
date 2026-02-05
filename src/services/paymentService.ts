// Payment service for handling Razorpay (India) and Stripe (International) payments

import { SessionRecommendation } from '../data/chatbotFlow';
import { PAYMENT_CONFIG } from '../config/paymentConfig';

// Types
export interface PaymentConfig {
  razorpayKeyId: string;
  stripePublishableKey: string;
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

// Get API keys from environment variables
export const getPaymentConfig = (): PaymentConfig => ({
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
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

// Load Stripe script dynamically
export const loadStripeScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as unknown as Record<string, unknown>).Stripe) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Process Razorpay payment (for India)
export const processRazorpayPayment = async (
  session: SessionRecommendation,
  customerInfo: { name?: string; email?: string; phone?: string }
): Promise<PaymentResult> => {
  const config = getPaymentConfig();

  if (!config.razorpayKeyId) {
    return {
      success: false,
      error: 'Razorpay is not configured. Please contact support.',
    };
  }

  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    return {
      success: false,
      error: 'Failed to load payment gateway. Please try again.',
    };
  }

  return new Promise((resolve) => {
    const options: RazorpayOptions = {
      key: config.razorpayKeyId,
      amount: session.priceINR * 100, // Amount in paise
      currency: 'INR',
      name: 'MindfulQALB',
      description: `${session.title} - ${session.duration}`,
      prefill: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone,
      },
      theme: {
        color: '#8B7EC8', // Lavender theme color
      },
      handler: (response: RazorpayResponse) => {
        resolve({
          success: true,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
        });
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

// Process Stripe payment (for International)
// Note: For production, this should create a checkout session via your backend
export const processStripePayment = async (
  session: SessionRecommendation,
  _customerInfo: { name?: string; email?: string; phone?: string }
): Promise<PaymentResult> => {
  const config = getPaymentConfig();

  if (!config.stripePublishableKey) {
    return {
      success: false,
      error: 'Stripe is not configured. Please contact support.',
    };
  }

  const scriptLoaded = await loadStripeScript();
  if (!scriptLoaded) {
    return {
      success: false,
      error: 'Failed to load payment gateway. Please try again.',
    };
  }

  // For a full implementation, you would:
  // 1. Call your backend to create a Stripe Checkout Session
  // 2. Redirect to Stripe Checkout or use Stripe Elements
  
  // For now, we'll show a placeholder that indicates Stripe is ready
  // This should be replaced with actual Stripe Checkout integration
  
  return new Promise((resolve) => {
    // Simulating redirect to Stripe Checkout
    // In production, replace this with actual Stripe Checkout Session
    const stripeCheckoutUrl = `https://checkout.stripe.com/pay/cs_test_placeholder?session=${session.id}`;
    
    // For demo purposes, show an alert
    // In production, you would redirect or open Stripe Checkout
    const confirmed = window.confirm(
      `Stripe Checkout\n\n` +
      `Session: ${session.title}\n` +
      `Amount: $${session.priceUSD}\n\n` +
      `Note: For production, this will redirect to Stripe Checkout.\n` +
      `Click OK to simulate successful payment.`
    );

    if (confirmed) {
      resolve({
        success: true,
        paymentId: `stripe_${Date.now()}`,
      });
    } else {
      resolve({
        success: false,
        error: 'Payment cancelled by user',
      });
    }

    // Production code would look like:
    // window.location.href = stripeCheckoutUrl;
    console.log('Stripe checkout URL (for production):', stripeCheckoutUrl);
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

// Main payment processor - routes to appropriate gateway based on location and config
export const processPayment = async (
  session: SessionRecommendation,
  isIndia: boolean,
  customerInfo: { name?: string; email?: string; phone?: string }
): Promise<PaymentResult> => {
  // Check if payment is enabled
  if (!PAYMENT_CONFIG.isPaymentEnabled) {
    console.log('[Payment] Test mode - using mock payment');
    return processMockPayment(session, customerInfo);
  }

  // Real payment processing
  if (isIndia) {
    return processRazorpayPayment(session, customerInfo);
  } else {
    return processStripePayment(session, customerInfo);
  }
};

// Validate payment configuration
export const isPaymentConfigured = (isIndia: boolean): boolean => {
  // In test mode, always return true
  if (!PAYMENT_CONFIG.isPaymentEnabled) {
    return true;
  }

  const config = getPaymentConfig();
  if (isIndia) {
    return !!config.razorpayKeyId;
  }
  return !!config.stripePublishableKey;
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
  processStripePayment,
  processMockPayment,
  isPaymentConfigured,
  isTestMode,
  getPaymentModeLabel,
  getPaymentConfig,
};
