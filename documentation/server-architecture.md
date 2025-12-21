# Server Architecture

This document defines the server-side folder structure and patterns for the Fleet Pulse application. Use this as a template for other Next.js + tRPC projects.

## Tech Stack

```
Next.js 16 (App Router)
├── tRPC                  → End-to-end typed API
├── Prisma                → ORM, migrations
├── Zod                   → Validation (shared FE/BE)
└── Clerk                 → Auth, roles, orgs

Infrastructure
├── Postgres              → Database (Railway)
├── Redis                 → Rate limiting, caching
└── Vercel/Railway        → Hosting
```

---

## Folder Structure

```
src/
└── server/
    ├── api/
    │   ├── common/
    │   │   ├── enums/
    │   │   │   └── [enum-name].enum.ts
    │   │   ├── middlewares/
    │   │   │   └── rate-limit.middleware.ts
    │   │   ├── utils/
    │   │   │   └── cookie-management.ts
    │   │   └── logger.ts
    │   ├── routers/
    │   │   ├── auth/
    │   │   │   ├── service/
    │   │   │   │   └── auth.service.ts
    │   │   │   ├── auth.router.ts
    │   │   │   └── auth.types.ts
    │   │   ├── vehicles/
    │   │   │   ├── repository/
    │   │   │   │   ├── vehicles.repository.ts
    │   │   │   │   └── vehicles.repository.types.ts
    │   │   │   ├── service/
    │   │   │   │   ├── vehicles.service.ts
    │   │   │   │   └── vehicles.service.types.ts
    │   │   │   ├── vehicles.router.ts
    │   │   │   └── vehicles.types.ts
    │   │   └── [feature]/
    │   │       ├── repository/              # Only if feature has DB access
    │   │       │   ├── [feature].repository.ts
    │   │       │   └── [feature].repository.types.ts
    │   │       ├── service/
    │   │       │   ├── [feature].service.ts
    │   │       │   └── [feature].service.types.ts
    │   │       ├── [feature].router.ts
    │   │       └── [feature].types.ts
    │   ├── root.ts
    │   └── trpc.ts
    ├── database.ts
    └── redis.ts
```

---

## Core Files

### `trpc.ts`

The tRPC foundation file that establishes:

- **Context creation** - Receives headers/request, provides session data to all procedures
- **tRPC initialization** - Configured with SuperJSON transformer for Date/Map/Set serialization
- **Error formatting** - Properly serializes Zod validation errors for client consumption
- **Procedure types**:
  - `publicProcedure` - No auth required
  - `protectedProcedure` - Validates Clerk session via cookies
  - `protectedRateLimitedProcedure` - Adds rate limiting on top of auth

### `root.ts`

Aggregates all feature routers into a single `appRouter`:

```typescript
import { createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "./routers/auth/auth.router";
import { vehiclesRouter } from "./routers/vehicles/vehicles.router";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  vehicles: vehiclesRouter,
  // Add new routers here
});

export type AppRouter = typeof appRouter;
```

The `AppRouter` type is exported to the client for end-to-end type safety.

---

## Feature Router Pattern

Each feature follows a consistent structure with clear separation of concerns.

### Folder Contents

```
routers/[feature]/
├── repository/                        # Only if feature has DB access
│   ├── [feature].repository.ts        # Data access layer (SQL/Prisma queries)
│   └── [feature].repository.types.ts  # TS types for repository
├── service/
│   ├── [feature].service.ts           # Business logic, orchestration
│   └── [feature].service.types.ts     # TS types for service
├── [feature].router.ts                # tRPC procedures (queries/mutations)
└── [feature].types.ts                 # Zod schemas + inferred TS types
```

### File Responsibilities

| File | Purpose |
|------|---------|
| `[feature].router.ts` | Defines tRPC procedures, calls service layer, handles input validation via Zod |
| `[feature].service.ts` | Business logic, validation, orchestration — calls repository for DB access |
| `[feature].repository.ts` | Encapsulates data access logic — all Prisma/SQL queries live here |
| `[feature].types.ts` | Zod schemas for inputs/outputs, exports inferred TypeScript types |

### Layer Responsibilities

```
Router → Service → Repository → Database
```

| Layer | Responsibility |
|-------|----------------|
| **Router** | Input validation (Zod), authentication, calls service |
| **Service** | Business logic, validation rules, orchestrates repository calls |
| **Repository** | Data access only — Prisma queries, raw SQL, database transactions |

### When Repository is NOT Needed

Skip the repository layer when a feature **does not interact with the database**:

```
routers/auth/
├── service/
│   ├── auth.service.ts      # Calls Clerk API directly
│   └── auth.service.types.ts
├── auth.router.ts
└── auth.types.ts
```

Examples where repository is skipped:
- **Auth** — communicates with Clerk/Firebase, no direct DB queries
- **Email** — calls external email service (SendGrid, Resend)
- **Payments** — interacts with Stripe API

**Rule:** If the service only talks to external APIs (not your database), no repository is needed.

### Sub-routers (Optional)

For complex features, nest related routers:

```
routers/groups/
├── sub-routers/
│   └── group-invites/
│       ├── repository/
│       ├── service/
│       ├── group-invites.router.ts
│       └── group-invites.types.ts
├── repository/
├── service/
├── groups.router.ts
└── groups.types.ts
```

---

## Common Folder

Shared utilities used across all features:

```
common/
├── enums/
│   └── [enum-name].enum.ts       # Shared enum definitions (e.g., user-role.enum.ts)
├── middlewares/
│   └── rate-limit.middleware.ts  # Configurable rate limiting using Redis
├── utils/
│   └── cookie-management.ts      # Helpers for secure cookie operations
└── logger.ts                     # Structured logging utility
```

### File Purposes

| File | Purpose |
|------|---------|
| `enums/[name].enum.ts` | Individual enum files (e.g., `user-role.enum.ts`, `vehicle-status.enum.ts`) |
| `rate-limit.middleware.ts` | Configurable rate limiting middleware using Redis |
| `cookie-management.ts` | Helpers for reading/writing secure cookies (session tokens, preferences) |
| `logger.ts` | Structured logging utility (e.g., using `pino` or similar) |

### Usage Example

```typescript
// In trpc.ts
import { rateLimitMiddleware } from "./common/middlewares/rate-limit.middleware";
import { logger } from "./common/logger";

// In a router
import { UserRole } from "@/server/api/common/enums/user-role.enum";
```

---

## Server Root Files

### `database.ts`

Prisma client with singleton pattern to prevent multiple instances during hot reload:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
```

### `redis.ts`

Single Redis instance for rate limiting, caching, and session storage:

```typescript
import { Redis } from "ioredis";

export const redis = new Redis(process.env.REDIS_URL!);
```

---

## Adding a New Feature

1. Create the feature folder under `routers/`:
   ```
   routers/new-feature/
   ├── repository/                          # If feature has DB access
   │   ├── new-feature.repository.ts
   │   └── new-feature.repository.types.ts
   ├── service/
   │   ├── new-feature.service.ts
   │   └── new-feature.service.types.ts
   ├── new-feature.router.ts
   └── new-feature.types.ts
   ```

2. Define Zod schemas in `new-feature.types.ts`

3. Implement data access in `new-feature.repository.ts` (if DB access needed)

4. Implement business logic in `new-feature.service.ts`

5. Create procedures in `new-feature.router.ts`

6. Register the router in `root.ts`:
   ```typescript
   import { newFeatureRouter } from "./routers/new-feature/new-feature.router";

   export const appRouter = createTRPCRouter({
     // ...existing routers
     newFeature: newFeatureRouter,
   });
   ```

---

## Reference

Based on patterns from: https://github.com/lucas-barake/invite-system-demo
