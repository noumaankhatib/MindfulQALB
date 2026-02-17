import type { VercelRequest, VercelResponse } from '@vercel/node';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://mindfulqalb.com',
  'https://www.mindfulqalb.com',
  'https://mindful-qalb.vercel.app',
  'https://mindfulqalb.vercel.app',
  // Add staging URLs
  'https://mindfulqalb-staging.vercel.app',
  // Local development
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

// Get production URL from environment
const VERCEL_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
if (VERCEL_URL && !ALLOWED_ORIGINS.includes(VERCEL_URL)) {
  ALLOWED_ORIGINS.push(VERCEL_URL);
}

/**
 * Set CORS headers with origin validation
 */
export const setCorsHeaders = (req: VercelRequest, res: VercelResponse): void => {
  const origin = req.headers.origin as string | undefined;
  
  // Check if origin is allowed
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0];
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

/**
 * Handle CORS preflight request
 * Returns true if this was a preflight request (already handled)
 */
export const handleCorsPrelight = (req: VercelRequest, res: VercelResponse): boolean => {
  setCorsHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
};

/**
 * Validate that the request method is allowed
 */
export const validateMethod = (
  req: VercelRequest, 
  res: VercelResponse, 
  allowedMethods: string[]
): boolean => {
  if (!allowedMethods.includes(req.method || '')) {
    res.status(405).json({ error: 'Method not allowed' });
    return false;
  }
  return true;
};
