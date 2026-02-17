import dotenv from 'dotenv';
dotenv.config();

// Pricing configuration - matches frontend pricing
export const PRICING_CONFIG = {
  individual: {
    chat: { amount: 499, currency: 'INR', amountUSD: 6, duration: '30 min' },
    audio: { amount: 899, currency: 'INR', amountUSD: 11, duration: '45 min' },
    video: { amount: 1299, currency: 'INR', amountUSD: 16, duration: '60 min' },
  },
  couples: {
    audio: { amount: 1499, currency: 'INR', amountUSD: 18, duration: '60 min' },
    video: { amount: 1999, currency: 'INR', amountUSD: 24, duration: '90 min' },
  },
  family: {
    audio: { amount: 1799, currency: 'INR', amountUSD: 22, duration: '60 min' },
    video: { amount: 2499, currency: 'INR', amountUSD: 30, duration: '90 min' },
  },
  free: {
    video: { amount: 0, currency: 'INR', amountUSD: 0, duration: '15 min' },
  },
} as const;

// Cal.com configuration
export const CALCOM_CONFIG = {
  API_KEY: process.env.CALCOM_API_KEY || '',
  API_URL: 'https://api.cal.com/v1',
  USERNAME: process.env.CALCOM_USERNAME || 'mindfulqalb',
  EVENT_TYPE_IDS: JSON.parse(process.env.CALCOM_EVENT_TYPE_IDS || '{}') as Record<string, string>,
};

// Razorpay configuration
export const RAZORPAY_CONFIG = {
  KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
};

// Validation helpers
export const isCalComConfigured = (): boolean => {
  return !!CALCOM_CONFIG.API_KEY && !!CALCOM_CONFIG.USERNAME;
};

export const isRazorpayConfigured = (): boolean => {
  return !!RAZORPAY_CONFIG.KEY_ID && !!RAZORPAY_CONFIG.KEY_SECRET;
};

// Get price for session type and format
export const getPrice = (sessionType: string, format: string): { amount: number; currency: string; amountUSD: number } | null => {
  const therapyPricing = PRICING_CONFIG[sessionType as keyof typeof PRICING_CONFIG];
  if (!therapyPricing) return null;
  
  const formatPricing = therapyPricing[format as keyof typeof therapyPricing];
  if (!formatPricing) return null;
  
  return {
    amount: formatPricing.amount,
    currency: formatPricing.currency,
    amountUSD: formatPricing.amountUSD,
  };
};
