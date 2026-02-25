/**
 * Therapy Pricing Configuration
 * 
 * This file contains all pricing for different therapy types and session formats.
 * Easy to update - just change the numbers below!
 * 
 * enabled: true/false - controls whether this format is available for this therapy type
 * priceINR: price in Indian Rupees
 * priceUSD: price in US Dollars
 */

export interface FormatPricing {
  priceINR: number;
  priceUSD: number;
  enabled: boolean;
  duration?: string;
}

export interface TherapyPricingConfig {
  [therapyType: string]: {
    [format: string]: FormatPricing;
  };
}

// ============================================================================
// PRICING CONFIGURATION - Easy to edit!
// Based on: Chat ₹499 (30min), Audio ₹899 (45min), Video ₹1299 (60min), Couples ₹1999 (90min)
// ============================================================================

export const THERAPY_PRICING: TherapyPricingConfig = {
  // Individual Therapy - All formats available
  individual: {
    chat: { 
      priceINR: 499, 
      priceUSD: 6, 
      enabled: true,
      duration: '30 min',
    },
    audio: { 
      priceINR: 899, 
      priceUSD: 11, 
      enabled: true,
      duration: '45 min',
    },
    video: { 
      priceINR: 1299, 
      priceUSD: 16, 
      enabled: true,
      duration: '60 min',
    },
  },

  // Couples Therapy - Chat NOT available (90 min sessions)
  couples: {
    chat: { 
      priceINR: 0, 
      priceUSD: 0, 
      enabled: false, // Chat not recommended for couples
      duration: '30 min',
    },
    audio: { 
      priceINR: 1499, 
      priceUSD: 18, 
      enabled: true,
      duration: '60 min',
    },
    video: { 
      priceINR: 1999, 
      priceUSD: 24, 
      enabled: true,
      duration: '90 min',
    },
  },

  // Family Counseling - Chat NOT available
  family: {
    chat: { 
      priceINR: 0, 
      priceUSD: 0, 
      enabled: false, // Chat not recommended for family
      duration: '30 min',
    },
    audio: { 
      priceINR: 1699, 
      priceUSD: 21, 
      enabled: true,
      duration: '60 min',
    },
    video: { 
      priceINR: 2499, 
      priceUSD: 30, 
      enabled: true,
      duration: '90 min',
    },
  },

  // Free Consultation - Fixed format (introductory call, 15 min)
  free: {
    call: { 
      priceINR: 0, 
      priceUSD: 0, 
      enabled: true,
      duration: '15 min',
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get pricing for a specific therapy type and format
 */
export const getPricing = (therapyType: string, format: string): FormatPricing | null => {
  const therapy = THERAPY_PRICING[therapyType];
  if (!therapy) return null;
  return therapy[format] || null;
};

/**
 * Check if a format is enabled for a therapy type
 */
export const isFormatEnabled = (therapyType: string, format: string): boolean => {
  const pricing = getPricing(therapyType, format);
  return pricing?.enabled ?? false;
};

/**
 * Get all available formats for a therapy type
 */
export const getAvailableFormats = (therapyType: string): string[] => {
  const therapy = THERAPY_PRICING[therapyType];
  if (!therapy) return [];
  return Object.entries(therapy)
    .filter(([, pricing]) => pricing.enabled)
    .map(([format]) => format);
};

/**
 * Get formatted price string
 */
export const getFormattedPrice = (
  therapyType: string, 
  format: string, 
  isIndia: boolean
): string => {
  const pricing = getPricing(therapyType, format);
  if (!pricing) return '—';
  if (!pricing.enabled) return 'Not available';
  if (pricing.priceINR === 0) return 'Free';
  
  return isIndia 
    ? `₹${pricing.priceINR.toLocaleString()}` 
    : `$${pricing.priceUSD}`;
};

/**
 * Get duration for a therapy type and format
 */
export const getDuration = (therapyType: string, format: string): string => {
  const pricing = getPricing(therapyType, format);
  return pricing?.duration || '45-60 min';
};

export default THERAPY_PRICING;
