# Fleet-Pulse Railway Deployment Plan

## Overview

Deploy Fleet-Pulse Next.js application to Railway with managed PostgreSQL and Redis. Single production environment with manual deployments via CLI.

---

## Phase 1: Pre-Deployment Preparation

### 1.1 Clerk Configuration
- [ ] In Clerk Dashboard, copy **Production** keys (`pk_live_*`, `sk_live_*`)
- [ ] Add your Railway domain to Clerk's **Domains** settings (after first deploy)

### 1.2 Cloudflare R2 Configuration
- [ ] Verify R2 bucket exists with appropriate permissions
- [ ] Note your `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`
- [ ] Configure CORS after Railway domain is known

### 1.3 Create Dockerfile

Create `Dockerfile` at project root:

```dockerfile
FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV SKIP_ENV_VALIDATION=1
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

### 1.4 Update next.config.ts

Add `output: "standalone"` to enable Docker-optimized builds:

```ts
// next.config.ts
const config: NextConfig = {
  output: "standalone",
  // ... existing config
};
```

**File to modify:** [next.config.ts](next.config.ts)

---

## Phase 2: Railway Project Setup

### 2.1 Create Railway Project
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project (or do via dashboard)
railway init
```

### 2.2 Add Services (via Railway Dashboard)
1. **PostgreSQL**: Add → Database → PostgreSQL
2. **Redis**: Add → Database → Redis
3. **Next.js App**: Add → Empty Service

### 2.3 Link Local Project
```bash
cd /Users/vitorio-personal/Documents/fleet-pulse
railway link
# Select your project and the Next.js service
```

---

## Phase 3: Environment Variables

### 3.1 Configure in Railway Dashboard (Next.js Service → Variables)

**Reference Variables (auto-populated by Railway):**
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

**Manual Variables:**
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_ACCOUNT_ID=your_account_id
R2_BUCKET_NAME=fleet-pulse
```

**Optional (have defaults):**
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## Phase 4: Deployment

### 4.1 First Deployment
```bash
railway up
```

Railway will:
1. Detect Dockerfile and build image
2. Deploy container with environment variables
3. Provision public URL

### 4.2 Run Database Migrations
```bash
railway run npx prisma migrate deploy
```

### 4.3 Get Your Domain
```bash
railway open
```

Note the URL (e.g., `https://fleet-pulse-production.up.railway.app`)

---

## Phase 5: Post-Deployment Configuration

### 5.1 Update Clerk Domain
- Go to Clerk Dashboard → Domains
- Add your Railway production URL

### 5.2 Update NEXT_PUBLIC_APP_URL
- In Railway Dashboard → Variables
- Set `NEXT_PUBLIC_APP_URL` to your actual Railway domain
- Redeploy: `railway up`

### 5.3 Configure R2 CORS
In Cloudflare R2 Dashboard → Bucket → Settings → CORS:
```json
[
  {
    "AllowedOrigins": ["https://your-app.up.railway.app"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### 5.4 Verify Deployment
```bash
# Check logs
railway logs

# Verify database
railway run npx prisma studio
```

---

## Phase 6: Ongoing Operations

### 6.1 Manual Deployments
```bash
railway up
```

### 6.2 Database Migrations
```bash
# Always run after schema changes
railway run npx prisma migrate deploy
```

### 6.3 View Logs
```bash
railway logs -f
```

### 6.4 Connect to Database
```bash
railway connect postgres
```

---

## Potential Pitfalls & Solutions

| Issue | Solution |
|-------|----------|
| Build fails with env validation | Ensure `SKIP_ENV_VALIDATION=1` in Dockerfile |
| Prisma binary mismatch | Use `prisma generate` during Docker build |
| Clerk redirects fail | Verify domain in Clerk Dashboard matches Railway URL |
| R2 uploads fail with CORS | Add Railway domain to R2 CORS settings |
| Database connection timeout | Railway manages connections; if issues, check Prisma connection string |
| Redis connection refused | Verify `REDIS_URL` uses Railway's reference syntax |

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `Dockerfile` | Create (new file) |
| `next.config.ts` | Modify (add `output: "standalone"`) |

---

## Data Migration

Fresh start approach selected:
- Production database will start empty
- Run `railway run npx prisma migrate deploy` to create schema
- Users will register fresh with production Clerk keys
- No data migration from dev database needed


## Railway connection Shortcuts
Added to zsh alias
alias fleetdb='psql "postgresql://postgres:REDACTED@your-db-host:5432/railway"'
which enables connecting to the DB with just writing `fleetdb`