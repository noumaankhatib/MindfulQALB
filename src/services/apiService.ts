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
 * Link a payment (by order ID) to a booking after creation (for refund-by-booking).
 */
export const linkPaymentToBooking = async (
  bookingId: string,
  razorpayOrderId: string
): Promise<ApiResponse<Record<string, never>>> => {
  if (!API_CONFIG.USE_BACKEND_API) {
    return { success: false, error: 'Backend API not configured' };
  }
  try {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/payments/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ razorpay_order_id: razorpayOrderId, booking_id: bookingId }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { success: false, error: (err as { error?: string }).error || 'Failed to link payment' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to link payment to booking' };
  }
};

/**
 * Request a refund (by booking_id or razorpay_payment_id). Applies 24h policy: full refund if 24+ hours before session, else 50%.
 */
export const requestRefund = async (params: {
  booking_id?: string;
  razorpay_payment_id?: string;
}): Promise<ApiResponse<{ refunded?: boolean; amount_paise?: number; full_refund?: boolean }>> => {
  if (!API_CONFIG.USE_BACKEND_API) {
    return { success: false, error: 'Backend API not configured' };
  }
  try {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/payments/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: (data as { error?: string }).error || 'Refund failed' };
    }
    return { success: true, data };
  } catch {
    return { success: false, error: 'Refund request failed' };
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

/**
 * Admin: update a user's profile (and optionally auth email).
 * Requires Authorization: Bearer <session.access_token> and caller must be admin.
 */
export const updateUserAdmin = async (
  accessToken: string,
  params: { userId: string; full_name?: string; phone?: string; role?: 'user' | 'admin' | 'therapist'; email?: string }
): Promise<ApiResponse<{ message?: string }>> => {
  if (!API_CONFIG.USE_BACKEND_API) {
    return { success: false, error: 'Backend API not configured' };
  }
  try {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/admin/update-user`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        userId: params.userId,
        ...(params.full_name !== undefined && { full_name: params.full_name }),
        ...(params.phone !== undefined && { phone: params.phone }),
        ...(params.role !== undefined && { role: params.role }),
        ...(params.email !== undefined && { email: params.email }),
      }),
    });
    const data = await response.json().catch(() => ({})) as { success?: boolean; message?: string; error?: string };
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to update user' };
    }
    return { success: true, data: { message: data.message } };
  } catch {
    return { success: false, error: 'Failed to update user' };
  }
};

/**
 * Admin: delete a user and all related data (payments, bookings, consent, profile, auth).
 * Requires Authorization: Bearer <session.access_token> and caller must be admin.
 */
export const deleteUserAdmin = async (
  accessToken: string,
  userId: string
): Promise<ApiResponse<{ message?: string }>> => {
  if (!API_CONFIG.USE_BACKEND_API) {
    return { success: false, error: 'Backend API not configured' };
  }
  try {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/admin/delete-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ userId }),
    });
    const data = await response.json().catch(() => ({})) as { success?: boolean; message?: string; error?: string };
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to delete user' };
    }
    return { success: true, data: { message: data.message } };
  } catch {
    return { success: false, error: 'Failed to delete user' };
  }
};
