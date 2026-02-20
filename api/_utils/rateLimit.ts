import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Simple in-memory rate limiter for Vercel serverless functions
 * 
 * NOTE: This implementation uses in-memory storage which resets on cold starts.
 * For production with high traffic, consider using:
 * - Upstash Redis (@upstash/ratelimit)
 * - Vercel KV
 * - Cloudflare Workers KV
 * 
 * This provides basic protection against burst attacks within a single
 * function instance lifetime.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60 * 1000; // Clean up every minute
let lastCleanup = Date.now();

const cleanupExpiredEntries = (): void => {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  keyPrefix: 'default',
};

const PAYMENT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  keyPrefix: 'payment',
};

const STRICT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  keyPrefix: 'strict',
};

/**
 * Get client identifier from request (for rate limiting).
 * Prefer x-real-ip (set by Vercel/proxy) over x-forwarded-for to reduce
 * spoofing risk — X-Forwarded-For can be set by the client.
 */
const getClientIdentifier = (req: VercelRequest): string => {
  const realIp = req.headers['x-real-ip'];
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
};

/**
 * Check rate limit for a request
 * Returns true if request is allowed, false if rate limited
 */
export const checkRateLimit = (
  req: VercelRequest,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetTime: number } => {
  cleanupExpiredEntries();
  
  const clientId = getClientIdentifier(req);
  const key = `${config.keyPrefix}:${clientId}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
    return { 
      allowed: true, 
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime 
    };
  }
  
  entry.count++;
  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  return { allowed, remaining, resetTime: entry.resetTime };
};

/**
 * Rate limit middleware that returns true if rate limited (request should stop)
 */
export const handleRateLimit = (
  req: VercelRequest,
  res: VercelResponse,
  config: RateLimitConfig = DEFAULT_CONFIG
): boolean => {
  const { allowed, remaining, resetTime } = checkRateLimit(req, config);
  
  res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
  
  if (!allowed) {
    res.status(429).json({
      error: 'Too many requests, please try again later.',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
    });
    return true;
  }
  
  return false;
};

/**
 * Preset rate limiters for different endpoint types
 */
export const rateLimiters = {
  default: (req: VercelRequest, res: VercelResponse) => 
    handleRateLimit(req, res, DEFAULT_CONFIG),
  
  payment: (req: VercelRequest, res: VercelResponse) => 
    handleRateLimit(req, res, PAYMENT_CONFIG),
  
  strict: (req: VercelRequest, res: VercelResponse) => 
    handleRateLimit(req, res, STRICT_CONFIG),
};
