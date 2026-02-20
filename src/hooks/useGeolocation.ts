import { useState, useEffect } from 'react';

interface GeolocationState {
  country: string | null;
  countryCode: string | null;
  isIndia: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useGeolocation = (): GeolocationState => {
  // Default to India since this is an India-focused therapy service
  const [state, setState] = useState<GeolocationState>({
    country: 'India',
    countryCode: 'IN',
    isIndia: true,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // For now, always use India pricing (India-focused service)
    // Clear any old cached non-India data
    try {
      localStorage.removeItem('mq_userCountry');
    } catch {
      // Storage not available
    }
    
    // Set to India immediately
    setState({
      country: 'India',
      countryCode: 'IN',
      isIndia: true,
      isLoading: false,
      error: null,
    });
  }, []);

  return state;
};

// Helper function to format price based on location
// Overload: (amount, isIndia) for simple display, or (priceINR, priceUSD, isIndia) for session pricing
export function formatPrice(amount: number, isIndia: boolean): string;
export function formatPrice(priceINR: number, _priceUSD: number, isIndia: boolean): string;
export function formatPrice(
  amountOrPriceINR: number,
  priceUSDOrIsIndia: number | boolean,
  _isIndia?: boolean
): string {
  const amount =
    typeof priceUSDOrIsIndia === 'boolean' ? amountOrPriceINR : amountOrPriceINR;
  return `₹${amount.toLocaleString('en-IN')}`;
}

// Helper function to get currency code
export const getCurrency = (_isIndia: boolean): 'INR' | 'USD' => {
  return 'INR'; // Always return INR for now
};

// Helper function to get price in smallest currency unit (for payment gateways)
export const getPriceInSmallestUnit = (
  priceINR: number,
  _priceUSD: number,
  _isIndia: boolean
): number => {
  // Razorpay expects paise (1 INR = 100 paise)
  return priceINR * 100;
};

export default useGeolocation;
