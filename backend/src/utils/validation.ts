import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation middleware
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array().map(e => e.msg) 
    });
    return;
  }
  next();
};

// Common validation rules
export const availabilityValidation = [
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('sessionType')
    .isIn(['individual', 'couples', 'family', 'free'])
    .withMessage('Invalid session type'),
];

export const paymentOrderValidation = [
  body('sessionType')
    .isIn(['individual', 'couples', 'family'])
    .withMessage('Invalid session type'),
  body('format')
    .isIn(['chat', 'audio', 'video'])
    .withMessage('Invalid format'),
];

export const paymentVerifyValidation = [
  body('razorpay_order_id')
    .isString()
    .notEmpty()
    .withMessage('Order ID is required'),
  body('razorpay_payment_id')
    .isString()
    .notEmpty()
    .withMessage('Payment ID is required'),
  body('razorpay_signature')
    .isString()
    .notEmpty()
    .withMessage('Signature is required'),
];

export const bookingValidation = [
  body('sessionType')
    .isIn(['individual', 'couples', 'family', 'free'])
    .withMessage('Invalid session type'),
  body('format')
    .isIn(['chat', 'audio', 'video'])
    .withMessage('Invalid format'),
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('time')
    .matches(/^\d{1,2}:\d{2}\s*(AM|PM)$/i)
    .withMessage('Invalid time format'),
  body('customer.name')
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  body('customer.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('customer.phone')
    .matches(/^[+]?[\d\s-]{10,15}$/)
    .withMessage('Invalid phone number'),
];

export const consentValidation = [
  body('sessionType')
    .isIn(['individual', 'couples', 'family', 'free'])
    .withMessage('Invalid session type'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('consentVersion')
    .isString()
    .notEmpty()
    .withMessage('Consent version is required'),
  body('acknowledgments')
    .isArray({ min: 1 })
    .withMessage('At least one acknowledgment is required'),
];

export const stripeCheckoutValidation = [
  body('sessionType')
    .isIn(['individual', 'couples', 'family'])
    .withMessage('Invalid session type'),
  body('format')
    .isIn(['chat', 'audio', 'video'])
    .withMessage('Invalid format'),
  body('customer.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
];
