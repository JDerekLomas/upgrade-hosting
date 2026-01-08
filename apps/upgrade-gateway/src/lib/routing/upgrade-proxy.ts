import type { TenantContext } from '../types';

const UPGRADE_BACKEND_URL = process.env.UPGRADE_BACKEND_URL || 'http://localhost:3030';

/**
 * Proxy a request to the UpGrade backend with tenant context
 */
export async function proxyToUpgrade(
  request: Request,
  endpoint: string,
  context: TenantContext
): Promise<Response> {
  const url = `${UPGRADE_BACKEND_URL}${endpoint}`;

  // Clone the request body if present
  let body: string | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.text();
  }

  // Forward relevant headers, add tenant context
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-ID': context.tenant.id,
    'X-Tenant-Slug': context.tenant.slug,
    // Pass database URL for tenant-specific connection
    'X-Tenant-DB-URL': context.tenant.databaseUrl,
  };

  // Forward user identification headers from original request
  const userId = request.headers.get('x-user-id');
  if (userId) {
    headers['User-Id'] = userId;
  }

  try {
    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
    });

    // Return the response with CORS headers
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-User-Id');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({
        error: 'Backend unavailable',
        message: 'Failed to connect to UpGrade backend',
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Map SDK endpoints to UpGrade backend endpoints
 */
export const endpointMapping: Record<string, string> = {
  // Client SDK endpoints (v6)
  '/v1/init': '/api/v6/init',
  '/v1/assign': '/api/v6/assign',
  '/v1/mark': '/api/v6/mark',
  '/v1/log': '/api/v6/log',
  '/v1/featureflag': '/api/v6/featureflag',

  // Legacy endpoints (v5)
  '/v1/v5/init': '/api/v5/init',
  '/v1/v5/assign': '/api/v5/assign',
};

/**
 * Get the backend endpoint for a gateway path
 */
export function getBackendEndpoint(gatewayPath: string): string | null {
  return endpointMapping[gatewayPath] || null;
}
