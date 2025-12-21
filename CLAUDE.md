# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Start local services (PostgreSQL + Redis)
docker compose up -d

# Generate Prisma client after schema changes
npx prisma generate

# Apply database migrations
npx prisma migrate dev

# Push schema to database (without migration)
npx prisma db push
```

## Environment Setup

Copy `.env.example` to `.env.development` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk auth keys

Local services via Docker Compose run at `postgres://postgres:postgres@localhost:5432/fleet_pulse` and `redis://localhost:6379`.

## Architecture

### Tech Stack
- **Next.js 16** with App Router and React 19
- **tRPC v11** for type-safe API layer
- **Prisma 7** with PostgreSQL (using `@prisma/adapter-pg`)
- **Clerk** for authentication
- **Redis** for caching (via ioredis)
- **Tailwind CSS v4** with shadcn/ui components

### Key Patterns

**tRPC Setup:**
- Server initialization: `src/server/api/trpc.ts` (context, procedures)
- Router aggregation: `src/server/api/root.ts`
- Feature routers: `src/server/api/routers/{feature}/{feature}.router.ts`
- Client provider: `src/trpc/react.tsx` (exports `api` hook)
- HTTP endpoint: `src/app/api/trpc/[trpc]/route.ts`

**Procedures:** Use `publicProcedure` for unauthenticated endpoints, `protectedProcedure` for authenticated ones.

**Environment Validation:** All env vars are validated via `@t3-oss/env-nextjs` in `src/env.ts`. Use `SKIP_ENV_VALIDATION=1` for Docker builds.

**Prisma Client:** Generated to `src/generated/prisma/`. Singleton instance at `src/server/database.ts`.

### Route Groups
- `(auth)/*` - Sign-in/sign-up pages (Clerk components)
- `(dashboard)/*` - Protected dashboard with sidebar layout

### Component Organization
- `components/ui/` - shadcn/ui primitives
- `components/shared/` - Reusable components (loading spinner, error boundary, theme toggle)
- `components/animated/` - Framer Motion wrappers
- `components/layout/` - Header, sidebar

### Import Alias
Use `@/*` for `src/*` imports (configured in tsconfig.json).

## Code Style

ESLint enforces:
- Type imports: `import type { X }` or inline `import { type X }`
- Unused vars: prefix with `_` to ignore
- No explicit `any` - use proper types
- No floating promises - await async calls
- Prefer nullish coalescing (`??`) over logical or (`||`)
- Use `type` keyword over `interface`