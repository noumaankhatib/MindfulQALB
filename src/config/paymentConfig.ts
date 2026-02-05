/**
 * Payment Gateway Configuration
 * 
 * This file controls the payment gateway behavior for testing and production.
 * Toggle PAYMENT_ENABLED to false to use mock payments during development.
 */

// ============================================================================
// PAYMENT GATEWAY TOGGLE
// ============================================================================
// Set to false to disable real payments and use mock success flow
// Set to true to enable real Razorpay/Stripe payments
// ============================================================================

export const PAYMENT_CONFIG = {
  /**
   * Master toggle for payment processing
   * - true: Real payments via Razorpay/Stripe (requires API keys)
   * - false: Mock payments for testing (simulates successful payment)
   */
  PAYMENT_ENABLED: false, // <-- Toggle this for testing vs production

  /**
   * Mock payment settings (only used when PAYMENT_ENABLED = false)
   */
  MOCK_SETTINGS: {
    // Simulate payment processing delay (milliseconds)
    PROCESSING_DELAY: 1500,
    
    // Simulate success rate (1.0 = 100% success, 0.8 = 80% success)
    SUCCESS_RATE: 1.0,
    
    // Show mock payment UI (false = instant success)
    SHOW_MOCK_UI: true,
  },

  /**
   * Environment-based overrides
   * Automatically enables payments in production
   */
  get isPaymentEnabled(): boolean {
    // Always enable in production
    if (import.meta.env.PROD) {
      return true;
    }
    // Use toggle value in development
    return this.PAYMENT_ENABLED;
  },

  /**
   * Get payment mode label for UI display
   */
  get modeLabel(): string {
    return this.isPaymentEnabled ? 'Live' : 'Test Mode';
  },

  /**
   * Check if we're in test/mock mode
   */
  get isTestMode(): boolean {
    return !this.isPaymentEnabled;
  },
};

// ============================================================================
// AVAILABILITY CHECK CONFIGURATION
// ============================================================================

export const AVAILABILITY_CONFIG = {
  /**
   * Enable availability checking before payment
   * When true, user must select an available slot before paying
   */
  REQUIRE_AVAILABILITY_CHECK: true,

  /**
   * Mock available slots for testing (when Cal.com is not set up)
   */
  USE_MOCK_AVAILABILITY: true,

  /**
   * Available time slots for mock mode
   */
  MOCK_SLOTS: [
    { time: '10:00 AM', available: true },
    { time: '11:00 AM', available: true },
    { time: '2:00 PM', available: true },
    { time: '3:00 PM', available: false },
    { time: '4:00 PM', available: true },
    { time: '5:00 PM', available: true },
  ],
};

// ============================================================================
// CONSENT CONFIGURATION
// ============================================================================

export const CONSENT_CONFIG = {
  /**
   * Require consent before booking
   */
  REQUIRE_CONSENT: true,

  /**
   * Store consent records in localStorage for compliance
   */
  STORE_CONSENT_LOCALLY: true,

  /**
   * Consent validity period (in days)
   * After this period, user needs to re-consent
   */
  CONSENT_VALIDITY_DAYS: 365,
};

export default PAYMENT_CONFIG;
