import { NextResponse } from 'next/server';
import { extractApiKey, validateApiKey, hasScope } from './auth/api-key-validator';
import { checkRateLimit, addRateLimitHeaders } from './auth/rate-limiter';
import { proxyToUpgrade } from './routing/upgrade-proxy';
import { trackUsage, checkUsageLimit } from './metering/usage-tracker';
import type { TenantContext } from './types';

export interface GatewayOptions {
  endpoint: string;
  requiredScope?: string;
  extractUserId?: (body: unknown) => string | undefined;
}

/**
 * Create a gateway handler for an SDK endpoint
 */
export function createGatewayHandler(options: GatewayOptions) {
  return async function handler(request: Request): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, X-User-Id, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Extract and validate API key
    const apiKey = extractApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key', message: 'Provide X-API-Key header or Bearer token' },
        { status: 401 }
      );
    }

    const context = await validateApiKey(apiKey);
    if (!context) {
      return NextResponse.json(
        { error: 'Invalid API key', message: 'API key is invalid, expired, or tenant is suspended' },
        { status: 401 }
      );
    }

    // Check scope
    if (options.requiredScope && !hasScope(context, options.requiredScope)) {
      return NextResponse.json(
        { error: 'Insufficient permissions', message: `Required scope: ${options.requiredScope}` },
        { status: 403 }
      );
    }

    // Check rate limit
    const rateLimitResult = checkRateLimit(context);
    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        { error: 'Rate limit exceeded', message: 'Too many requests, please slow down' },
        { status: 429 }
      );
      return addRateLimitHeaders(response, rateLimitResult);
    }

    // Check monthly usage limit
    const usageCheck = await checkUsageLimit(context);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Usage limit exceeded',
          message: `Monthly API call limit of ${usageCheck.limit} reached`,
          used: usageCheck.used,
          limit: usageCheck.limit,
        },
        { status: 429 }
      );
    }

    // Extract userId from body for tracking (if applicable)
    let userId: string | undefined;
    if (options.extractUserId && request.method !== 'GET') {
      try {
        const clonedRequest = request.clone();
        const body = await clonedRequest.json();
        userId = options.extractUserId(body);
      } catch {
        // Ignore parse errors, userId tracking is optional
      }
    }

    // Proxy to UpGrade backend
    const response = await proxyToUpgrade(request, options.endpoint, context);

    // Track usage asynchronously
    trackUsage(context, options.endpoint, userId).catch((err) =>
      console.error('Usage tracking failed:', err)
    );

    // Add rate limit headers to response
    return addRateLimitHeaders(response, rateLimitResult);
  };
}

/**
 * Extract userId from common request body shapes
 */
export function extractUserIdFromBody(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) return undefined;

  const obj = body as Record<string, unknown>;

  // Direct userId field
  if (typeof obj.userId === 'string') return obj.userId;

  // Nested in user object
  if (typeof obj.user === 'object' && obj.user !== null) {
    const user = obj.user as Record<string, unknown>;
    if (typeof user.id === 'string') return user.id;
  }

  return undefined;
}
