# UpGrade Gateway

API Gateway for the hosted multi-tenant UpGrade platform. Handles authentication, rate limiting, tenant routing, and usage metering.

## Architecture

```
SDK Request → API Gateway → UpGrade Backend → Tenant Database
                  │
                  ├── Validate API Key
                  ├── Check Rate Limit
                  ├── Check Usage Limit
                  ├── Resolve Tenant DB
                  └── Track Usage
```

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Set up the database (requires Neon connection)
npm run db:push

# Seed development data
npx tsx scripts/seed-dev.ts

# Start the gateway
npm run dev
```

## API Endpoints

All SDK endpoints require an `X-API-Key` header.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check (no auth required) |
| `/api/v1/init` | POST | Initialize user session |
| `/api/v1/assign` | POST/GET | Get experiment assignment |
| `/api/v1/mark` | POST | Mark decision point |
| `/api/v1/log` | POST | Log metrics |

## Authentication

API keys follow the format: `upg_{environment}_{random}`

Examples:
- `upg_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- `upg_test_x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4`

Pass the key in one of these ways:
```bash
# X-API-Key header (preferred)
curl -H "X-API-Key: upg_live_xxx" https://api.upgrade.io/v1/health

# Bearer token
curl -H "Authorization: Bearer upg_live_xxx" https://api.upgrade.io/v1/health
```

## Rate Limiting

Default limits per API key:
- 1,000 requests/minute (configurable per key)

Response headers:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Usage Limits

Monthly API call limits by plan:

| Plan | API Calls/Month | Experiments | Users |
|------|-----------------|-------------|-------|
| Free | 10,000 | 3 | 100 |
| Starter | 100,000 | 10 | 1,000 |
| Growth | 1,000,000 | 50 | 10,000 |
| Enterprise | Unlimited | Unlimited | Unlimited |

## Environment Variables

```bash
# Required
PLATFORM_DATABASE_URL=postgres://...   # Neon platform database
UPGRADE_BACKEND_URL=http://...         # UpGrade backend service

# Optional
ENCRYPTION_KEY=...                      # For encrypting tenant DB URLs
```

## Database Schema

Platform database tables:
- `tenants` - Tenant organizations
- `api_keys` - API key authentication
- `tenant_users` - Dashboard users (SSO)
- `usage_records` - Hourly usage tracking
- `usage_monthly` - Monthly billing rollups

## Development

```bash
# Generate Drizzle migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly (dev only)
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

Environment variables to set in Vercel:
- `PLATFORM_DATABASE_URL`
- `UPGRADE_BACKEND_URL`
- `ENCRYPTION_KEY`

## Project Structure

```
src/
├── app/
│   └── api/v1/
│       ├── health/route.ts    # Health check
│       ├── init/route.ts      # User initialization
│       ├── assign/route.ts    # Assignment endpoint
│       ├── mark/route.ts      # Mark decision point
│       └── log/route.ts       # Log metrics
├── lib/
│   ├── auth/
│   │   ├── api-key-validator.ts
│   │   └── rate-limiter.ts
│   ├── routing/
│   │   └── upgrade-proxy.ts
│   ├── metering/
│   │   └── usage-tracker.ts
│   ├── db/
│   │   └── schema.ts          # Drizzle schema
│   ├── gateway-handler.ts     # Request handler factory
│   └── types.ts               # TypeScript types
└── scripts/
    └── seed-dev.ts            # Development seeding
```
