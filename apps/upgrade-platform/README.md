# UpGrade Platform

Hosted multi-tenant A/B testing platform for EdTech applications, built on [Carnegie Learning's UpGrade](https://github.com/CarnegieLearningWeb/UpGrade).

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

## Quick Start (Local Development)

```bash
# Run the setup script
./scripts/dev-setup.sh

# Then in separate terminals:

# Terminal 1 - API Gateway
cd ../upgrade-gateway && npm run dev

# Terminal 2 - Dashboard
cd ../upgrade-dashboard && npm run dev
```

## Components

| Component | Location | Port | Description |
|-----------|----------|------|-------------|
| API Gateway | `../upgrade-gateway` | 3001 | SDK proxy, auth, rate limiting |
| Dashboard | `../upgrade-dashboard` | 3002 | Tenant UI, experiments, teams |
| UpGrade Backend | Docker | 3030 | Core A/B testing engine |
| Platform DB | Docker | 5432 | Tenants, API keys, usage |
| Tenant DB | Docker | 5433 | UpGrade experiment data |

## Docker Services

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Reset databases
docker-compose down -v
```

## SDK Integration

```typescript
import UpgradeClient from 'upgrade_client_lib/dist/browser';

const client = new UpgradeClient(
  userId,
  'https://api.upgrade.yourcompany.com/v1',
  'my-app'
);

// Add API key from dashboard
client.setCustomHeaders({
  'X-API-Key': 'upg_live_xxxx...'
});

await client.init(groupData);
const assignment = await client.getDecisionPointAssignment('feature');
```

## Production Deployment

### Prerequisites

- Vercel account
- Neon database
- Railway account (or other container hosting)
- Google/GitHub OAuth apps

### Deploy Gateway

```bash
cd ../upgrade-gateway
vercel
```

### Deploy Dashboard

```bash
cd ../upgrade-dashboard
vercel
```

### Deploy UpGrade Backend

1. Fork [CarnegieLearningWeb/UpGrade](https://github.com/CarnegieLearningWeb/UpGrade)
2. Deploy to Railway with Docker
3. Point to Neon tenant branch

## Environment Variables

See `.env.example` files in each component directory.

## Pricing Model

| Plan | API Calls/Month | Experiments | Price |
|------|-----------------|-------------|-------|
| Free | 10,000 | 3 | $0 |
| Starter | 100,000 | 10 | $29/mo |
| Growth | 1,000,000 | 50 | $99/mo |
| Enterprise | Unlimited | Unlimited | Custom |

## Related Documentation

- [UpGrade Documentation](https://upgrade-platform.gitbook.io/docs/)
- [UpGrade GitHub](https://github.com/CarnegieLearningWeb/UpGrade)
- [Integration Skill](../../.claude/skills/upgrade-integration/)
