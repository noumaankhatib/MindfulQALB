/**
 * Input validation utilities for API endpoints
 */

// Allowed values
export const ALLOWED_SESSION_TYPES = ['individual', 'couples', 'family', 'free'] as const;
export const ALLOWED_FORMATS = ['chat', 'audio', 'video', 'call'] as const;

// Regex patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-()]{10,20}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{1,2}:\d{2}\s*(AM|PM)$/i;
const NAME_REGEX = /^[\p{L}\p{M}\s\-'.]{2,100}$/u;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: unknown): ValidationResult => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
};

/**
 * Validate phone number
 */
export const validatePhone = (phone: unknown): ValidationResult => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.length < 10 || cleaned.length > 15) {
    return { valid: false, error: 'Phone number must be 10-15 digits' };
  }
  if (!PHONE_REGEX.test(phone)) {
    return { valid: false, error: 'Invalid phone format' };
  }
  return { valid: true };
};

/**
 * Validate name
 */
export const validateName = (name: unknown): ValidationResult => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  if (name.trim().length > 100) {
    return { valid: false, error: 'Name is too long' };
  }
  if (!NAME_REGEX.test(name.trim())) {
    return { valid: false, error: 'Name contains invalid characters' };
  }
  return { valid: true };
};

/**
 * Validate session type
 */
export const validateSessionType = (sessionType: unknown): ValidationResult => {
  if (!sessionType || typeof sessionType !== 'string') {
    return { valid: false, error: 'Session type is required' };
  }
  if (!ALLOWED_SESSION_TYPES.includes(sessionType as typeof ALLOWED_SESSION_TYPES[number])) {
    return { valid: false, error: `Invalid session type. Allowed: ${ALLOWED_SESSION_TYPES.join(', ')}` };
  }
  return { valid: true };
};

/**
 * Validate format (chat/audio/video)
 */
export const validateFormat = (format: unknown): ValidationResult => {
  if (!format || typeof format !== 'string') {
    return { valid: false, error: 'Format is required' };
  }
  if (!ALLOWED_FORMATS.includes(format as typeof ALLOWED_FORMATS[number])) {
    return { valid: false, error: `Invalid format. Allowed: ${ALLOWED_FORMATS.join(', ')}` };
  }
  return { valid: true };
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const validateDate = (date: unknown): ValidationResult => {
  if (!date || typeof date !== 'string') {
    return { valid: false, error: 'Date is required' };
  }
  if (!DATE_REGEX.test(date)) {
    return { valid: false, error: 'Invalid date format. Use YYYY-MM-DD' };
  }
  // Check if date is valid
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }
  // Check if date is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsed < today) {
    return { valid: false, error: 'Date cannot be in the past' };
  }
  return { valid: true };
};

/**
 * Validate time format (HH:MM AM/PM)
 */
export const validateTime = (time: unknown): ValidationResult => {
  if (!time || typeof time !== 'string') {
    return { valid: false, error: 'Time is required' };
  }
  if (!TIME_REGEX.test(time)) {
    return { valid: false, error: 'Invalid time format. Use HH:MM AM/PM' };
  }
  return { valid: true };
};

/**
 * Validate consent version
 */
export const validateConsentVersion = (version: unknown): ValidationResult => {
  if (!version || typeof version !== 'string') {
    return { valid: false, error: 'Consent version is required' };
  }
  if (version.length > 20) {
    return { valid: false, error: 'Invalid consent version' };
  }
  return { valid: true };
};

/**
 * Validate acknowledgments array
 */
export const validateAcknowledgments = (acks: unknown): ValidationResult => {
  if (!acks || !Array.isArray(acks)) {
    return { valid: false, error: 'Acknowledgments are required' };
  }
  if (acks.length === 0) {
    return { valid: false, error: 'At least one acknowledgment is required' };
  }
  if (acks.some(a => typeof a !== 'string')) {
    return { valid: false, error: 'Invalid acknowledgment format' };
  }
  return { valid: true };
};

/**
 * Validate URL (for redirect URLs)
 */
export const validateRedirectUrl = (url: unknown, allowedBase: string): ValidationResult => {
  if (!url) {
    return { valid: true }; // Optional, will use default
  }
  if (typeof url !== 'string') {
    return { valid: false, error: 'Invalid URL format' };
  }
  try {
    const parsed = new URL(url);
    const baseUrl = new URL(allowedBase);
    if (parsed.origin !== baseUrl.origin) {
      return { valid: false, error: 'URL must be on the same domain' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL' };
  }
};

/**
 * Sanitize string input (basic XSS prevention)
 */
export const sanitizeString = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

/**
 * Validate notes field (optional, with length limit)
 */
export const validateNotes = (notes: unknown): ValidationResult => {
  if (notes === undefined || notes === null || notes === '') {
    return { valid: true };
  }
  if (typeof notes !== 'string') {
    return { valid: false, error: 'Notes must be a string' };
  }
  if (notes.length > 1000) {
    return { valid: false, error: 'Notes exceed maximum length of 1000 characters' };
  }
  return { valid: true };
};

/**
 * Validate customer object
 */
export const validateCustomer = (customer: unknown): ValidationResult => {
  if (!customer || typeof customer !== 'object') {
    return { valid: false, error: 'Customer information is required' };
  }
  
  const c = customer as Record<string, unknown>;
  
  const nameResult = validateName(c.name);
  if (!nameResult.valid) return nameResult;
  
  const emailResult = validateEmail(c.email);
  if (!emailResult.valid) return emailResult;
  
  const phoneResult = validatePhone(c.phone);
  if (!phoneResult.valid) return phoneResult;
  
  // Validate notes if provided
  if (c.notes !== undefined) {
    const notesResult = validateNotes(c.notes);
    if (!notesResult.valid) return notesResult;
  }
  
  return { valid: true };
};
