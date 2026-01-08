/**
 * Seed script for development
 *
 * Creates a test tenant and API key for local development
 *
 * Usage:
 *   npx tsx scripts/seed-dev.ts
 */

import { neon } from '@neondatabase/serverless';
import { generateApiKey } from '../src/lib/auth/api-key-validator';

const DATABASE_URL = process.env.PLATFORM_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Error: PLATFORM_DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function seed() {
  console.log('Seeding development database...\n');

  // Create tables if they don't exist (run migrations first in production)
  await createTables();

  // Create development tenant
  const tenantId = await createDevTenant();

  // Create API key for the tenant
  const { plainKey } = await createApiKey(tenantId);

  console.log('\n✅ Development seed complete!\n');
  console.log('──────────────────────────────────────────────────');
  console.log('Test API Key (save this, it won\'t be shown again):');
  console.log(`  ${plainKey}`);
  console.log('──────────────────────────────────────────────────');
  console.log('\nUsage:');
  console.log(`  curl -H "X-API-Key: ${plainKey}" http://localhost:3001/api/v1/health`);
  console.log('');
}

async function createTables() {
  console.log('Creating tables...');

  await sql`
    CREATE TABLE IF NOT EXISTS tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(63) UNIQUE NOT NULL,
      neon_branch_id VARCHAR(255),
      database_url_encrypted TEXT,
      plan VARCHAR(50) DEFAULT 'free' NOT NULL,
      max_monthly_api_calls BIGINT DEFAULT 10000 NOT NULL,
      max_experiments INT DEFAULT 3 NOT NULL,
      max_users INT DEFAULT 100 NOT NULL,
      status VARCHAR(20) DEFAULT 'active' NOT NULL,
      settings JSONB DEFAULT '{}' NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      key_prefix VARCHAR(16) NOT NULL,
      key_hash VARCHAR(64) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      scopes TEXT[] DEFAULT ARRAY['sdk:read', 'sdk:write'] NOT NULL,
      rate_limit_per_minute INT DEFAULT 1000 NOT NULL,
      is_active BOOLEAN DEFAULT true NOT NULL,
      last_used_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      created_by UUID
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS usage_records (
      id BIGSERIAL PRIMARY KEY,
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      bucket_hour TIMESTAMPTZ NOT NULL,
      api_calls BIGINT DEFAULT 0 NOT NULL,
      assignment_calls BIGINT DEFAULT 0 NOT NULL,
      log_calls BIGINT DEFAULT 0 NOT NULL,
      unique_users INT DEFAULT 0 NOT NULL,
      estimated_cost_cents INT DEFAULT 0 NOT NULL,
      UNIQUE(tenant_id, bucket_hour)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tenant_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      avatar_url TEXT,
      provider VARCHAR(20) NOT NULL,
      provider_id VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'member' NOT NULL,
      is_active BOOLEAN DEFAULT true NOT NULL,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      UNIQUE(tenant_id, email),
      UNIQUE(provider, provider_id)
    )
  `;

  console.log('  Tables created ✓');
}

async function createDevTenant(): Promise<string> {
  console.log('Creating development tenant...');

  // Check if dev tenant already exists
  const existing = await sql`
    SELECT id FROM tenants WHERE slug = 'dev-tenant'
  `;

  if (existing.length > 0) {
    console.log('  Dev tenant already exists ✓');
    return existing[0].id;
  }

  // Create new dev tenant
  const result = await sql`
    INSERT INTO tenants (
      name,
      slug,
      database_url_encrypted,
      plan,
      max_monthly_api_calls,
      max_experiments,
      max_users,
      status
    ) VALUES (
      'Development Tenant',
      'dev-tenant',
      ${process.env.UPGRADE_DATABASE_URL || 'postgres://localhost:5432/upgrade_dev'},
      'growth',
      1000000,
      100,
      10000,
      'active'
    )
    RETURNING id
  `;

  console.log(`  Created tenant: ${result[0].id} ✓`);
  return result[0].id;
}

async function createApiKey(tenantId: string): Promise<{ plainKey: string }> {
  console.log('Creating API key...');

  // Generate new API key
  const { plainKey, keyPrefix, keyHash } = generateApiKey('live');

  // Check if we already have an active key for this tenant
  const existing = await sql`
    SELECT key_prefix FROM api_keys
    WHERE tenant_id = ${tenantId} AND is_active = true
    LIMIT 1
  `;

  if (existing.length > 0) {
    console.log(`  API key already exists (prefix: ${existing[0].key_prefix}...) ✓`);
    console.log('  (Creating a new one anyway for this session)');
  }

  // Insert new key
  await sql`
    INSERT INTO api_keys (
      tenant_id,
      key_prefix,
      key_hash,
      name,
      scopes,
      rate_limit_per_minute
    ) VALUES (
      ${tenantId},
      ${keyPrefix},
      ${keyHash},
      'Development Key',
      ARRAY['sdk:read', 'sdk:write', 'admin:read', 'admin:write'],
      10000
    )
  `;

  console.log(`  Created API key (prefix: ${keyPrefix}...) ✓`);
  return { plainKey };
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
