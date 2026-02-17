import { v4 as uuidv4 } from 'uuid';
import { encrypt, hashEmail } from '../utils/encryption';
import { BookingRequest, ConsentRequest } from '../types';

/**
 * In-memory storage for development
 * In production, replace with database (PostgreSQL, MongoDB, etc.)
 */

interface StoredBooking {
  id: string;
  sessionType: string;
  format: string;
  date: string;
  time: string;
  customerNameEncrypted: string;
  customerEmailHash: string;
  customerPhoneEncrypted: string;
  paymentId?: string;
  consentId?: string;
  calComBookingId?: string;
  createdAt: string;
}

interface StoredConsent {
  id: string;
  sessionType: string;
  emailHash: string;
  consentVersion: string;
  acknowledgments: string[];
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt: string;
}

// In-memory stores (replace with database in production)
const bookingsStore: Map<string, StoredBooking> = new Map();
const consentsStore: Map<string, StoredConsent> = new Map();

/**
 * Store a booking
 */
export const storeBooking = (
  booking: BookingRequest,
  calComBookingId?: string
): string => {
  const id = uuidv4();
  
  const storedBooking: StoredBooking = {
    id,
    sessionType: booking.sessionType,
    format: booking.format,
    date: booking.date,
    time: booking.time,
    customerNameEncrypted: encrypt(booking.customer.name),
    customerEmailHash: hashEmail(booking.customer.email),
    customerPhoneEncrypted: encrypt(booking.customer.phone),
    paymentId: booking.paymentId,
    consentId: booking.consentId,
    calComBookingId,
    createdAt: new Date().toISOString(),
  };

  bookingsStore.set(id, storedBooking);
  
  // In production, save to database here
  console.log(`Booking stored: ${id}`);
  
  return id;
};

/**
 * Get a booking by ID
 */
export const getBooking = (id: string): StoredBooking | undefined => {
  return bookingsStore.get(id);
};

/**
 * Store consent record
 */
export const storeConsent = (
  consent: ConsentRequest,
  ipAddress?: string,
  userAgent?: string
): string => {
  const id = uuidv4();
  
  // Consent valid for 1 year
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const storedConsent: StoredConsent = {
    id,
    sessionType: consent.sessionType,
    emailHash: hashEmail(consent.email),
    consentVersion: consent.consentVersion,
    acknowledgments: consent.acknowledgments,
    ipAddress,
    userAgent,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  consentsStore.set(id, storedConsent);
  
  // In production, save to database here
  console.log(`Consent stored: ${id}`);
  
  return id;
};

/**
 * Get consent by ID
 */
export const getConsent = (id: string): StoredConsent | undefined => {
  return consentsStore.get(id);
};

/**
 * Check if user has valid consent
 */
export const hasValidConsent = (email: string, sessionType: string): boolean => {
  const emailHash = hashEmail(email);
  
  for (const consent of consentsStore.values()) {
    if (
      consent.emailHash === emailHash &&
      consent.sessionType === sessionType &&
      new Date(consent.expiresAt) > new Date()
    ) {
      return true;
    }
  }
  
  return false;
};

/**
 * Clean up expired data (call periodically)
 */
export const cleanupExpiredData = (): void => {
  const now = new Date();
  
  for (const [id, consent] of consentsStore.entries()) {
    if (new Date(consent.expiresAt) < now) {
      consentsStore.delete(id);
      console.log(`Expired consent removed: ${id}`);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredData, 60 * 60 * 1000);
