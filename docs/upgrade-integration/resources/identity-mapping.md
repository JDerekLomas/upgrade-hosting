# Identity Mapping for LTI/xAPI Integration

## The Identity Problem

Educational apps face a unique identity challenge:

```
Student "Jane Doe" might be:
├── Canvas user_id: "82739471"
├── Google SSO: "jane.doe@school.edu"
├── Your app's DB: { id: 456, email: "jane.d@gmail.com" }
├── SIS (Student Information System): "STU-2024-1847"
└── xAPI actor: "mailto:jane.doe@school.edu"
```

UpGrade needs a **stable, unique identifier** that persists across:
- Multiple LMS launches
- Direct app access (non-LTI)
- Mobile app sessions
- API integrations

## LTI 1.3 Identity Claims

LTI 1.3 provides these identity-related claims in the JWT:

```json
{
  "sub": "82739471",                    // Opaque, LMS-specific
  "name": "Jane Doe",                   // Display name
  "email": "jane.doe@school.edu",       // May be absent!
  "https://purl.imsglobal.org/spec/lti/claim/lis": {
    "person_sourcedid": "STU-2024-1847" // SIS ID (if available)
  }
}
```

### Which identifier to use?

| Identifier | Pros | Cons |
|------------|------|------|
| `sub` (user_id) | Always present, stable | Opaque, LMS-specific, useless for cross-platform |
| `email` | Human-readable, cross-platform | Optional claim, may be personal email |
| `person_sourcedid` | Matches SIS | Often missing, format varies |

**Recommendation:** Use `sub` as primary UpGrade userId, map others via `setAltUserIds()`.

## Implementation Patterns

### Pattern 1: LTI-Primary (Simple)

Use when app is only accessed via LTI.

```typescript
// lti-launch-handler.ts
import { verifyLtiLaunch } from './lti-utils';
import UpgradeClient from 'upgrade_client_lib/dist/node';

export async function handleLtiLaunch(req: Request) {
  const claims = await verifyLtiLaunch(req);

  // Use LTI sub as primary identifier
  const userId = `lti:${claims.iss}:${claims.sub}`;

  // Extract group information from LTI context
  const groupData = {
    schoolId: claims['https://purl.imsglobal.org/spec/lti/claim/lis']?.['course_section_sourcedid'],
    classId: claims['https://purl.imsglobal.org/spec/lti/claim/context']?.id,
    districtId: claims['https://purl.imsglobal.org/spec/lti/claim/tool_platform']?.guid
  };

  const client = new UpgradeClient(userId, UPGRADE_HOST, 'my-app');
  await client.init(groupData);

  // Map alternative IDs if available
  const altIds = [claims.sub]; // Always include raw sub
  if (claims.email) altIds.push(claims.email);
  if (claims['https://purl.imsglobal.org/spec/lti/claim/lis']?.person_sourcedid) {
    altIds.push(claims['https://purl.imsglobal.org/spec/lti/claim/lis'].person_sourcedid);
  }
  client.setAltUserIds(altIds);

  return { client, userId, groupData };
}
```

### Pattern 2: Federated Identity (Multi-Access)

Use when app can be accessed via LTI AND direct login.

```typescript
// identity-service.ts

interface UserIdentity {
  canonicalId: string;      // Your app's stable ID
  ltiIds: string[];         // LTI subs from various LMSs
  emails: string[];
  sisIds: string[];
}

class IdentityMapper {
  private db: Database;

  // Called on LTI launch
  async resolveFromLti(claims: LtiClaims): Promise<UserIdentity> {
    const ltiId = `${claims.iss}:${claims.sub}`;

    // Try to find existing user by LTI ID
    let identity = await this.db.findByLtiId(ltiId);

    if (!identity && claims.email) {
      // Try email match (common for Google SSO schools)
      identity = await this.db.findByEmail(claims.email);
      if (identity) {
        // Link this LTI ID to existing account
        await this.db.addLtiId(identity.canonicalId, ltiId);
      }
    }

    if (!identity) {
      // Create new user
      identity = await this.db.createUser({
        canonicalId: generateUUID(),
        ltiIds: [ltiId],
        emails: claims.email ? [claims.email] : [],
        sisIds: []
      });
    }

    return identity;
  }

  // Called on direct login
  async resolveFromAuth(authUser: AuthUser): Promise<UserIdentity> {
    return this.db.findByCanonicalId(authUser.id);
  }

  // Initialize UpGrade with full identity
  async initUpgrade(identity: UserIdentity, groupData: GroupData) {
    const client = new UpgradeClient(
      identity.canonicalId,  // Use YOUR stable ID
      UPGRADE_HOST,
      'my-app'
    );

    await client.init(groupData);

    // Map ALL known identifiers
    const altIds = [
      ...identity.ltiIds,
      ...identity.emails,
      ...identity.sisIds
    ];
    client.setAltUserIds(altIds);

    return client;
  }
}
```

### Pattern 3: Anonymous/Ephemeral (Privacy-Focused)

Use when you can't store persistent identifiers.

```typescript
// For COPPA compliance or strict privacy requirements
import UpgradeClient from 'upgrade_client_lib/dist/browser';

export async function initAnonymousExperiment(sessionId: string, classCode: string) {
  // Use session-only identifier
  const client = new UpgradeClient(
    `anon:${sessionId}`,
    UPGRADE_HOST,
    'my-app'
  );

  // Use ephemeral mode - no database lookup
  // Group data provided at runtime only
  const assignment = await client.getDecisionPointAssignment(
    'feature_name',
    'target',
    {
      // Ephemeral group data
      classId: classCode
    }
  );

  // Note: User won't have consistent assignment across sessions
  // But entire class will have same condition within session

  return assignment;
}
```

## Group Mapping from LTI

LTI context maps to UpGrade groups:

```typescript
function extractGroupData(claims: LtiClaims): GroupData {
  const context = claims['https://purl.imsglobal.org/spec/lti/claim/context'];
  const lis = claims['https://purl.imsglobal.org/spec/lti/claim/lis'];
  const platform = claims['https://purl.imsglobal.org/spec/lti/claim/tool_platform'];

  return {
    // District/Institution level
    districtId: platform?.guid || platform?.url,

    // School level (if available)
    schoolId: lis?.['course_section_sourcedid']?.split(':')[0],

    // Course level
    courseId: context?.id,

    // Section level (most specific)
    classId: lis?.['course_section_sourcedid'] || context?.id,

    // Additional context
    termId: lis?.['course_offering_sourcedid'],

    // Role-based grouping (teacher vs student experiments)
    role: extractPrimaryRole(claims['https://purl.imsglobal.org/spec/lti/claim/roles'])
  };
}

function extractPrimaryRole(roles: string[]): 'instructor' | 'student' | 'admin' {
  if (roles.some(r => r.includes('Instructor'))) return 'instructor';
  if (roles.some(r => r.includes('Administrator'))) return 'admin';
  return 'student';
}
```

## xAPI Integration

When logging outcomes to an LRS via xAPI, maintain identity consistency:

```typescript
import { XAPI } from '@xapi/xapi';
import UpgradeClient from 'upgrade_client_lib/dist/browser';

class ExperimentLogger {
  private upgradeClient: UpgradeClient;
  private xapiClient: XAPI;
  private actorId: string;

  async logOutcome(metric: string, value: number, context?: object) {
    // Log to UpGrade for experiment analysis
    this.upgradeClient.log(metric, value);

    // Log to LRS for learning analytics
    await this.xapiClient.sendStatement({
      actor: {
        mbox: `mailto:${this.actorId}`,
        // Or use account for LTI identity:
        // account: { homePage: ltiIss, name: ltiSub }
      },
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/scored',
        display: { 'en-US': 'scored' }
      },
      object: {
        id: `https://myapp.com/activities/${context?.activityId}`,
        definition: {
          type: 'http://adlnet.gov/expapi/activities/assessment'
        }
      },
      result: {
        score: { raw: value, min: 0, max: 100 }
      },
      context: {
        extensions: {
          // Include experiment condition for analysis!
          'https://upgrade.carnegielearning.com/condition': this.currentCondition,
          'https://upgrade.carnegielearning.com/experiment': this.currentExperiment
        }
      }
    });
  }
}
```

## Edge Cases

### Multiple LMS Launches (Same User)

```
Student launches from Canvas → userId = "canvas:abc123"
Same student launches from Schoology → userId = "schoology:xyz789"
```

**Solution:** Use email as linking key during identity resolution.

### Course Copy Problem

When a teacher copies a course:
- `context_id` changes (new course shell)
- `resource_link_id` changes (new links)
- Students may get different condition than original course

**Solution:** Use `course_offering_sourcedid` if available, or accept as separate experiment population.

### Guest/Preview Mode

LMS preview mode may not provide full identity claims.

```typescript
function handleLtiLaunch(claims: LtiClaims) {
  const roles = claims['https://purl.imsglobal.org/spec/lti/claim/roles'] || [];

  // Detect preview/test launch
  if (roles.some(r => r.includes('TestUser')) || !claims.sub) {
    // Return default experience, don't enroll in experiment
    return { isPreview: true, condition: 'control' };
  }

  // Normal launch
  return initUpgradeClient(claims);
}
```

### Roster Sync Timing

LTI Advantage Names and Role Provisioning (NRPS) provides roster data, but:
- May be stale (last sync was hours ago)
- New students might not appear yet
- Dropped students still appear

**Solution:** Always accept the identity from the launch JWT, update stored roster asynchronously.
