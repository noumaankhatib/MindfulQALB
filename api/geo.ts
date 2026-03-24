import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from './_utils/cors.js';
import { rateLimiters } from './_utils/rateLimit.js';

const IPAPI_URL = 'https://ipapi.co/json/';

/**
 * GET /api/geo — proxy to ipapi.co for geolocation (country).
 * Avoids CORS: ipapi.co does not send Access-Control-Allow-Origin for browser requests.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;

  if (rateLimiters.default(req, res)) return;
  if (!validateMethod(req, res, ['GET'])) return;

  try {
    // Forward the visitor's real IP so ipapi.co detects the correct country.
    // Vercel sets x-forwarded-for; fall back to x-real-ip.
    const forwarded = req.headers['x-forwarded-for'];
    const visitorIp = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0])?.trim()
      || (req.headers['x-real-ip'] as string | undefined)?.trim();

    const url = visitorIp ? `https://ipapi.co/${visitorIp}/json/` : IPAPI_URL;
    const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!resp.ok) {
      return res.status(resp.status).json({ error: `Upstream ${resp.status}` });
    }
    const data = await resp.json();
    return res.status(200).json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upstream error';
    return res.status(502).json({ error: message });
  }
}
