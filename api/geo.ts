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
    const resp = await fetch(IPAPI_URL, { signal: AbortSignal.timeout(5000) });
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
