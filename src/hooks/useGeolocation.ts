import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  country: string | null;
  countryCode: string | null;
  isIndia: boolean;
  isLoading: boolean;
  error: string | null;
  setCountryOverride: (countryCode: string) => void;
}

const CACHE_KEY = 'mq_geolocation';
const OVERRIDE_KEY = 'mq_country_override';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Single in-flight fetch so multiple useGeolocation mounts don't each hit /api/geo (avoids 429). */
let geoFetchPromise: Promise<{ country: string; countryCode: string } | null> | null = null;

interface CachedGeo {
  country: string;
  countryCode: string;
  timestamp: number;
}

function readCache(): CachedGeo | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedGeo = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(country: string, countryCode: string): void {
  try {
    const data: CachedGeo = { country, countryCode, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable
  }
}

function readOverride(): string | null {
  try {
    return localStorage.getItem(OVERRIDE_KEY);
  } catch {
    return null;
  }
}

const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  IN: 'India',
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  AE: 'UAE',
  SG: 'Singapore',
  NZ: 'New Zealand',
};

function countryName(code: string): string {
  return COUNTRY_CODE_TO_NAME[code.toUpperCase()] || code.toUpperCase();
}

export const useGeolocation = (): GeolocationState => {
  const override = readOverride();
  const initialIsIndia = override ? override.toUpperCase() === 'IN' : true;

  const [state, setState] = useState<Omit<GeolocationState, 'setCountryOverride'>>({
    country: override ? countryName(override) : 'India',
    countryCode: override?.toUpperCase() || 'IN',
    isIndia: initialIsIndia,
    isLoading: !override,
    error: null,
  });

  useEffect(() => {
    if (readOverride()) return; // user has manual override; skip API

    const cached = readCache();
    if (cached) {
      setState({
        country: cached.country,
        countryCode: cached.countryCode,
        isIndia: cached.countryCode === 'IN',
        isLoading: false,
        error: null,
      });
      return;
    }

    let cancelled = false;

    const doFetch = async (): Promise<{ country: string; countryCode: string } | null> => {
      const raw = (typeof import.meta.env.VITE_BACKEND_URL === 'string' && import.meta.env.VITE_BACKEND_URL) || '';
      const apiBase = raw.replace(/\/$/, '');
      const geoPath = apiBase.endsWith('/api') ? '/geo' : '/api/geo';
      const geoUrl = apiBase ? `${apiBase}${geoPath}` : '/api/geo';
      const res = await fetch(geoUrl, { signal: AbortSignal.timeout(5000) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 429) writeCache('India', 'IN');
        throw new Error(`Geo API ${res.status}`);
      }
      const code: string = (data.country_code || 'IN').toUpperCase();
      const name: string = data.country_name || countryName(code);
      return { country: name, countryCode: code };
    };

    const run = async () => {
      if (!geoFetchPromise) geoFetchPromise = doFetch();
      try {
        const result = await geoFetchPromise;
        if (cancelled) return;
        if (result) {
          writeCache(result.country, result.countryCode);
          setState({
            country: result.country,
            countryCode: result.countryCode,
            isIndia: result.countryCode === 'IN',
            isLoading: false,
            error: null,
          });
        }
      } catch {
        if (cancelled) return;
        const cached = readCache();
        if (cached) {
          setState({
            country: cached.country,
            countryCode: cached.countryCode,
            isIndia: cached.countryCode === 'IN',
            isLoading: false,
            error: null,
          });
        } else {
          writeCache('India', 'IN');
          setState({
            country: 'India',
            countryCode: 'IN',
            isIndia: true,
            isLoading: false,
            error: 'Geolocation detection failed, defaulting to India',
          });
        }
      } finally {
        geoFetchPromise = null;
      }
    };

    run();
    return () => { cancelled = true; };
  }, []);

  const setCountryOverride = useCallback((code: string) => {
    const upper = code.toUpperCase();
    try {
      localStorage.setItem(OVERRIDE_KEY, upper);
      localStorage.removeItem(CACHE_KEY);
    } catch {
      // Storage unavailable
    }
    setState({
      country: countryName(upper),
      countryCode: upper,
      isIndia: upper === 'IN',
      isLoading: false,
      error: null,
    });
  }, []);

  return { ...state, setCountryOverride };
};

export function formatPrice(amount: number, isIndia: boolean): string;
export function formatPrice(priceINR: number, priceUSD: number, isIndia: boolean): string;
export function formatPrice(
  amountOrPriceINR: number,
  priceUSDOrIsIndia: number | boolean,
  maybeIsIndia?: boolean
): string {
  const isIndia =
    typeof priceUSDOrIsIndia === 'boolean' ? priceUSDOrIsIndia : !!maybeIsIndia;
  if (isIndia) {
    const amount =
      typeof priceUSDOrIsIndia === 'boolean' ? amountOrPriceINR : amountOrPriceINR;
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  const usd =
    typeof priceUSDOrIsIndia === 'number' ? priceUSDOrIsIndia : amountOrPriceINR;
  return `$${usd.toLocaleString('en-US')}`;
}

export const getCurrency = (isIndia: boolean): 'INR' | 'USD' => {
  return isIndia ? 'INR' : 'USD';
};

export const getPriceInSmallestUnit = (
  priceINR: number,
  priceUSD: number,
  isIndia: boolean
): number => {
  if (isIndia) return priceINR * 100; // paise
  return priceUSD * 100; // cents
};

export default useGeolocation;
