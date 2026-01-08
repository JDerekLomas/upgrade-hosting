# UpGrade Dashboard

Tenant dashboard for the hosted multi-tenant UpGrade platform. Provides experiment management, API key management, team collaboration, and usage analytics.

## Features

- Google/GitHub SSO authentication
- Experiment management (create, edit, analyze)
- API key generation and revocation
- Team member invitations
- Usage monitoring and plan management

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure OAuth providers (see below)
# Then start the dashboard
npm run dev
```

Open [http://localhost:3002](http://localhost:3002).

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Set authorized redirect URI: `http://localhost:3002/api/auth/callback/google`
4. Copy Client ID and Secret to `.env.local`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set authorization callback URL: `http://localhost:3002/api/auth/callback/github`
4. Copy Client ID and Secret to `.env.local`

## Pages

| Route | Description |
|-------|-------------|
| `/login` | SSO sign-in page |
| `/experiments` | List and manage experiments |
| `/experiments/new` | Create new experiment |
| `/experiments/[id]` | Experiment details and results |
| `/api-keys` | Manage API keys |
| `/team` | Team member management |
| `/usage` | Usage analytics and billing |
| `/settings` | Tenant settings |

## Authentication Flow

1. User visits dashboard
2. Redirected to `/login` if not authenticated
3. Signs in with Google or GitHub
4. NextAuth checks if user exists in any tenant
5. If invited, accepts invitation and creates user
6. If self-signup enabled and no invitation, creates new tenant
7. Session includes tenant context (tenantId, role, etc.)

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx       # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Dashboard shell
│   │   ├── experiments/         # Experiment pages
│   │   ├── api-keys/            # API key management
│   │   ├── team/                # Team management
│   │   └── usage/               # Usage analytics
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth handlers
│   │   └── api-keys/            # API key endpoints
│   └── page.tsx                 # Root redirect
├── components/
│   ├── sidebar.tsx              # Navigation sidebar
│   └── header.tsx               # Page header
└── lib/
    ├── auth.ts                  # NextAuth configuration
    └── utils.ts                 # Utility functions
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PLATFORM_DATABASE_URL` | Neon connection string | Yes |
| `NEXTAUTH_URL` | Base URL for auth | Yes |
| `NEXTAUTH_SECRET` | Session encryption key | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For Google SSO |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | For Google SSO |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | For GitHub SSO |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | For GitHub SSO |
| `ALLOW_SELF_SIGNUP` | Allow new tenant creation | No (default: false) |

## Deployment

Deploy to Vercel:

```bash
vercel
```

Set all environment variables in Vercel dashboard. Update OAuth redirect URIs to production URLs.
