import type { VercelRequest, VercelResponse } from '@vercel/node';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://mindfulqalb.com',
  'https://www.mindfulqalb.com',
  'https://mindfulqalb.vercel.app',
  'https://mindfulqalb.vercel.app',
  // Staging URLs
  'https://mindfulqalb-staging.vercel.app',
  'https://mindfulqalb-git-staging-noumaankhatibs-projects.vercel.app',
  'https://mindfulqalb-7av274gjg-noumaankhatibs-projects.vercel.app',
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
  
  // Match patterns like: mindfulqalb-*.vercel.app or mindfulqalb-*.vercel.app
  // More restrictive: only allow alphanumeric and single hyphens, no consecutive hyphens
  const vercelPreviewPattern = /^https:\/\/(mindfulqalb|mindfulqalb)(-[a-z0-9]+)*\.vercel\.app$/i;
  
  // More restrictive: require project name prefix to prevent attacker-controlled subdomains
  const projectPreviewPattern = /^https:\/\/mindfulqalb(-[a-z0-9]+)*-noumaankhatibs-projects\.vercel\.app$/i;
  
  return vercelPreviewPattern.test(origin) || projectPreviewPattern.test(origin);
};

/**
 * Generate a unique request ID for audit trails
 */
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
};

/**
 * Set security headers for all responses
 */
export const setSecurityHeaders = (res: VercelResponse, requestId: string): void => {
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
};

/**
 * Set CORS headers with origin validation
 */
export const setCorsHeaders = (req: VercelRequest, res: VercelResponse): string => {
  const origin = req.headers.origin as string | undefined;
  const requestId = generateRequestId();
  
  // Set security headers first
  setSecurityHeaders(res, requestId);
  
  // Check if origin is allowed (static list or dynamic Vercel preview URL)
  const isAllowed = origin && (ALLOWED_ORIGINS.includes(origin) || isVercelPreviewUrl(origin));
  const allowedOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0];
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  return requestId;
};

/**
 * Handle CORS preflight request
 * Returns requestId if not a preflight, or true/false for preflight handling
 */
export const handleCorsPrelight = (req: VercelRequest, res: VercelResponse): string | boolean => {
  const requestId = setCorsHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return requestId;
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
