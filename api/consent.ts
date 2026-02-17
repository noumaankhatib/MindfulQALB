import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Simple hash for email
const hashEmail = (email: string): string => {
  return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
};

// Generate consent ID
const generateConsentId = (): string => {
  return `consent_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionType, email, consentVersion, acknowledgments } = req.body;

    // Validation
    if (!sessionType || !email || !consentVersion || !acknowledgments?.length) {
      return res.status(400).json({ error: 'Missing required fields' });
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
    console.log('Consent recorded:', consentRecord);

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
