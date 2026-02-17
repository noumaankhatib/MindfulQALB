// Common types used across the backend

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface BookingRequest {
  sessionType: string;
  format: string;
  date: string;
  time: string;
  customer: CustomerInfo;
  paymentId?: string;
  consentId?: string;
}

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  confirmationUrl?: string;
  error?: string;
}

export interface PaymentOrderRequest {
  sessionType: string;
  format: string;
}

export interface PaymentOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface PaymentVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface ConsentRequest {
  sessionType: string;
  email: string;
  consentVersion: string;
  acknowledgments: string[];
}

export interface ConsentResponse {
  success: boolean;
  consentId: string;
}

// Pricing configuration
export interface SessionPrice {
  amount: number;
  currency: string;
  duration: string;
}

export interface SessionPricing {
  [format: string]: SessionPrice;
}

export interface TherapyPricing {
  [therapyType: string]: SessionPricing;
}

// Cal.com types
export interface CalComSlot {
  time: string;
}

export interface CalComAvailabilityResponse {
  slots: {
    [date: string]: CalComSlot[];
  };
}

export interface CalComBookingResponse {
  id: number;
  uid: string;
  title: string;
  startTime: string;
  endTime: string;
}
