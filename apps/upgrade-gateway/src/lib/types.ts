// Platform types for multi-tenant UpGrade

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  neonBranchId: string | null;
  databaseUrl: string;
  plan: 'free' | 'starter' | 'growth' | 'enterprise';
  maxMonthlyApiCalls: number;
  maxExperiments: number;
  maxUsers: number;
  status: 'active' | 'suspended' | 'pending_setup';
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKey {
  id: string;
  tenantId: string;
  keyPrefix: string;
  keyHash: string;
  name: string;
  scopes: string[];
  rateLimitPerMinute: number;
  isActive: boolean;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface TenantContext {
  tenant: Tenant;
  apiKey: ApiKey;
  scopes: string[];
}

export interface UsageRecord {
  tenantId: string;
  bucketHour: Date;
  apiCalls: number;
  assignmentCalls: number;
  logCalls: number;
  uniqueUsers: number;
}

// UpGrade SDK request/response types

export interface InitRequest {
  userId: string;
  group?: Record<string, string>;
  workingGroup?: Record<string, string>;
}

export interface AssignmentRequest {
  userId: string;
  context: string;
  site: string;
  target?: string;
}

export interface AssignmentResponse {
  condition: string | null;
  payload: unknown;
  experimentType: string | null;
}

export interface MarkRequest {
  userId: string;
  site: string;
  target?: string;
  status: 'condition applied' | 'condition failed to apply' | 'no condition assigned';
}

export interface LogRequest {
  userId: string;
  key: string;
  value: string | number | boolean;
}
