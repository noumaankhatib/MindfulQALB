import CryptoJS from 'crypto-js';

// Require encryption key in production
const getEncryptionKey = (): string => {
  const key = process.env.ENCRYPTION_KEY;
  
  if (process.env.NODE_ENV === 'production' && !key) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is required in production. ' +
      'Generate a secure key using: openssl rand -base64 32'
    );
  }
  
  // Allow default key only in development
  return key || 'dev-only-key-not-for-production';
};

const ENCRYPTION_KEY = getEncryptionKey();

/**
 * Encrypt sensitive data
 */
export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

/**
 * Decrypt sensitive data
 */
export const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Hash email for lookups (one-way)
 */
export const hashEmail = (email: string): string => {
  return CryptoJS.SHA256(email.toLowerCase()).toString();
};

/**
 * Generate secure random ID
 */
export const generateSecureId = (): string => {
  return CryptoJS.lib.WordArray.random(16).toString();
};
