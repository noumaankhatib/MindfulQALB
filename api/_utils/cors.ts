import type { VercelRequest, VercelResponse } from '@vercel/node';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://mindfulqalb.com',
  'https://www.mindfulqalb.com',
  'https://mindful-qalb.vercel.app',
  'https://mindfulqalb.vercel.app',
  // Staging URLs
  'https://mindfulqalb-staging.vercel.app',
  'https://mindful-qalb-git-staging-noumaankhatibs-projects.vercel.app',
  'https://mindful-qalb-7av274gjg-noumaankhatibs-projects.vercel.app',
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

// Check if origin is a valid Vercel preview URL for this project
const isVercelPreviewUrl = (origin: string): boolean => {
  if (!origin) return false;
  // Match patterns like: mindful-qalb-*.vercel.app or mindfulqalb-*.vercel.app
  const vercelPreviewPattern = /^https:\/\/(mindful-qalb|mindfulqalb)(-[a-z0-9-]+)?\.vercel\.app$/i;
  // Also match noumaankhatibs-projects pattern
  const projectPreviewPattern = /^https:\/\/[a-z0-9-]+-noumaankhatibs-projects\.vercel\.app$/i;
  return vercelPreviewPattern.test(origin) || projectPreviewPattern.test(origin);
};

/**
 * Set CORS headers with origin validation
 */
export const setCorsHeaders = (req: VercelRequest, res: VercelResponse): void => {
  const origin = req.headers.origin as string | undefined;
  
  // Check if origin is allowed (static list or dynamic Vercel preview URL)
  const isAllowed = origin && (ALLOWED_ORIGINS.includes(origin) || isVercelPreviewUrl(origin));
  const allowedOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0];
  
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
