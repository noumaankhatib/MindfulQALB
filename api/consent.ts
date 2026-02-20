import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from './_utils/cors.js';
import {
  validateSessionType,
  validateEmail,
  validateConsentVersion,
  validateAcknowledgments,
} from './_utils/validation.js';
import { rateLimiters } from './_utils/rateLimit.js';
import { getSupabaseServer } from './_utils/supabase.js';

const toDbSessionType = (s: string): string =>
  s === 'couples' || s === 'family' ? s : 'individual';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  const requestId = corsResult as string;

  if (rateLimiters.default(req, res)) return;
  if (!validateMethod(req, res, ['POST'])) return;

  try {
    const { sessionType, email, consentVersion, acknowledgments } = req.body;

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

    const supabase = getSupabaseServer();
    if (supabase) {
      const row = {
        user_id: null as string | null,
        email: (email as string).toLowerCase().trim(),
        consent_version: String(consentVersion).trim(),
        session_type: toDbSessionType(String(sessionType).toLowerCase()),
        acknowledgments: Array.isArray(acknowledgments) ? acknowledgments : [],
        ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? null,
        user_agent: (req.headers['user-agent'] as string) ?? null,
        consented_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('consent_records')
        .insert(row)
        .select('id')
        .single();
      if (error) {
        console.error(`[${requestId}] Supabase consent insert failed:`, error.code, error.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to store consent',
          requestId,
        });
      }
      return res.json({
        success: true,
        consentId: data.id,
        message: 'Consent recorded successfully',
        requestId,
      });
    }

    res.status(503).json({
      success: false,
      error: 'Consent storage not configured (set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)',
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
