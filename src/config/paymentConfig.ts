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
   * When Cal.com API is configured (VITE_CALCOM_API_KEY in .env),
   * real-time availability will be fetched from Cal.com
   */
  USE_MOCK_AVAILABILITY: true,

  /**
   * Available time slots for mock/fallback mode
   * These are used when Cal.com is not configured or API fails
   */
  MOCK_SLOTS: [
    { time: '10:00 AM', available: true },
    { time: '11:00 AM', available: true },
    { time: '12:00 PM', available: true },
    { time: '2:00 PM', available: true },
    { time: '3:00 PM', available: true },
    { time: '4:00 PM', available: true },
    { time: '5:00 PM', available: true },
  ],
};

// ============================================================================
// CAL.COM INTEGRATION
// ============================================================================
// 
// To enable real-time availability and prevent double-booking across devices:
// 
// 1. Create a Cal.com account: https://cal.com
// 2. Go to Settings > Developer > API Keys
// 3. Create a new API key with booking:write scope
// 4. Add to .env: VITE_CALCOM_API_KEY=your_api_key
// 5. Create event types in Cal.com (free-consultation, individual-therapy, etc.)
// 6. Update EVENT_TYPE_IDS in src/services/calcomService.ts with actual IDs
// 
// Without Cal.com configured, bookings are stored locally and won't sync
// across devices. Cal.com handles real-time availability and prevents
// double-booking automatically.
// ============================================================================

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
