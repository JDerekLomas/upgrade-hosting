# UpGrade Integration Pitfalls & Edge Cases

This document covers the unexpected problems that arise when integrating UpGrade into educational applications. **Read this before writing integration code.**

## Critical Issues (Will Break Your Integration)

### 1. Third-Party Cookie Blocking in LMS iFrames

**Severity:** CRITICAL
**Likelihood:** Very High (affects all Safari users, many Chrome users)
**Detection:** Medium (silent failures, inconsistent behavior)

#### The Problem

When your EdTech app runs inside an LMS iframe (Canvas, Moodle, Blackboard, etc.):

1. LMS is on `canvas.instructure.com`
2. Your app is on `myedtech.com`
3. Browser considers your cookies "third-party"
4. Safari blocks them by default
5. Chrome's Privacy Sandbox increasingly restricts them

#### Symptoms

- User gets re-randomized on every page navigation
- `init()` completes successfully but assignment is inconsistent
- Works perfectly in development (same origin), fails in production
- "Works for me" (developer not in iframe) but fails for students
- Intermittent issues based on browser/settings

#### Solutions

**Option A: Cookie Configuration (Partial Fix)**

```typescript
// Server-side: Set permissive cookie attributes
res.cookie('upgrade_session', sessionId, {
  sameSite: 'none',  // Required for cross-site
  secure: true,       // Required when sameSite=none
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000  // 30 days
});
```

**Limitations:** Still blocked by Safari ITP, some enterprise Chrome policies.

**Option B: LocalStorage with Server Validation (Better)**

```typescript
// Don't rely on cookies for identity
class UpgradeSessionManager {
  private storageKey = 'upgrade_user_session';

  async getOrCreateSession(authenticatedUserId: string): Promise<string> {
    const stored = localStorage.getItem(this.storageKey);

    if (stored) {
      const session = JSON.parse(stored);
      // Validate this session belongs to current user
      if (session.userId === authenticatedUserId) {
        return session.upgradeId;
      }
      // Different user - clear stale session
      localStorage.removeItem(this.storageKey);
    }

    // Create new session
    const upgradeId = authenticatedUserId; // Or generate mapping
    localStorage.setItem(this.storageKey, JSON.stringify({
      userId: authenticatedUserId,
      upgradeId,
      createdAt: Date.now()
    }));

    return upgradeId;
  }
}
```

**Option C: New Window Launch (Most Reliable)**

```typescript
// Detect iframe context and offer breakout
function checkIframeContext() {
  if (window.self !== window.top) {
    // We're in an iframe
    const shouldBreakout = localStorage.getItem('upgrade_cookie_test') === null;

    if (shouldBreakout) {
      // Test if we can set cookies
      localStorage.setItem('upgrade_cookie_test', '1');

      // Offer user option to open in new window
      showBreakoutPrompt();
    }
  }
}
```

**Option D: LTI State Parameter (For LTI launches)**

```typescript
// Pass identity through LTI state, not cookies
function generateLtiState(userId: string, experimentContext: object): string {
  const state = {
    userId,
    experimentContext,
    timestamp: Date.now(),
    nonce: crypto.randomUUID()
  };
  return jwt.sign(state, LTI_STATE_SECRET, { expiresIn: '1h' });
}
```

---

### 2. Race Condition: init() vs getDecisionPointAssignment()

**Severity:** HIGH
**Likelihood:** High (common async mistake)
**Detection:** Easy (obvious when it happens)

#### The Problem

```typescript
// WRONG - This is a race condition
const client = new UpgradeClient(userId, hostUrl, context);
client.init(groupData);  // Returns Promise, not awaited!
const assignment = await client.getDecisionPointAssignment('feature');
// May return NO_CONDITION_ASSIGNED because init() hasn't completed
```

#### Why It's Tricky

- Works sometimes (when init is fast)
- Fails under load (when init is slow)
- Fails on slow networks
- Passes all local tests

#### Solution

```typescript
// CORRECT - Always await init()
const client = new UpgradeClient(userId, hostUrl, context);
await client.init(groupData);  // AWAIT!
const assignment = await client.getDecisionPointAssignment('feature');
```

#### Defensive Pattern

```typescript
class SafeUpgradeClient {
  private client: UpgradeClient;
  private initPromise: Promise<void> | null = null;
  private initialized = false;

  constructor(userId: string, hostUrl: string, context: string) {
    this.client = new UpgradeClient(userId, hostUrl, context);
  }

  async init(groupData: GroupData): Promise<void> {
    if (this.initialized) return;

    if (!this.initPromise) {
      this.initPromise = this.client.init(groupData).then(() => {
        this.initialized = true;
      });
    }

    return this.initPromise;
  }

  async getAssignment(site: string, target?: string) {
    if (!this.initialized) {
      throw new Error('UpgradeClient not initialized. Call init() first.');
    }
    return this.client.getDecisionPointAssignment(site, target);
  }
}
```

---

### 3. LTI Identity Mismatch

**Severity:** HIGH
**Likelihood:** High
**Detection:** Medium (causes data corruption, not errors)

#### The Problem

Your app uses email as userId:
```typescript
const client = new UpgradeClient(user.email, ...);
```

LTI provides opaque ID:
```typescript
const ltiUserId = claims.sub; // "82739471" - not an email!
```

Now the same student has two UpGrade identities and may get different conditions.

#### Solution

See `resources/identity-mapping.md` for full patterns. Quick fix:

```typescript
// Always use setAltUserIds to link identities
const client = new UpgradeClient(primaryId, hostUrl, context);
await client.init(groupData);
client.setAltUserIds([ltiUserId, userEmail, internalId]);
```

---

## High-Risk Issues

### 4. Group Assignment Drift

**Severity:** HIGH
**Likelihood:** Medium
**Detection:** Hard (delayed, statistical impact)

#### The Problem

1. Student joins Mrs. Smith's class (Treatment A)
2. Experiment assigns whole class to Treatment A
3. Student transfers to Mr. Jones's class (Treatment B)
4. Student keeps Treatment A (consistency rule)
5. Student sees different UI than new classmates
6. Confusion, support tickets, contamination

#### Considerations

**Option A: Accept Drift (Experimental Purity)**
- Student keeps original assignment
- Analyze as "intent to treat"
- Note: Small N of transfers usually doesn't affect results

**Option B: Re-assign on Transfer (UX Consistency)**
```typescript
// On class change detection
async function handleClassTransfer(userId: string, newClassId: string) {
  // Re-initialize with new group
  const client = new UpgradeClient(userId, hostUrl, context);
  await client.init({
    classId: newClassId,
    // This will get new assignment based on new class
  });

  // Log the transfer for analysis exclusion
  client.log('class_transfer', 1);
}
```

**Option C: Exclude Transfers from Analysis**
```typescript
// Mark transferred students
client.log('transferred_during_experiment', true);
// Filter in analysis phase
```

---

### 5. Caching & Stale Assignments

**Severity:** HIGH
**Likelihood:** Medium
**Detection:** Hard (intermittent, confusing symptoms)

#### The Problem

```
1. App caches assignment client-side for performance
2. Researcher updates experiment (adds condition, changes weights)
3. User still sees cached assignment
4. Data shows impossible condition distribution
```

#### CDN Caching Issues

```
1. CDN caches page with Treatment A UI
2. User assigned Treatment B by UpGrade
3. CDN serves cached Treatment A page
4. User sees wrong condition
```

#### Solutions

**Client-side: Time-bounded Cache**

```typescript
class AssignmentCache {
  private cache: Map<string, { assignment: Assignment; timestamp: number }> = new Map();
  private TTL_MS = 5 * 60 * 1000; // 5 minutes

  async getAssignment(client: UpgradeClient, site: string): Promise<Assignment> {
    const cacheKey = `${client.userId}:${site}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.TTL_MS) {
      return cached.assignment;
    }

    const assignment = await client.getDecisionPointAssignment(site);
    this.cache.set(cacheKey, { assignment, timestamp: Date.now() });

    return assignment;
  }

  invalidate(site?: string) {
    if (site) {
      // Invalidate specific
      for (const key of this.cache.keys()) {
        if (key.endsWith(`:${site}`)) this.cache.delete(key);
      }
    } else {
      this.cache.clear();
    }
  }
}
```

**CDN: Cache-Control Headers**

```typescript
// For pages with experiment variations
res.setHeader('Cache-Control', 'private, no-store');
// Or use Vary header
res.setHeader('Vary', 'Cookie'); // Vary by user
```

**CDN: Edge-side Assignment**

```typescript
// Cloudflare Worker example
export default {
  async fetch(request: Request, env: Env) {
    const userId = getUserFromRequest(request);

    // Get assignment at edge
    const assignment = await env.UPGRADE_KV.get(`assignment:${userId}`);

    // Route to correct origin based on condition
    const origin = assignment === 'treatment'
      ? 'https://treatment.myapp.com'
      : 'https://control.myapp.com';

    return fetch(new Request(origin, request));
  }
};
```

---

### 6. Network Failures & Offline Scenarios

**Severity:** MEDIUM
**Likelihood:** High (school networks are unreliable)
**Detection:** Easy (obvious errors)

#### The Problem

- School firewalls block UpGrade server
- Spotty WiFi in classrooms
- Mobile devices going offline
- Rate limiting under load

#### Solution: Graceful Degradation

```typescript
class ResilientUpgradeClient {
  private client: UpgradeClient;
  private fallbackCondition: string;
  private localCache: Storage;

  constructor(config: Config) {
    this.client = new UpgradeClient(config.userId, config.hostUrl, config.context);
    this.fallbackCondition = config.fallbackCondition || 'control';
    this.localCache = localStorage;
  }

  async getAssignmentWithFallback(site: string): Promise<{
    condition: string;
    source: 'server' | 'cache' | 'fallback';
  }> {
    const cacheKey = `upgrade_assignment_${site}`;

    try {
      // Try server first
      const assignment = await Promise.race([
        this.client.getDecisionPointAssignment(site),
        this.timeout(5000) // 5 second timeout
      ]);

      const condition = assignment.getCondition();

      // Cache successful assignment
      this.localCache.setItem(cacheKey, JSON.stringify({
        condition,
        timestamp: Date.now()
      }));

      return { condition, source: 'server' };

    } catch (error) {
      console.warn('UpGrade server unavailable:', error);

      // Try cache
      const cached = this.localCache.getItem(cacheKey);
      if (cached) {
        const { condition, timestamp } = JSON.parse(cached);
        // Accept cache up to 24 hours old
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return { condition, source: 'cache' };
        }
      }

      // Fall back to default
      return { condition: this.fallbackCondition, source: 'fallback' };
    }
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    );
  }
}
```

---

### 7. Metric Logging Issues

**Severity:** HIGH (corrupts analysis)
**Likelihood:** Medium
**Detection:** Hard (discovered during analysis)

#### Problem 1: Type Inconsistency

```typescript
// Different code paths log different types
client.log('score', 85);        // number
client.log('score', '85');      // string - CORRUPTS DATA
client.log('score', null);      // null - CORRUPTS DATA
```

#### Solution: Type-Safe Logger

```typescript
interface MetricSchema {
  score: number;
  completion_time_ms: number;
  completed: boolean;
  response_type: 'correct' | 'incorrect' | 'partial';
}

class TypedUpgradeLogger<T extends Record<string, unknown>> {
  constructor(private client: UpgradeClient) {}

  log<K extends keyof T>(key: K, value: T[K]): void {
    // Runtime validation
    if (value === null || value === undefined) {
      console.error(`Attempted to log null/undefined for metric: ${String(key)}`);
      return;
    }

    this.client.log(String(key), value as string | number | boolean);
  }
}

// Usage
const logger = new TypedUpgradeLogger<MetricSchema>(client);
logger.log('score', 85);           // OK
logger.log('score', '85');         // TypeScript error!
logger.log('completed', true);     // OK
```

#### Problem 2: Logging Before markDecisionPoint()

```typescript
// WRONG - metric not associated with condition
client.log('score', 85);
client.markDecisionPoint('quiz', MARKED_DECISION_POINT_STATUS.CONDITION_APPLIED);
```

#### Solution: Enforce Order

```typescript
class OrderedUpgradeClient {
  private markedPoints: Set<string> = new Set();

  markDecisionPoint(site: string, status: MARKED_DECISION_POINT_STATUS) {
    this.client.markDecisionPoint(site, status);
    this.markedPoints.add(site);
  }

  log(key: string, value: unknown, site?: string) {
    if (site && !this.markedPoints.has(site)) {
      console.warn(`Logging "${key}" before marking decision point "${site}"`);
    }
    this.client.log(key, value);
  }
}
```

#### Problem 3: Lost Logs on Tab Close

```typescript
// User completes quiz, logs score, immediately closes tab
client.log('score', 85);  // May not reach server!
```

#### Solution: Beacon API

```typescript
// Use sendBeacon for critical metrics
function logCriticalMetric(key: string, value: unknown) {
  // Try normal log first
  client.log(key, value);

  // Also send via beacon (survives tab close)
  const data = JSON.stringify({
    userId: client.userId,
    metric: key,
    value,
    timestamp: Date.now()
  });

  navigator.sendBeacon('/api/upgrade-metric-backup', data);
}
```

---

### 8. Classroom Contamination

**Severity:** MEDIUM (affects experiment validity)
**Likelihood:** High
**Detection:** Very Hard (social phenomenon)

#### The Problem

Even with group assignment, contamination occurs:

1. **Peer observation:** "Why does your screen look different?"
2. **Teacher awareness:** Teacher mentions "some of you have the new version"
3. **Screenshot sharing:** Student posts homework help with Treatment A UI
4. **Substitute teacher:** Uses different device, sees different condition

#### Mitigations

**Visual Similarity:** Design treatments to be visually similar
```
Control: Blue "Submit" button
Treatment: Blue "Check Answer" button
NOT: Blue button vs Red button (too obvious)
```

**Teacher Training:** Document that teachers may see different versions

**Delayed Reveal:** Don't show which condition until experiment ends

**Outcome Focus:** Focus on learning outcomes, not UI differences

---

### 9. Experiment Lifecycle Surprises

**Severity:** MEDIUM
**Likelihood:** Medium
**Detection:** Medium

#### ENROLLING → ENROLLMENT_COMPLETE

When enrollment closes, new users get **no assignment** (not control, literally undefined).

```typescript
// Handle enrollment complete
const assignment = await client.getDecisionPointAssignment('feature');
if (!assignment || assignment.getCondition() === undefined) {
  // Enrollment closed - decide what to do
  return showDefaultExperience(); // Don't crash!
}
```

#### POST_EXPERIMENT_RULE Confusion

| Rule | Behavior |
|------|----------|
| `CONTINUE` | Users keep assigned condition forever |
| `REVERT_TO_DEFAULT` | Reverts to... what exactly? (Undefined in SDK) |
| `ASSIGN` | New assignment (may differ from original) |

#### Experiment Deletion

If experiment is deleted while users have cached assignments:
- Server returns 404 or empty
- Cached client assignment references non-existent experiment
- Analysis attempts fail

```typescript
// Defensive handling
try {
  const assignment = await client.getDecisionPointAssignment('feature');
  if (!assignment?.getCondition()) {
    throw new Error('No valid assignment');
  }
  return assignment;
} catch (e) {
  // Clear cache, return default
  assignmentCache.invalidate('feature');
  return { condition: 'control', payload: null };
}
```

---

### 10. Shared Device Problem

**Severity:** MEDIUM
**Likelihood:** High (Chromebook carts, computer labs)
**Detection:** Hard

#### The Problem

```
1. Student A logs in, gets Treatment A, closes browser
2. Student B sits down, opens browser
3. LocalStorage still has Student A's UpGrade session
4. Student B gets Student A's assignment
```

#### Solution: Validate on Every Session

```typescript
class SecureUpgradeSession {
  async validateAndInit(currentUserId: string, groupData: GroupData) {
    const storedSession = localStorage.getItem('upgrade_session');

    if (storedSession) {
      const session = JSON.parse(storedSession);

      if (session.userId !== currentUserId) {
        // Different user! Clear everything
        localStorage.removeItem('upgrade_session');
        localStorage.removeItem('upgrade_assignments');
        sessionStorage.clear(); // Nuclear option for shared devices
      }
    }

    // Store current user
    localStorage.setItem('upgrade_session', JSON.stringify({
      userId: currentUserId,
      timestamp: Date.now()
    }));

    // Initialize fresh
    const client = new UpgradeClient(currentUserId, UPGRADE_HOST, 'my-app');
    await client.init(groupData);

    return client;
  }
}
```

---

## Troubleshooting Decision Trees

### Assignment Returns NO_CONDITION_ASSIGNED

```
├── Is client initialized?
│   └── Check: await client.init() called and completed?
│       └── No → Add await before init()
│
├── Is experiment running?
│   └── Check UpGrade UI: State = ENROLLING?
│       └── No → Start the experiment
│
├── Does user match segments?
│   └── Check: User included in target segment?
│       └── No → Review inclusion/exclusion rules
│
├── Is context correct?
│   └── Check: context param matches experiment config?
│       └── No → Fix context string
│
├── Is decision point name exact?
│   └── Check: Typo in site or target?
│       └── Yes → Fix decision point name
│
└── Network issues?
    └── Check browser Network tab for failed requests
        └── 4xx/5xx → Check server logs, auth token
```

### User Gets Wrong Condition

```
├── Is this actually wrong?
│   └── Check UpGrade UI: What is user's assigned condition?
│       └── Matches UI → App logic bug, not UpGrade
│
├── Caching issue?
│   └── Check: Is assignment cached client-side?
│       └── Yes → Clear cache, refresh
│
├── Multiple identities?
│   └── Check: Same user with different IDs?
│       └── Yes → Implement setAltUserIds()
│
├── Group override?
│   └── Check: workingGroupData overriding stored group?
│       └── Yes → Review init() parameters
│
└── Cookie/session issue?
    └── Check: Is this in an iframe?
        └── Yes → See third-party cookie solutions
```

### Inconsistent Assignment Across Pages

```
├── Race condition?
│   └── Check: Is init() awaited on every page?
│       └── No → Ensure init() completes before getAssignment()
│
├── Different contexts?
│   └── Check: Is context param consistent across pages?
│       └── No → Standardize context
│
├── Session expiration?
│   └── Check: Is session cookie expiring between pages?
│       └── Yes → Extend cookie lifetime, use localStorage
│
└── CDN caching?
    └── Check: Are pages cached with baked-in conditions?
        └── Yes → Add Cache-Control: private or Vary header
```
