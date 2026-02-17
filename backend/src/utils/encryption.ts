import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-dev-key-change-in-production';

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
