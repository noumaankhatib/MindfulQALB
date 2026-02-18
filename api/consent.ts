import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { handleCorsPrelight, validateMethod } from './_utils/cors.js';
import { 
  validateSessionType, 
  validateEmail, 
  validateConsentVersion, 
  validateAcknowledgments 
} from './_utils/validation.js';

// Simple hash for email (one-way)
const hashEmail = (email: string): string => {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
};

// Generate consent ID
const generateConsentId = (): string => {
  return `consent_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCorsPrelight(req, res)) return;
  if (!validateMethod(req, res, ['POST'])) return;

  try {
    const { sessionType, email, consentVersion, acknowledgments } = req.body;

    // Validate all inputs
    const sessionTypeResult = validateSessionType(sessionType);
    if (!sessionTypeResult.valid) {
      return res.status(400).json({ error: sessionTypeResult.error });
    }
    
    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      return res.status(400).json({ error: emailResult.error });
    }
    
    const versionResult = validateConsentVersion(consentVersion);
    if (!versionResult.valid) {
      return res.status(400).json({ error: versionResult.error });
    }
    
    const acksResult = validateAcknowledgments(acknowledgments);
    if (!acksResult.valid) {
      return res.status(400).json({ error: acksResult.error });
    }

    // Create consent record (in production, store in database)
    const consentId = generateConsentId();
    const consentRecord = {
      id: consentId,
      sessionType,
      emailHash: hashEmail(email),
      consentVersion,
      acknowledgmentsCount: acknowledgments.length,
      ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'],
      userAgent: req.headers['user-agent'],
      createdAt: new Date().toISOString(),
    };

    // Log consent record (in production, save to database)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Consent recorded:', consentRecord);
    }

    res.json({
      success: true,
      consentId,
      message: 'Consent recorded successfully',
    });
  } catch (error) {
    console.error('Consent error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store consent',
    });
  }
}
