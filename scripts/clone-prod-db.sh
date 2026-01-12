#!/bin/bash

# Clone Production Database Script
# Clones Railway production PostgreSQL to local fleet_pulse_prod_copy database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="backups"
LOCAL_DB_HOST="localhost"
LOCAL_DB_PORT="5433"
LOCAL_DB_USER="postgres"
LOCAL_DB_PASSWORD="postgres"
LOCAL_DB_NAME="fleet_pulse_prod_copy"
TIMESTAMP=$(date +%Y-%m-%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/prod-${TIMESTAMP}.sql"

echo -e "${GREEN}=== Production Database Clone Script ===${NC}"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}Error: Railway CLI is not installed.${NC}"
    echo "Install it with: npm install -g @railway/cli"
    exit 1
fi

# Check if Railway is authenticated
if ! railway whoami &> /dev/null; then
    echo -e "${RED}Error: Railway CLI is not authenticated.${NC}"
    echo "Run: railway login"
    exit 1
fi

# Check if project is linked
if ! railway status &> /dev/null; then
    echo -e "${RED}Error: Railway project is not linked.${NC}"
    echo "Run: railway link"
    exit 1
fi

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}Error: pg_dump is not installed.${NC}"
    echo "Install PostgreSQL client tools to continue."
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql is not installed.${NC}"
    echo "Install PostgreSQL client tools to continue."
    exit 1
fi

# Check if local database container is running
if ! docker ps | grep -q "fleet-pulse-db-prod-copy"; then
    echo -e "${YELLOW}Warning: Production copy database container is not running.${NC}"
    echo "Starting containers with: docker compose up -d"
    docker compose up -d
    sleep 3
fi

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo -e "${GREEN}Step 1/3: Fetching production database URL from Railway...${NC}"

# Get the DATABASE_PUBLIC_URL from Railway (public proxy URL for external access)
PROD_DATABASE_URL=$(railway variables --json 2>/dev/null | grep -o '"DATABASE_PUBLIC_URL": "[^"]*"' | cut -d'"' -f4)

if [ -z "$PROD_DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_PUBLIC_URL not found in Railway variables.${NC}"
    echo ""
    echo "To fix this, add DATABASE_PUBLIC_URL to your Railway project:"
    echo "  1. Go to Railway Dashboard → Postgres service → Variables"
    echo "  2. Add: DATABASE_PUBLIC_URL = your public connection string"
    echo "     (Found in Postgres → Connect → Public Network)"
    echo ""
    exit 1
fi

echo -e "${GREEN}Step 2/3: Creating backup from production database...${NC}"
echo "Backup file: ${BACKUP_FILE}"
echo ""

# Dump production database using the public URL
pg_dump "${PROD_DATABASE_URL}" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    > "${BACKUP_FILE}" 2>&1

# Check if the dump was successful
if [ ! -s "${BACKUP_FILE}" ]; then
    echo -e "${RED}Error: Failed to create database backup.${NC}"
    echo "The backup file is empty. Check your Railway connection."
    rm -f "${BACKUP_FILE}"
    exit 1
fi

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo -e "Backup created: ${BACKUP_SIZE}"

echo -e "${GREEN}Step 3/3: Restoring to local database...${NC}"

# Set password for psql
export PGPASSWORD="${LOCAL_DB_PASSWORD}"

# Drop and recreate the local database
psql -h "${LOCAL_DB_HOST}" -p "${LOCAL_DB_PORT}" -U "${LOCAL_DB_USER}" -d postgres <<EOF
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${LOCAL_DB_NAME}' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS ${LOCAL_DB_NAME};
CREATE DATABASE ${LOCAL_DB_NAME};
EOF

# Restore to local database
psql -h "${LOCAL_DB_HOST}" -p "${LOCAL_DB_PORT}" -U "${LOCAL_DB_USER}" -d "${LOCAL_DB_NAME}" < "${BACKUP_FILE}"

unset PGPASSWORD

echo ""
echo -e "${GREEN}=== Clone Complete ===${NC}"
echo ""
echo "Production database cloned to local:"
echo "  Host: ${LOCAL_DB_HOST}"
echo "  Port: ${LOCAL_DB_PORT}"
echo "  Database: ${LOCAL_DB_NAME}"
echo "  User: ${LOCAL_DB_USER}"
echo ""
echo "Connection string:"
echo "  postgresql://${LOCAL_DB_USER}:${LOCAL_DB_PASSWORD}@${LOCAL_DB_HOST}:${LOCAL_DB_PORT}/${LOCAL_DB_NAME}"
echo ""
echo "Backup saved to: ${BACKUP_FILE}"
echo ""
echo -e "${YELLOW}Tip: To use this database, update DATABASE_URL in your .env file or use:${NC}"
echo "  npm run db:connect-prod-copy"
