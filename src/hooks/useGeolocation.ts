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
    
    // Uncomment below to enable geolocation detection in the future
    /*
    const detectCountry = async () => {
      // Check if we have cached result (country code is not PII)
      const cached = localStorage.getItem('mq_userCountry');
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
        const countryCode = data.countryCode || (data as unknown as Record<string, string>).country_code || 'IN';

        // Cache the result (country code is not PII)
        try {
          localStorage.setItem(
            'mq_userCountry',
            JSON.stringify({
              country,
              countryCode,
              timestamp: Date.now(),
            })
          );
        } catch {
          // Storage not available
        }

        setState({
          country,
          countryCode,
          isIndia: countryCode === 'IN',
          isLoading: false,
          error: null,
        });
      } catch (error) {
        // Default to India if detection fails (India-focused service)
        setState({
          country: 'India',
          countryCode: 'IN',
          isIndia: true,
          isLoading: false,
          error: null,
        });
      }
    };

    detectCountry();
    */
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
  return priceINR * 100;
};

export default useGeolocation;
