import { Router, Request, Response } from 'express';
import { storeConsent, getConsent, hasValidConsent } from '../services/storageService';
import { consentValidation, validate } from '../utils/validation';
import { ConsentRequest } from '../types';

const router = Router();

/**
 * Store consent record
 * POST /api/consent
 */
router.post('/', consentValidation, validate, async (req: Request, res: Response) => {
  try {
    const consentRequest: ConsentRequest = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const consentId = storeConsent(consentRequest, ipAddress, userAgent);

    res.json({
      success: true,
      consentId,
      message: 'Consent recorded successfully',
    });
  } catch (error) {
    console.error('Store consent error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store consent',
    });
  }
});

/**
 * Check if consent exists
 * POST /api/consent/check
 */
router.post('/check', async (req, res) => {
  try {
    const { email, sessionType } = req.body;

    if (!email || !sessionType) {
      return res.status(400).json({
        success: false,
        error: 'Email and session type are required',
      });
    }

    const hasConsent = hasValidConsent(email, sessionType);

    res.json({
      success: true,
      hasConsent,
    });
  } catch (error) {
    console.error('Check consent error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check consent',
    });
  }
});

/**
 * Get consent by ID
 * GET /api/consent/:id
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const consent = getConsent(id);

    if (!consent) {
      return res.status(404).json({
        success: false,
        error: 'Consent record not found',
      });
    }

    // Return safe consent data
    res.json({
      success: true,
      consent: {
        id: consent.id,
        sessionType: consent.sessionType,
        consentVersion: consent.consentVersion,
        acknowledgmentsCount: consent.acknowledgments.length,
        createdAt: consent.createdAt,
        expiresAt: consent.expiresAt,
      },
    });
  } catch (error) {
    console.error('Get consent error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get consent',
    });
  }
});

export default router;
