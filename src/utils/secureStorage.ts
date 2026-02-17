/**
 * Secure Storage Utility
 * 
 * This module provides secure storage functions that:
 * 1. Use sessionStorage for PII (cleared when browser session ends)
 * 2. Store only minimal necessary data
 * 3. Implement data expiration for temporary data
 * 4. Hash sensitive data for verification without storing plaintext
 * 
 * IMPORTANT: For production, PII should be sent to a secure backend
 * and not stored client-side. This is an intermediate improvement
 * pending full backend implementation.
 */

// Configuration
const STORAGE_PREFIX = 'mq_';
const DEFAULT_EXPIRY_HOURS = 24;

interface StoredData<T> {
  data: T;
  expiry: number;
  version: number;
}

const CURRENT_VERSION = 1;

/**
 * Store data in sessionStorage with expiration
 * Data will be automatically cleared when browser session ends
 */
export const setSessionData = <T>(key: string, data: T, expiryHours = DEFAULT_EXPIRY_HOURS): void => {
  try {
    const storageItem: StoredData<T> = {
      data,
      expiry: Date.now() + expiryHours * 60 * 60 * 1000,
      version: CURRENT_VERSION,
    };
    sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(storageItem));
  } catch {
    // Storage failed - silently fail
  }
};

/**
 * Get data from sessionStorage, checking expiration
 */
export const getSessionData = <T>(key: string): T | null => {
  try {
    const item = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!item) return null;

    const storageItem: StoredData<T> = JSON.parse(item);
    
    // Check if data has expired
    if (Date.now() > storageItem.expiry) {
      sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return null;
    }
    
    return storageItem.data;
  } catch {
    return null;
  }
};

/**
 * Remove data from sessionStorage
 */
export const removeSessionData = (key: string): void => {
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch {
    // Silently fail
  }
};

/**
 * Clear all session data with our prefix
 */
export const clearAllSessionData = (): void => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  } catch {
    // Silently fail
  }
};

/**
 * Store booking reference (minimal data) - not full PII
 * This is used for showing confirmation to the user
 */
export interface BookingReference {
  bookingId: string;
  sessionType: string;
  date: string;
  time: string;
  // Only store first name for display, not full PII
  firstName: string;
  createdAt: string;
}

export const saveBookingReference = (booking: BookingReference): void => {
  const existingBookings = getSessionData<BookingReference[]>('bookingRefs') || [];
  existingBookings.push(booking);
  setSessionData('bookingRefs', existingBookings, 2); // 2 hour expiry
};

export const getBookingReferences = (): BookingReference[] => {
  return getSessionData<BookingReference[]>('bookingRefs') || [];
};

/**
 * Store consent acknowledgment (without full PII)
 * For compliance, actual consent records should be stored on a secure backend
 */
export interface ConsentAcknowledgment {
  sessionId: string;
  timestamp: string;
  consentVersion: string;
  acknowledged: boolean;
}

export const saveConsentAcknowledgment = (consent: ConsentAcknowledgment): void => {
  const existing = getSessionData<ConsentAcknowledgment[]>('consentAcks') || [];
  existing.push(consent);
  setSessionData('consentAcks', existing, 24); // 24 hour expiry
};

export const hasValidConsent = (sessionId: string): boolean => {
  const consents = getSessionData<ConsentAcknowledgment[]>('consentAcks') || [];
  return consents.some(c => c.sessionId === sessionId && c.acknowledged);
};

/**
 * Clean up expired data from localStorage (legacy cleanup)
 * Call this on app initialization to remove old PII data
 */
export const cleanupLegacyStorage = (): void => {
  try {
    // Remove old localStorage keys that contained PII
    const legacyKeys = ['bookings', 'consentRecords', 'chatbotCompleted'];
    legacyKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Silently fail
  }
};

/**
 * Simple hash function for verification purposes
 * NOT cryptographic - just for client-side verification
 */
export const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};
