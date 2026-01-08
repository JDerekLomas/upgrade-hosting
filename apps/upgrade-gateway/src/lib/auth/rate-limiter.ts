import type { TenantContext } from '../types';

/**
 * Simple in-memory rate limiter for Edge Functions
 *
 * For production, replace with:
 * - Upstash Redis
 * - Vercel KV
 * - Cloudflare Rate Limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (resets on cold start - acceptable for MVP)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
  lastCleanup = now;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a tenant/API key
 */
export function checkRateLimit(
  context: TenantContext,
  windowMs: number = 60 * 1000 // 1 minute window
): RateLimitResult {
  cleanup();

  const key = `rate:${context.apiKey.id}`;
  const limit = context.apiKey.rateLimitPerMinute;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // Create new window if needed
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
  }

  // Check if over limit
  if (entry.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment and store
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    limit,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000).toString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
