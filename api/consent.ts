import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { handleCorsPrelight, validateMethod } from './_utils/cors.js';
import { 
  validateSessionType, 
  validateEmail, 
  validateConsentVersion, 
  validateAcknowledgments 
} from './_utils/validation.js';
import { rateLimiters } from './_utils/rateLimit.js';

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
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  const requestId = corsResult as string;
  
  // Rate limiting
  if (rateLimiters.default(req, res)) return;
  
  if (!validateMethod(req, res, ['POST'])) return;

  try {
    const { sessionType, email, consentVersion, acknowledgments } = req.body;

    // Validate all inputs
    const sessionTypeResult = validateSessionType(sessionType);
    if (!sessionTypeResult.valid) {
      return res.status(400).json({ error: sessionTypeResult.error, requestId });
    }
    
    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      return res.status(400).json({ error: emailResult.error, requestId });
    }
    
    const versionResult = validateConsentVersion(consentVersion);
    if (!versionResult.valid) {
      return res.status(400).json({ error: versionResult.error, requestId });
    }
    
    const acksResult = validateAcknowledgments(acknowledgments);
    if (!acksResult.valid) {
      return res.status(400).json({ error: acksResult.error, requestId });
    }

    // Create consent record (in production, store in database)
    const consentId = generateConsentId();
    const consentRecord = {
      id: consentId,
      requestId,
      sessionType,
      emailHash: hashEmail(email),
      consentVersion,
      acknowledgmentsCount: acknowledgments.length,
      createdAt: new Date().toISOString(),
    };

    // Log consent record (in production, save to database)
    // Note: IP and user agent are intentionally not logged to minimize PII
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${requestId}] Consent recorded:`, consentRecord);
    }

    res.json({
      success: true,
      consentId,
      message: 'Consent recorded successfully',
      requestId,
    });
  } catch (error) {
    console.error(`[${requestId}] Consent error:`, error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({
      success: false,
      error: 'Failed to store consent',
      requestId,
    });
  }
}
