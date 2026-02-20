import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from './_utils/cors.js';
import { rateLimiters } from './_utils/rateLimit.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  const requestId = corsResult as string;
  
  // Rate limiting (lenient for health checks)
  if (rateLimiters.default(req, res)) return;
  
  if (!validateMethod(req, res, ['GET'])) return;

  // Don't expose service configuration in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    requestId,
    ...(isProduction ? {} : {
      services: {
        calcom: !!process.env.CALCOM_API_KEY ? 'configured' : 'not configured',
        razorpay: !!process.env.RAZORPAY_KEY_ID ? 'configured' : 'not configured',
        supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) ? 'configured' : 'not configured',
      },
    }),
  });
}
