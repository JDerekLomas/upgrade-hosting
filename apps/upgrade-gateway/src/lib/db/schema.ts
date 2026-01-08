import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  jsonb,
  uniqueIndex,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// TENANTS
// ============================================================================

export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 63 }).unique().notNull(),

    // Neon branch connection
    neonBranchId: varchar('neon_branch_id', { length: 255 }),
    databaseUrlEncrypted: text('database_url_encrypted'),

    // Plan & limits
    plan: varchar('plan', { length: 50 }).default('free').notNull(),
    maxMonthlyApiCalls: bigint('max_monthly_api_calls', { mode: 'number' }).default(10000).notNull(),
    maxExperiments: integer('max_experiments').default(3).notNull(),
    maxUsers: integer('max_users').default(100).notNull(),

    // Status
    status: varchar('status', { length: 20 }).default('active').notNull(),

    // Metadata
    settings: jsonb('settings').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('idx_tenants_slug').on(table.slug),
    statusIdx: index('idx_tenants_status').on(table.status),
  })
);

export const tenantsRelations = relations(tenants, ({ many }) => ({
  apiKeys: many(apiKeys),
  tenantUsers: many(tenantUsers),
  usageRecords: many(usageRecords),
}));

// ============================================================================
// API KEYS
// ============================================================================

export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // Key identification
    keyPrefix: varchar('key_prefix', { length: 16 }).notNull(),
    keyHash: varchar('key_hash', { length: 64 }).unique().notNull(),

    // Permissions
    name: varchar('name', { length: 255 }).notNull(),
    scopes: text('scopes').array().default(['sdk:read', 'sdk:write']).notNull(),

    // Rate limiting
    rateLimitPerMinute: integer('rate_limit_per_minute').default(1000).notNull(),

    // Status
    isActive: boolean('is_active').default(true).notNull(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by'),
  },
  (table) => ({
    tenantIdx: index('idx_api_keys_tenant').on(table.tenantId),
    hashIdx: uniqueIndex('idx_api_keys_hash').on(table.keyHash),
  })
);

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  tenant: one(tenants, {
    fields: [apiKeys.tenantId],
    references: [tenants.id],
  }),
}));

// ============================================================================
// TENANT USERS (Dashboard Access)
// ============================================================================

export const tenantUsers = pgTable(
  'tenant_users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // Identity (from SSO)
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }),
    avatarUrl: text('avatar_url'),

    // SSO provider
    provider: varchar('provider', { length: 20 }).notNull(), // google, github
    providerId: varchar('provider_id', { length: 255 }).notNull(),

    // Role within tenant
    role: varchar('role', { length: 20 }).default('member').notNull(), // owner, admin, member, viewer

    // Status
    isActive: boolean('is_active').default(true).notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('idx_tenant_users_tenant').on(table.tenantId),
    emailIdx: index('idx_tenant_users_email').on(table.email),
    tenantEmailUnique: uniqueIndex('idx_tenant_users_tenant_email').on(table.tenantId, table.email),
    providerUnique: uniqueIndex('idx_tenant_users_provider').on(table.provider, table.providerId),
  })
);

export const tenantUsersRelations = relations(tenantUsers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantUsers.tenantId],
    references: [tenants.id],
  }),
}));

// ============================================================================
// USAGE METERING
// ============================================================================

export const usageRecords = pgTable(
  'usage_records',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // Time bucketing (hourly)
    bucketHour: timestamp('bucket_hour', { withTimezone: true }).notNull(),

    // Counts
    apiCalls: bigint('api_calls', { mode: 'number' }).default(0).notNull(),
    assignmentCalls: bigint('assignment_calls', { mode: 'number' }).default(0).notNull(),
    logCalls: bigint('log_calls', { mode: 'number' }).default(0).notNull(),
    uniqueUsers: integer('unique_users').default(0).notNull(),

    // Cost tracking
    estimatedCostCents: integer('estimated_cost_cents').default(0).notNull(),
  },
  (table) => ({
    tenantTimeUnique: uniqueIndex('idx_usage_tenant_time').on(table.tenantId, table.bucketHour),
    tenantTimeIdx: index('idx_usage_tenant_time_desc').on(table.tenantId),
  })
);

export const usageRecordsRelations = relations(usageRecords, ({ one }) => ({
  tenant: one(tenants, {
    fields: [usageRecords.tenantId],
    references: [tenants.id],
  }),
}));

// ============================================================================
// MONTHLY USAGE ROLLUP
// ============================================================================

export const usageMonthly = pgTable(
  'usage_monthly',
  {
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    month: timestamp('month', { withTimezone: true }).notNull(), // First day of month

    totalApiCalls: bigint('total_api_calls', { mode: 'number' }).default(0).notNull(),
    totalUniqueUsers: integer('total_unique_users').default(0).notNull(),
    peakConcurrentExperiments: integer('peak_concurrent_experiments').default(0).notNull(),

    // Billing
    overageCalls: bigint('overage_calls', { mode: 'number' }).default(0).notNull(),
    billedAmountCents: integer('billed_amount_cents').default(0).notNull(),
    billingStatus: varchar('billing_status', { length: 20 }).default('pending').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.tenantId, table.month] }),
  })
);

// ============================================================================
// TENANT INVITATIONS
// ============================================================================

export const tenantInvitations = pgTable(
  'tenant_invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    email: varchar('email', { length: 255 }).notNull(),
    role: varchar('role', { length: 20 }).default('member').notNull(),

    invitedBy: uuid('invited_by')
      .notNull()
      .references(() => tenantUsers.id),
    tokenHash: varchar('token_hash', { length: 64 }).unique().notNull(),

    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tokenIdx: uniqueIndex('idx_invitations_token').on(table.tokenHash),
    tenantIdx: index('idx_invitations_tenant').on(table.tenantId),
  })
);

// ============================================================================
// UNIQUE USERS TRACKING (for accurate user counts)
// ============================================================================

export const uniqueUsersHourly = pgTable(
  'unique_users_hourly',
  {
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    bucketHour: timestamp('bucket_hour', { withTimezone: true }).notNull(),
    userHash: varchar('user_hash', { length: 64 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.tenantId, table.bucketHour, table.userHash] }),
  })
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

export type TenantUser = typeof tenantUsers.$inferSelect;
export type NewTenantUser = typeof tenantUsers.$inferInsert;

export type UsageRecord = typeof usageRecords.$inferSelect;
export type NewUsageRecord = typeof usageRecords.$inferInsert;
