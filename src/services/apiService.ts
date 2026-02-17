/**
 * API Service - Abstraction layer for backend API calls
 * 
 * This service is designed to make the transition from direct third-party API calls
 * to secure backend API calls seamless. Currently operates in "direct mode" for
 * development, but can be switched to "backend mode" by setting USE_BACKEND_API.
 * 
 * SECURITY NOTE: For production, set USE_BACKEND_API=true and deploy the backend
 * according to docs/BACKEND_API_SPEC.md
 */

// Configuration
const API_CONFIG = {
  // Defaults to true - uses /api endpoints (works with both local server and Vercel)
  USE_BACKEND_API: import.meta.env.VITE_USE_BACKEND_API !== 'false',
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || '/api',
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch available time slots for a given date
 */
export const fetchAvailability = async (
  date: Date,
  sessionType: string
): Promise<ApiResponse<{ slots: { time: string; available: boolean }[] }>> => {
  if (API_CONFIG.USE_BACKEND_API) {
    // Secure backend API call
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: date.toISOString().split('T')[0],
          sessionType,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch {
      return { success: false, error: 'Failed to fetch availability' };
    }
  } else {
    // Direct mode - uses existing calcomService (for development only)
    // In production, this should be disabled
    return { success: false, error: 'Backend API not configured' };
  }
};

/**
 * Create a payment order (Razorpay)
 */
export const createPaymentOrder = async (
  sessionType: string,
  format: string
): Promise<ApiResponse<{ orderId: string; amount: number; currency: string; keyId: string }>> => {
  if (API_CONFIG.USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionType, format }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch {
      return { success: false, error: 'Failed to create payment order' };
    }
  } else {
    return { success: false, error: 'Backend API not configured' };
  }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPayment = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<ApiResponse<{ verified: boolean; paymentId: string }>> => {
  if (API_CONFIG.USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Payment verification failed');
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch {
      return { success: false, error: 'Payment verification failed' };
    }
  } else {
    return { success: false, error: 'Backend API not configured' };
  }
};

/**
 * Create Stripe checkout session
 */
export const createStripeCheckout = async (
  sessionType: string,
  format: string,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
): Promise<ApiResponse<{ sessionId: string; url: string }>> => {
  if (API_CONFIG.USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/payments/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType,
          format,
          customer: { email: customerEmail },
          successUrl,
          cancelUrl,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch {
      return { success: false, error: 'Failed to create checkout session' };
    }
  } else {
    return { success: false, error: 'Backend API not configured' };
  }
};

/**
 * Create a booking
 */
export const createBooking = async (booking: {
  sessionType: string;
  date: string;
  time: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  paymentId?: string;
  consentId?: string;
}): Promise<ApiResponse<{ bookingId: string; confirmationUrl?: string }>> => {
  if (API_CONFIG.USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch {
      return { success: false, error: 'Failed to create booking' };
    }
  } else {
    return { success: false, error: 'Backend API not configured' };
  }
};

/**
 * Store consent record
 */
export const storeConsent = async (consent: {
  sessionType: string;
  email: string;
  consentVersion: string;
  acknowledgments: string[];
}): Promise<ApiResponse<{ consentId: string }>> => {
  if (API_CONFIG.USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consent),
      });
      
      if (!response.ok) {
        throw new Error('Failed to store consent');
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch {
      return { success: false, error: 'Failed to store consent' };
    }
  } else {
    return { success: false, error: 'Backend API not configured' };
  }
};

/**
 * Check if backend API is configured and available
 */
export const isBackendConfigured = (): boolean => {
  return API_CONFIG.USE_BACKEND_API;
};

/**
 * Health check for backend API
 */
export const healthCheck = async (): Promise<boolean> => {
  if (!API_CONFIG.USE_BACKEND_API) return false;
  
  try {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};
