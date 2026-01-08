#!/bin/bash

# UpGrade Platform - Local Development Setup
# This script sets up everything needed to run the platform locally

set -e

echo "==========================================="
echo "  UpGrade Platform - Development Setup"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}Prerequisites OK${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLATFORM_DIR="$(dirname "$SCRIPT_DIR")"
APPS_DIR="$(dirname "$PLATFORM_DIR")"

# Start Docker services
echo "Starting Docker services..."
cd "$PLATFORM_DIR"
docker-compose up -d

echo "Waiting for databases to be ready..."
sleep 5

# Check if databases are healthy
until docker exec upgrade-platform-db pg_isready -U postgres > /dev/null 2>&1; do
    echo "  Waiting for platform-db..."
    sleep 2
done

until docker exec upgrade-tenant-db pg_isready -U postgres > /dev/null 2>&1; do
    echo "  Waiting for tenant-db..."
    sleep 2
done

echo -e "${GREEN}Databases ready${NC}"
echo ""

# Setup Gateway
echo "Setting up upgrade-gateway..."
cd "$APPS_DIR/upgrade-gateway"

if [ ! -f .env.local ]; then
    cat > .env.local << EOF
# Platform Database (local Docker)
PLATFORM_DATABASE_URL=postgres://postgres:postgres@localhost:5432/platform

# UpGrade Backend (local Docker)
UPGRADE_BACKEND_URL=http://localhost:3030

# Encryption key (for development)
ENCRYPTION_KEY=dev-encryption-key-32-bytes-long

# Neon API (not needed for local dev)
# NEON_API_KEY=
# NEON_PROJECT_ID=
EOF
    echo "  Created .env.local"
fi

npm install --silent
echo -e "${GREEN}Gateway ready${NC}"
echo ""

# Setup Dashboard
echo "Setting up upgrade-dashboard..."
cd "$APPS_DIR/upgrade-dashboard"

if [ ! -f .env.local ]; then
    cat > .env.local << EOF
# Platform Database (local Docker)
PLATFORM_DATABASE_URL=postgres://postgres:postgres@localhost:5432/platform

# NextAuth
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# OAuth - Configure these for SSO
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=

# Allow self-signup for development
ALLOW_SELF_SIGNUP=true
EOF
    echo "  Created .env.local"
fi

npm install --silent
echo -e "${GREEN}Dashboard ready${NC}"
echo ""

# Create platform database tables
echo "Setting up platform database..."
cd "$APPS_DIR/upgrade-gateway"
npm run db:push 2>/dev/null || echo "  (Tables may already exist)"

# Seed development data
echo "Seeding development data..."
npx tsx scripts/seed-dev.ts 2>/dev/null || echo "  (Seed may have already run)"
echo ""

echo "==========================================="
echo -e "${GREEN}  Setup Complete!${NC}"
echo "==========================================="
echo ""
echo "Services running:"
echo "  - Platform DB:    localhost:5432"
echo "  - Tenant DB:      localhost:5433"
echo "  - UpGrade Backend: localhost:3030"
echo ""
echo "To start the apps:"
echo ""
echo "  # Terminal 1 - API Gateway"
echo "  cd apps/upgrade-gateway && npm run dev"
echo ""
echo "  # Terminal 2 - Dashboard"
echo "  cd apps/upgrade-dashboard && npm run dev"
echo ""
echo "Then open:"
echo "  - Gateway:   http://localhost:3001/api/v1/health"
echo "  - Dashboard: http://localhost:3002"
echo ""
echo "To stop Docker services:"
echo "  cd apps/upgrade-platform && docker-compose down"
echo ""
