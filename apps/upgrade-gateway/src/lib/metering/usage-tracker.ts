import { neon } from '@neondatabase/serverless';
import type { TenantContext } from '../types';

const sql = neon(process.env.PLATFORM_DATABASE_URL!);

/**
 * Track API usage for a tenant
 *
 * Uses hourly bucketing for efficient aggregation.
 * This is called asynchronously after each request.
 */
export async function trackUsage(
  context: TenantContext,
  endpoint: string,
  userId?: string
): Promise<void> {
  try {
    // Determine the type of call
    const isAssignment = endpoint.includes('/assign');
    const isLog = endpoint.includes('/log');

    // Get the current hour bucket
    const bucketHour = new Date();
    bucketHour.setMinutes(0, 0, 0);

    // Upsert usage record
    await sql`
      INSERT INTO usage_records (
        tenant_id,
        bucket_hour,
        api_calls,
        assignment_calls,
        log_calls
      )
      VALUES (
        ${context.tenant.id},
        ${bucketHour.toISOString()},
        1,
        ${isAssignment ? 1 : 0},
        ${isLog ? 1 : 0}
      )
      ON CONFLICT (tenant_id, bucket_hour)
      DO UPDATE SET
        api_calls = usage_records.api_calls + 1,
        assignment_calls = usage_records.assignment_calls + ${isAssignment ? 1 : 0},
        log_calls = usage_records.log_calls + ${isLog ? 1 : 0}
    `;

    // Track unique users separately if userId provided
    if (userId) {
      await trackUniqueUser(context.tenant.id, bucketHour, userId);
    }
  } catch (error) {
    // Log but don't fail the request
    console.error('Failed to track usage:', error);
  }
}

/**
 * Track unique users per hour using a separate tracking table
 */
async function trackUniqueUser(
  tenantId: string,
  bucketHour: Date,
  userId: string
): Promise<void> {
  try {
    // Use a hash of the userId for privacy
    const userHash = await hashUserId(userId);

    await sql`
      INSERT INTO unique_users_hourly (
        tenant_id,
        bucket_hour,
        user_hash
      )
      VALUES (
        ${tenantId},
        ${bucketHour.toISOString()},
        ${userHash}
      )
      ON CONFLICT (tenant_id, bucket_hour, user_hash) DO NOTHING
    `;
  } catch (error) {
    // This table may not exist yet - that's OK for MVP
    console.error('Failed to track unique user:', error);
  }
}

/**
 * Hash a user ID for privacy in analytics
 */
async function hashUserId(userId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if tenant has exceeded their API call limit
 */
export async function checkUsageLimit(context: TenantContext): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const limit = context.tenant.maxMonthlyApiCalls;

  // Get first day of current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  try {
    const result = await sql`
      SELECT COALESCE(SUM(api_calls), 0) as total_calls
      FROM usage_records
      WHERE tenant_id = ${context.tenant.id}
        AND bucket_hour >= ${startOfMonth.toISOString()}
    `;

    const used = Number(result[0]?.total_calls || 0);

    return {
      allowed: used < limit,
      used,
      limit,
    };
  } catch (error) {
    console.error('Failed to check usage limit:', error);
    // On error, allow the request (fail open for MVP)
    return { allowed: true, used: 0, limit };
  }
}

/**
 * Get usage summary for a tenant
 */
export async function getUsageSummary(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalApiCalls: number;
  assignmentCalls: number;
  logCalls: number;
  uniqueUsers: number;
}> {
  const result = await sql`
    SELECT
      COALESCE(SUM(api_calls), 0) as total_api_calls,
      COALESCE(SUM(assignment_calls), 0) as assignment_calls,
      COALESCE(SUM(log_calls), 0) as log_calls,
      COALESCE(SUM(unique_users), 0) as unique_users
    FROM usage_records
    WHERE tenant_id = ${tenantId}
      AND bucket_hour >= ${startDate.toISOString()}
      AND bucket_hour < ${endDate.toISOString()}
  `;

  const row = result[0];
  return {
    totalApiCalls: Number(row?.total_api_calls || 0),
    assignmentCalls: Number(row?.assignment_calls || 0),
    logCalls: Number(row?.log_calls || 0),
    uniqueUsers: Number(row?.unique_users || 0),
  };
}
