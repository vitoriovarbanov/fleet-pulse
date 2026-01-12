# Database Backup Design: On-Demand Production Clone

**Date:** 2026-01-12
**Status:** Approved
**Goal:** Clone Railway production database to local environment for development and debugging

---

## Overview

A script-based solution to clone the Railway production PostgreSQL database to a separate local database (`fleet_pulse_prod_copy`) on-demand. This provides realistic data for debugging without affecting the primary development database.

---

## Components

### 1. Docker Compose Update

Add a second PostgreSQL database to `docker-compose.yml`:

```yaml
postgres-prod-copy:
  image: postgres:16-alpine
  container_name: fleet-pulse-db-prod-copy
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: fleet_pulse_prod_copy
  ports:
    - "5433:5432"
  volumes:
    - postgres_prod_copy_data:/var/lib/postgresql/data
```

This runs alongside the existing dev database on port 5433.

---

### 2. Clone Script

New file: `scripts/clone-prod-db.sh`

**Responsibilities:**
1. Check prerequisites (Railway CLI installed and authenticated)
2. Create `backups/` directory if it doesn't exist
3. Connect to Railway and retrieve production connection string
4. Run `pg_dump` with timestamped filename (e.g., `backups/prod-2026-01-12.sql`)
5. Drop and recreate `fleet_pulse_prod_copy` database
6. Restore the dump to local production copy database

**Usage:**
```bash
npm run db:clone-prod
```

**Scope limitations:**
- No automatic scheduling
- No data sanitization
- No R2 file sync (document URLs point to production R2)

---

### 3. Package.json Scripts

```json
{
  "db:clone-prod": "./scripts/clone-prod-db.sh",
  "db:connect-prod-copy": "psql postgresql://postgres:postgres@localhost:5433/fleet_pulse_prod_copy"
}
```

---

### 4. Environment Setup

Add to `.env.development`:
```
DATABASE_URL_PROD_COPY=postgresql://postgres:postgres@localhost:5433/fleet_pulse_prod_copy
```

To use the production copy, temporarily change `DATABASE_URL` or create a `.env.prod-copy` file.

---

### 5. Gitignore Update

Add to `.gitignore`:
```
backups/
```

---

## Disaster Recovery (Manual)

If production database is lost or corrupted, restore from local backup:

**Step 1: Get Railway database connection string**
```bash
railway variables -s production | grep DATABASE_URL
# Or from Railway dashboard: Project → Database → Connect → Connection URL
```

**Step 2: Restore from latest backup**
```bash
psql "YOUR_RAILWAY_DATABASE_URL" < backups/prod-YYYY-MM-DD.sql
```

**Step 3: Verify restoration**
```bash
psql "YOUR_RAILWAY_DATABASE_URL" -c "SELECT COUNT(*) FROM users;"
```

**Important notes:**
- Backup freshness depends on last `npm run db:clone-prod` execution
- R2 files (documents, images) are stored separately and unaffected by database loss
- Clerk user data lives in Clerk's infrastructure - only `clerkId` mappings are in the database

---

## File Structure

```
fleet-pulse/
├── scripts/
│   └── clone-prod-db.sh      # Clone script
├── backups/                   # Backup storage (gitignored)
│   └── prod-YYYY-MM-DD.sql   # Timestamped dumps
├── docker-compose.yml         # Add second postgres service
├── .gitignore                 # Add backups/
├── .env.development           # Add DATABASE_URL_PROD_COPY
└── package.json               # Add db:clone-prod script
```

---

## Prerequisites

Before using the clone script:

1. **Railway CLI installed**: `npm install -g @railway/cli`
2. **Railway CLI authenticated**: `railway login`
3. **Railway project linked**: `railway link` (run once in project directory)
4. **Local Docker running**: `docker compose up -d`

---

## Summary

| Aspect | Solution |
|--------|----------|
| Goal | Clone production to local for debugging |
| Trigger | Manual (`npm run db:clone-prod`) |
| Local database | Separate instance on port 5433 |
| Backup location | `backups/prod-YYYY-MM-DD.sql` |
| Disaster recovery | Manual restore using documented commands |
| Data freshness | As recent as last clone |
