import { neon } from '@neondatabase/serverless';
import { createHash, randomBytes } from 'crypto';
import type { Tenant, ApiKey, TenantContext } from '../types';

// Platform database connection
const sql = neon(process.env.PLATFORM_DATABASE_URL!);

/**
 * Generate a new API key
 *
 * Format: upg_{environment}_{32-char-random}
 * Example: upg_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
 */
export function generateApiKey(environment: 'live' | 'test' = 'live'): {
  plainKey: string;
  keyPrefix: string;
  keyHash: string;
} {
  const randomPart = randomBytes(24).toString('base64url');
  const plainKey = `upg_${environment}_${randomPart}`;
  const keyPrefix = `upg_${environment}_${randomPart.slice(0, 4)}`;
  const keyHash = hashApiKey(plainKey);

  return { plainKey, keyPrefix, keyHash };
}

/**
 * Hash an API key for storage
 */
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Validate an API key and return the tenant context
 */
export async function validateApiKey(apiKey: string): Promise<TenantContext | null> {
  // Quick format validation
  if (!apiKey || !apiKey.startsWith('upg_')) {
    return null;
  }

  const keyHash = hashApiKey(apiKey);

  try {
    const result = await sql`
      SELECT
        t.id as tenant_id,
        t.name as tenant_name,
        t.slug as tenant_slug,
        t.neon_branch_id,
        t.database_url_encrypted,
        t.plan,
        t.max_monthly_api_calls,
        t.max_experiments,
        t.max_users,
        t.status as tenant_status,
        t.settings,
        t.created_at as tenant_created_at,
        t.updated_at as tenant_updated_at,
        ak.id as api_key_id,
        ak.key_prefix,
        ak.key_hash,
        ak.name as api_key_name,
        ak.scopes,
        ak.rate_limit_per_minute,
        ak.is_active,
        ak.last_used_at,
        ak.expires_at,
        ak.created_at as api_key_created_at
      FROM api_keys ak
      JOIN tenants t ON ak.tenant_id = t.id
      WHERE ak.key_hash = ${keyHash}
        AND ak.is_active = true
        AND t.status = 'active'
        AND (ak.expires_at IS NULL OR ak.expires_at > NOW())
    `;

    if (result.length === 0) {
      return null;
    }

    const row = result[0];

    // Update last_used_at asynchronously (fire and forget)
    sql`UPDATE api_keys SET last_used_at = NOW() WHERE key_hash = ${keyHash}`.catch(
      (err) => console.error('Failed to update last_used_at:', err)
    );

    const tenant: Tenant = {
      id: row.tenant_id,
      name: row.tenant_name,
      slug: row.tenant_slug,
      neonBranchId: row.neon_branch_id,
      databaseUrl: decryptDatabaseUrl(row.database_url_encrypted),
      plan: row.plan,
      maxMonthlyApiCalls: row.max_monthly_api_calls,
      maxExperiments: row.max_experiments,
      maxUsers: row.max_users,
      status: row.tenant_status,
      settings: row.settings || {},
      createdAt: row.tenant_created_at,
      updatedAt: row.tenant_updated_at,
    };

    const apiKeyData: ApiKey = {
      id: row.api_key_id,
      tenantId: row.tenant_id,
      keyPrefix: row.key_prefix,
      keyHash: row.key_hash,
      name: row.api_key_name,
      scopes: row.scopes || ['sdk:read', 'sdk:write'],
      rateLimitPerMinute: row.rate_limit_per_minute,
      isActive: row.is_active,
      lastUsedAt: row.last_used_at,
      expiresAt: row.expires_at,
      createdAt: row.api_key_created_at,
    };

    return {
      tenant,
      apiKey: apiKeyData,
      scopes: apiKeyData.scopes,
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return null;
  }
}

/**
 * Check if the context has a required scope
 */
export function hasScope(context: TenantContext, requiredScope: string): boolean {
  // Check for exact match or wildcard
  return context.scopes.some((scope) => {
    if (scope === requiredScope) return true;
    // Check wildcard (e.g., 'sdk:*' matches 'sdk:read')
    const [scopePrefix] = scope.split(':');
    const [requiredPrefix] = requiredScope.split(':');
    return scope.endsWith(':*') && scopePrefix === requiredPrefix;
  });
}

/**
 * Decrypt the database URL (placeholder - implement with your encryption)
 */
function decryptDatabaseUrl(encrypted: string): string {
  // TODO: Implement actual decryption using ENCRYPTION_KEY env var
  // For MVP, we store URLs in plaintext (add encryption before production)
  return encrypted;
}

/**
 * Extract API key from request headers
 */
export function extractApiKey(request: Request): string | null {
  // Check X-API-Key header (preferred)
  const headerKey = request.headers.get('x-api-key');
  if (headerKey) return headerKey;

  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}
