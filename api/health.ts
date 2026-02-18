import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from './_utils/cors.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCorsPrelight(req, res)) return;
  if (!validateMethod(req, res, ['GET'])) return;

  // Don't expose service configuration in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ...(isProduction ? {} : {
      services: {
        calcom: !!process.env.CALCOM_API_KEY ? 'configured' : 'not configured',
        razorpay: !!process.env.RAZORPAY_KEY_ID ? 'configured' : 'not configured',
      },
    }),
  });
}
