import Stripe from 'stripe';
import { STRIPE_CONFIG, isStripeConfigured, getPrice } from '../utils/config';

let stripeInstance: Stripe | null = null;

/**
 * Get or create Stripe instance
 */
const getStripe = (): Stripe => {
  if (!stripeInstance) {
    if (!isStripeConfigured()) {
      throw new Error('Stripe not configured');
    }
    stripeInstance = new Stripe(STRIPE_CONFIG.SECRET_KEY);
  }
  return stripeInstance;
};

/**
 * Create a Stripe Checkout session
 */
export const createCheckoutSession = async (
  sessionType: string,
  format: string,
  customerEmail: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<{
  sessionId: string;
  url: string;
}> => {
  const pricing = getPrice(sessionType, format);
  
  if (!pricing) {
    throw new Error('Invalid session type or format');
  }

  if (pricing.amount === 0) {
    throw new Error('Cannot create checkout for free session');
  }

  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Therapy - ${format.charAt(0).toUpperCase() + format.slice(1)}`,
            description: `Online therapy session`,
          },
          unit_amount: pricing.amountUSD * 100, // Stripe expects cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    customer_email: customerEmail,
    success_url: successUrl || STRIPE_CONFIG.SUCCESS_URL,
    cancel_url: cancelUrl || STRIPE_CONFIG.CANCEL_URL,
    metadata: {
      sessionType,
      format,
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
};

/**
 * Verify Stripe webhook signature
 */
export const verifyWebhook = (
  payload: string | Buffer,
  signature: string
): Stripe.Event => {
  if (!isStripeConfigured() || !STRIPE_CONFIG.WEBHOOK_SECRET) {
    throw new Error('Stripe webhook not configured');
  }

  const stripe = getStripe();
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    STRIPE_CONFIG.WEBHOOK_SECRET
  );
};

/**
 * Check if Stripe is configured
 */
export const isConfigured = (): boolean => {
  return isStripeConfigured();
};
