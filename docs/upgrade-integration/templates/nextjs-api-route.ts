/**
 * Next.js API Route Pattern for UpGrade A/B Testing
 *
 * Server-side assignment fetching for:
 * - SSR pages that need condition before render
 * - API routes that vary behavior by condition
 * - Avoiding client-side SDK bundle
 *
 * Note: For most EdTech apps, client-side SDK is preferred
 * because it handles caching and offline better.
 */

import { NextRequest, NextResponse } from 'next/server';
import UpgradeClient from 'upgrade_client_lib/dist/node';
import { MARKED_DECISION_POINT_STATUS } from 'upgrade_client_lib';

// ============================================================================
// Configuration
// ============================================================================

const UPGRADE_CONFIG = {
  hostUrl: process.env.UPGRADE_HOST_URL || 'https://upgrade.yourcompany.com',
  context: process.env.UPGRADE_CONTEXT || 'my-edtech-app',
  fallbackCondition: 'control',
  timeoutMs: 5000
};

// ============================================================================
// Client Pool (reuse clients per user)
// ============================================================================

// In production, consider Redis or similar for distributed caching
const clientCache = new Map<string, { client: UpgradeClient; expiresAt: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

async function getUpgradeClient(
  userId: string,
  groupData?: Record<string, string>
): Promise<UpgradeClient> {
  const cacheKey = userId;
  const cached = clientCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.client;
  }

  const client = new UpgradeClient(userId, UPGRADE_CONFIG.hostUrl, UPGRADE_CONFIG.context);

  try {
    await Promise.race([
      client.init(groupData || {}),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Init timeout')), UPGRADE_CONFIG.timeoutMs)
      )
    ]);

    // Cache the initialized client
    clientCache.set(cacheKey, {
      client,
      expiresAt: Date.now() + CACHE_TTL_MS
    });

    return client;
  } catch (error) {
    console.error('Failed to initialize UpGrade client:', error);
    throw error;
  }
}

// Cleanup expired clients periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of clientCache.entries()) {
    if (value.expiresAt < now) {
      clientCache.delete(key);
    }
  }
}, 60 * 1000); // Every minute

// ============================================================================
// API Route: Get Assignment
// ============================================================================

/**
 * GET /api/upgrade/assignment?site=feature_name&target=optional_target
 *
 * Query params:
 * - site: Decision point name (required)
 * - target: Optional target within site
 *
 * Headers:
 * - x-user-id: User identifier (required)
 * - x-class-id: Class/group identifier (optional)
 * - x-school-id: School identifier (optional)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const site = searchParams.get('site');
  const target = searchParams.get('target') || undefined;

  // Validate required params
  if (!site) {
    return NextResponse.json(
      { error: 'Missing required parameter: site' },
      { status: 400 }
    );
  }

  // Get user identity from headers (set by your auth middleware)
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json(
      { error: 'Missing x-user-id header' },
      { status: 401 }
    );
  }

  // Build group data from headers
  const groupData: Record<string, string> = {};
  const classId = request.headers.get('x-class-id');
  const schoolId = request.headers.get('x-school-id');
  const districtId = request.headers.get('x-district-id');

  if (classId) groupData.classId = classId;
  if (schoolId) groupData.schoolId = schoolId;
  if (districtId) groupData.districtId = districtId;

  try {
    const client = await getUpgradeClient(userId, groupData);
    const assignment = await client.getDecisionPointAssignment(site, target);

    return NextResponse.json({
      condition: assignment.getCondition(),
      payload: assignment.getPayload(),
      experimentType: assignment.getExperimentType(),
      source: 'server'
    });
  } catch (error) {
    console.error('Failed to get assignment:', error);

    // Return fallback on error
    return NextResponse.json({
      condition: UPGRADE_CONFIG.fallbackCondition,
      payload: null,
      experimentType: null,
      source: 'fallback',
      error: 'Failed to fetch assignment'
    });
  }
}

// ============================================================================
// API Route: Mark Decision Point
// ============================================================================

/**
 * POST /api/upgrade/mark
 *
 * Body:
 * - site: Decision point name (required)
 * - status: CONDITION_APPLIED | CONDITION_FAILED_TO_APPLY | NO_CONDITION_ASSIGNED
 *
 * Headers:
 * - x-user-id: User identifier (required)
 */
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json(
      { error: 'Missing x-user-id header' },
      { status: 401 }
    );
  }

  let body: { site?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  if (!body.site) {
    return NextResponse.json(
      { error: 'Missing required field: site' },
      { status: 400 }
    );
  }

  const status = (body.status as MARKED_DECISION_POINT_STATUS) ||
    MARKED_DECISION_POINT_STATUS.CONDITION_APPLIED;

  try {
    const client = await getUpgradeClient(userId);
    client.markDecisionPoint(body.site, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark decision point:', error);
    return NextResponse.json(
      { error: 'Failed to mark decision point' },
      { status: 500 }
    );
  }
}

// ============================================================================
// API Route: Log Metric
// ============================================================================

/**
 * POST /api/upgrade/log
 *
 * Body:
 * - key: Metric name (required)
 * - value: Metric value (required, string | number | boolean)
 *
 * Headers:
 * - x-user-id: User identifier (required)
 */
export async function logMetric(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json(
      { error: 'Missing x-user-id header' },
      { status: 401 }
    );
  }

  let body: { key?: string; value?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  if (!body.key || body.value === undefined || body.value === null) {
    return NextResponse.json(
      { error: 'Missing required fields: key, value' },
      { status: 400 }
    );
  }

  // Type validation
  const valueType = typeof body.value;
  if (!['string', 'number', 'boolean'].includes(valueType)) {
    return NextResponse.json(
      { error: `Invalid value type: ${valueType}. Must be string, number, or boolean.` },
      { status: 400 }
    );
  }

  try {
    const client = await getUpgradeClient(userId);
    client.log(body.key, body.value as string | number | boolean);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log metric:', error);
    return NextResponse.json(
      { error: 'Failed to log metric' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Middleware for Injecting Assignment into Request
// ============================================================================

/**
 * Use in middleware.ts to inject assignment before page render
 *
 * Example middleware.ts:
 *
 * import { injectUpgradeAssignment } from './lib/upgrade';
 *
 * export async function middleware(request: NextRequest) {
 *   return injectUpgradeAssignment(request, 'homepage_variant');
 * }
 */
export async function injectUpgradeAssignment(
  request: NextRequest,
  site: string,
  target?: string
): Promise<NextResponse> {
  const userId = request.cookies.get('userId')?.value;

  if (!userId) {
    // No user, continue without assignment
    return NextResponse.next();
  }

  try {
    const client = await getUpgradeClient(userId);
    const assignment = await client.getDecisionPointAssignment(site, target);

    const response = NextResponse.next();

    // Inject assignment into request headers for use in getServerSideProps
    response.headers.set('x-upgrade-condition', assignment.getCondition() || 'control');
    response.headers.set('x-upgrade-payload', JSON.stringify(assignment.getPayload()));

    return response;
  } catch (error) {
    console.error('Middleware assignment failed:', error);
    return NextResponse.next();
  }
}

// ============================================================================
// Server Component Helper (App Router)
// ============================================================================

/**
 * For use in Server Components (App Router)
 *
 * Example:
 *
 * // app/dashboard/page.tsx
 * import { getServerAssignment } from '@/lib/upgrade';
 *
 * export default async function DashboardPage() {
 *   const assignment = await getServerAssignment('dashboard_layout', userId);
 *
 *   return assignment.condition === 'new_layout'
 *     ? <NewDashboard />
 *     : <OldDashboard />;
 * }
 */
export async function getServerAssignment(
  site: string,
  userId: string,
  options?: {
    target?: string;
    groupData?: Record<string, string>;
  }
): Promise<{
  condition: string;
  payload: unknown;
  source: 'server' | 'fallback';
}> {
  try {
    const client = await getUpgradeClient(userId, options?.groupData);
    const assignment = await client.getDecisionPointAssignment(site, options?.target);

    return {
      condition: assignment.getCondition() || UPGRADE_CONFIG.fallbackCondition,
      payload: assignment.getPayload(),
      source: 'server'
    };
  } catch (error) {
    console.error('Server assignment failed:', error);

    return {
      condition: UPGRADE_CONFIG.fallbackCondition,
      payload: null,
      source: 'fallback'
    };
  }
}

// ============================================================================
// LTI Launch Handler
// ============================================================================

/**
 * Handle LTI 1.3 launch and initialize UpGrade
 *
 * POST /api/lti/launch
 */
export async function handleLtiLaunch(request: NextRequest) {
  // Verify LTI JWT (implementation depends on your LTI library)
  const claims = await verifyLtiLaunch(request);

  if (!claims) {
    return NextResponse.json({ error: 'Invalid LTI launch' }, { status: 401 });
  }

  // Extract identity
  const ltiUserId = `lti:${claims.iss}:${claims.sub}`;

  // Extract groups from LTI context
  const groupData: Record<string, string> = {};

  const context = claims['https://purl.imsglobal.org/spec/lti/claim/context'];
  if (context?.id) {
    groupData.classId = context.id;
  }

  const lis = claims['https://purl.imsglobal.org/spec/lti/claim/lis'];
  if (lis?.course_section_sourcedid) {
    groupData.sectionId = lis.course_section_sourcedid;
  }

  const platform = claims['https://purl.imsglobal.org/spec/lti/claim/tool_platform'];
  if (platform?.guid) {
    groupData.districtId = platform.guid;
  }

  // Initialize UpGrade
  const client = await getUpgradeClient(ltiUserId, groupData);

  // Set alternative IDs
  const altIds: string[] = [claims.sub];
  if (claims.email) altIds.push(claims.email);
  if (lis?.person_sourcedid) altIds.push(lis.person_sourcedid);

  client.setAltUserIds(altIds);

  // Create session
  const sessionToken = generateSessionToken(ltiUserId, groupData);

  // Redirect to app with session
  const redirectUrl = new URL('/app', request.url);
  redirectUrl.searchParams.set('session', sessionToken);

  const response = NextResponse.redirect(redirectUrl);

  // Set secure cookie
  response.cookies.set('userId', ltiUserId, {
    httpOnly: true,
    secure: true,
    sameSite: 'none', // Required for LMS iframe
    maxAge: 60 * 60 * 24 // 24 hours
  });

  return response;
}

// Stub - implement with your LTI library (ltijs, etc.)
async function verifyLtiLaunch(request: NextRequest): Promise<Record<string, unknown> | null> {
  // Implementation depends on your LTI library
  // This should verify the JWT signature and return claims
  throw new Error('Implement with your LTI library');
}

function generateSessionToken(userId: string, groupData: Record<string, string>): string {
  // Implementation depends on your session strategy
  // Could use JWT, or store in Redis and return key
  throw new Error('Implement session token generation');
}
