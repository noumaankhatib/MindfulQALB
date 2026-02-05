import { useState, useEffect } from 'react';

interface GeolocationState {
  country: string | null;
  countryCode: string | null;
  isIndia: boolean;
  isLoading: boolean;
  error: string | null;
}

interface IpApiResponse {
  country: string;
  countryCode: string;
}

// Free IP geolocation API
const GEOLOCATION_API = 'https://ipapi.co/json/';

// Fallback API in case primary fails
const FALLBACK_API = 'https://ip-api.com/json/?fields=country,countryCode';

export const useGeolocation = (): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    country: null,
    countryCode: null,
    isIndia: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const detectCountry = async () => {
      // Check if we have cached result
      const cached = localStorage.getItem('userCountry');
      if (cached) {
        try {
          const { country, countryCode, timestamp } = JSON.parse(cached);
          // Cache valid for 24 hours
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            setState({
              country,
              countryCode,
              isIndia: countryCode === 'IN',
              isLoading: false,
              error: null,
            });
            return;
          }
        } catch {
          // Invalid cache, proceed with API call
        }
      }

      try {
        // Try primary API
        let response = await fetch(GEOLOCATION_API);
        
        if (!response.ok) {
          // Try fallback API
          response = await fetch(FALLBACK_API);
        }

        if (!response.ok) {
          throw new Error('Failed to detect location');
        }

        const data: IpApiResponse = await response.json();
        
        // Handle different API response formats
        const country = data.country || data.country;
        const countryCode = data.countryCode || (data as unknown as Record<string, string>).country_code || 'US';

        // Cache the result
        localStorage.setItem(
          'userCountry',
          JSON.stringify({
            country,
            countryCode,
            timestamp: Date.now(),
          })
        );

        setState({
          country,
          countryCode,
          isIndia: countryCode === 'IN',
          isLoading: false,
          error: null,
        });
      } catch (error) {
        // Default to international (non-India) if detection fails
        setState({
          country: null,
          countryCode: null,
          isIndia: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to detect location',
        });
      }
    };

    detectCountry();
  }, []);

  return state;
};

// Helper function to format price based on location
export const formatPrice = (priceINR: number, priceUSD: number, isIndia: boolean): string => {
  if (isIndia) {
    return `₹${priceINR.toLocaleString('en-IN')}`;
  }
  return `$${priceUSD}`;
};

// Helper function to get currency code
export const getCurrency = (isIndia: boolean): 'INR' | 'USD' => {
  return isIndia ? 'INR' : 'USD';
};

// Helper function to get price in smallest currency unit (for payment gateways)
export const getPriceInSmallestUnit = (
  priceINR: number,
  priceUSD: number,
  isIndia: boolean
): number => {
  // Razorpay expects paise (1 INR = 100 paise)
  // Stripe expects cents (1 USD = 100 cents)
  return isIndia ? priceINR * 100 : priceUSD * 100;
};

export default useGeolocation;
