# UpGrade Hosting Platform

Hosted multi-tenant A/B testing platform for EdTech, built on [Carnegie Learning's UpGrade](https://github.com/CarnegieLearningWeb/UpGrade).

**[Live Demo](https://upgrade-demo.vercel.app)** - Interactive walkthrough of A/B testing for education

## Why EdTech Needs Specialized A/B Testing

Generic A/B testing tools (Optimizely, LaunchDarkly) fail in education because:

- **Classroom contamination** - Can't split a class; students talk, teachers get confused
- **Learning outcomes ≠ clicks** - Success is assessment scores weeks later, not button clicks
- **Ethical constraints** - Need guardrails to halt experiments that harm learning
- **Research rigor** - Statistical standards suitable for publication and grants

## Architecture

```
┌─────────────────── VERCEL ───────────────────┐
│                                               │
│  ┌─────────────┐      ┌─────────────────┐   │
│  │ API Gateway │      │ Tenant Dashboard │   │
│  │ (Edge Func) │      │   (Next.js)      │   │
│  └──────┬──────┘      └─────────────────┘   │
└─────────┼────────────────────────────────────┘
          │
┌─────────▼──────── RAILWAY ───────────────────┐
│  ┌───────────────────────────────────────┐   │
│  │     UpGrade Backend (NestJS)          │   │
│  └───────────────────────────────────────┘   │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼─────── NEON ──────────┐
│  main (platform)  tenant-a    tenant-b  ...  │
│  ┌────────────┐  ┌────────┐  ┌────────┐     │
│  │ tenants    │  │UpGrade │  │UpGrade │     │
│  │ api_keys   │  │ schema │  │ schema │     │
│  └────────────┘  └────────┘  └────────┘     │
└───────────────────────────────────────────────┘
```

**Key Design Decision:** Uses Neon database branching for tenant isolation instead of modifying UpGrade's 40+ entity schema. Each tenant gets an instant database branch with full UpGrade schema.

## Components

| Component | Location | Description |
|-----------|----------|-------------|
| API Gateway | `apps/upgrade-gateway` | SDK proxy, API key auth, rate limiting |
| Dashboard | `apps/upgrade-dashboard` | Tenant UI, experiments, teams |
| Platform | `apps/upgrade-platform` | Docker compose, local dev setup |
| Demo | `apps/demo` | Interactive Kiddom-style demo |

## Quick Start

### Local Development

```bash
# Start Docker services (PostgreSQL, UpGrade backend)
cd apps/upgrade-platform
./scripts/dev-setup.sh

# In separate terminals:
cd apps/upgrade-gateway && npm run dev    # Port 3001
cd apps/upgrade-dashboard && npm run dev  # Port 3002
cd apps/demo && npm run dev               # Port 3003
```

### Try the Demo

**Live:** https://upgrade-demo.vercel.app

Or run locally:
```bash
cd apps/demo
npm install
npm run dev
```

The demo walks through:
- District-level tenant isolation (LAUSD vs Chicago)
- Educational experiment (progressive hints for math problems)
- Learning outcome metrics (completion rate, assessment scores)
- Guardrail checks (no harm to learning)

## SDK Integration

```typescript
import UpgradeClient from 'upgrade_client_lib/dist/browser';

const client = new UpgradeClient(
  studentId,
  'https://api.upgrade.yourcompany.com/v1',
  'your-app'
);

// Add API key from dashboard
client.setCustomHeaders({
  'X-API-Key': 'upg_live_xxxx...'
});

// Initialize with educational context
await client.init({
  schoolId: 'lincoln-elementary',
  classId: 'math-301',
  teacherId: 'ms-rodriguez',
  grade: 5
});

// Get experiment assignment
const assignment = await client.getDecisionPointAssignment('math-practice', 'hint-system');

// Log learning outcome
await client.markExperimentPoint('math-practice', 'hint-system', 'problem-completed');
```

## Use Cases

### Instructional Design
```
Hypothesis: Worked examples before practice improves mastery
Outcome: Unit assessment score (2 weeks later)
```

### Feedback Timing
```
Hypothesis: Immediate feedback increases retry behavior
Outcome: Completion rate, score improvement on retry
```

### Adaptive Difficulty
```
Hypothesis: Dynamic difficulty improves persistence
Outcome: Problems attempted, mastery rate
```

## Documentation

- [Integration Guide](docs/upgrade-integration/) - Claude skill for integrating UpGrade
- [UpGrade Docs](https://upgrade-platform.gitbook.io/docs/) - Official UpGrade documentation
- [UpGrade GitHub](https://github.com/CarnegieLearningWeb/UpGrade) - Source code

## License

MIT
