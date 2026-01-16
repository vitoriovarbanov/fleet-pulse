# Security Checklist for Fleet Pulse

This document provides a security checklist tailored for Fleet Pulse's architecture:

- **Next.js 16** with App Router (Client-Side Rendering only - no RSC)
- **React 19** (client components with `'use client'`)
- **tRPC v11** (HTTP transport, no WebSockets)
- **Prisma 7** with PostgreSQL
- **Clerk** for authentication
- **Redis** for caching and rate limiting
- **Railway** for deployment

> **Note:** This app does NOT use React Server Components or Server Actions. All pages use `'use client'` directives with tRPC for API communication.

---

## Table of Contents

1. [Current Security Status](#1-current-security-status)
2. [Security Headers](#2-security-headers)
3. [CORS Configuration](#3-cors-configuration)
4. [XSS & Input Sanitization](#4-xss--input-sanitization)
5. [Rate Limiting & DoS Protection](#5-rate-limiting--dos-protection)
6. [Database & Prisma Security](#6-database--prisma-security)
7. [Error Handling & Logging](#7-error-handling--logging)
8. [CI/CD Security](#8-cicd-security)
9. [Quick Reference Checklist](#9-quick-reference-checklist)

---

## 1. Current Security Status

### What's Already Implemented ✅

| Feature | Location | Status |
|---------|----------|--------|
| Rate limiting with Redis | `src/server/api/common/middlewares/rate-limit.middleware.ts` | ✅ Done |
| Logging with sensitive data redaction | `src/server/api/common/logger.ts` | ✅ Done |
| tRPC protected procedures | `src/server/api/trpc.ts` | ✅ Done |
| Admin role enforcement | `src/server/api/trpc.ts` | ✅ Done |
| Explicit Prisma `select` clauses | Repository files | ✅ Done |
| Pagination with limits | `listVehiclesInputSchema`, `listDriversInputSchema` | ✅ Done |
| Zod input validation | All router type files | ✅ Done |
| Non-root Docker user | `Dockerfile` | ✅ Done |

### Package Versions (All Safe) ✅

| Package | Your Version | Minimum Safe | Status |
|---------|--------------|--------------|--------|
| React | 19.2.3 | 19.0.3+ | ✅ Safe |
| Next.js | 16.1.0 | 15.2.3+ | ✅ Safe |
| tRPC | 11.8.1 | 11.1.1+ | ✅ Safe |
| Prisma | 7.2.0 | N/A | ✅ Current |

### CVEs NOT Applicable to This App

These vulnerabilities don't affect Fleet Pulse because of its architecture:

| CVE | Why Not Applicable |
|-----|-------------------|
| CVE-2025-55182 (React2Shell) | Requires React Server Components - you use client-only rendering |
| CVE-2025-66478 (Next.js RSC) | Downstream of React RSC vulnerability - not applicable |
| CVE-2025-29927 (Middleware bypass) | Only affects apps using `middleware.ts` for auth - you use tRPC procedures |
| CVE-2025-43855 (tRPC WebSocket DoS) | Requires WebSocket transport - you use HTTP only |

---

## 2. Security Headers

### Threats

| Threat | Description | Risk |
|--------|-------------|------|
| **Clickjacking** | App embedded in malicious iframe | High |
| **XSS via Missing CSP** | Injected scripts execute freely | High |
| **MIME Sniffing** | Browser executes files as scripts | Medium |
| **Man-in-the-Middle** | HTTP requests intercepted | High |

### Solution: Add Headers in next.config.ts

```typescript
// next.config.ts
import type { NextConfig } from 'next';

import './src/env';

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Required for Next.js
      "style-src 'self' 'unsafe-inline'", // Required for Tailwind
      "img-src 'self' blob: data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.clerk.dev https://*.clerk.accounts.dev https://api.maptiler.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  skipTrailingSlashRedirect: true,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

### Checklist

| Item | Priority | Status |
|------|----------|--------|
| Add X-Frame-Options: DENY | Critical | ☐ |
| Add X-Content-Type-Options: nosniff | Critical | ☐ |
| Add Strict-Transport-Security (HSTS) | Critical | ☐ |
| Add Content-Security-Policy | High | ☐ |
| Add Referrer-Policy | Medium | ☐ |
| Add Permissions-Policy | Medium | ☐ |
| Test CSP with [CSP Evaluator](https://csp-evaluator.withgoogle.com/) | Medium | ☐ |

---

## 3. CORS Configuration

### Threat

Without CORS configuration, your tRPC API could be called from any origin, enabling CSRF-like attacks.

### Solution: Add CORS to tRPC Route

```typescript
// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

const ALLOWED_ORIGINS = [
  env.NEXT_PUBLIC_APP_URL,
  'http://localhost:3005',
  'http://localhost:3000',
].filter(Boolean);

function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-trpc-source',
    'Access-Control-Max-Age': '86400',
  };

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

// Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

const createContext = async (req: NextRequest, resHeaders: Headers) => {
  return createTRPCContext({
    headers: resHeaders,
    req,
  });
};

const handler = async (req: NextRequest) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: ({ resHeaders }) => createContext(req, resHeaders),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
          }
        : undefined,
  });

  // Add CORS headers to response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};

export { handler as GET, handler as POST };
```

### Checklist

| Item | Priority | Status |
|------|----------|--------|
| Add CORS headers to tRPC route | Critical | ☐ |
| Handle OPTIONS preflight requests | Critical | ☐ |
| Whitelist only production + localhost origins | Critical | ☐ |
| Add CORS to OpenAPI routes if exposed externally | Medium | ☐ |

---

## 4. XSS & Input Sanitization

### Threats

| Threat | Description | Risk |
|--------|-------------|------|
| **Stored XSS** | Malicious scripts saved in database, executed later | High |
| **DOM-based XSS** | URL parameters rendered without sanitization | Medium |
| **Prisma Operator Injection** | Query operators bypass authentication | Medium |

### Current Protection ✅

- All user input goes through Zod schemas before reaching Prisma
- React automatically escapes JSX content
- No `dangerouslySetInnerHTML` usage in codebase

### Optional: Add DOMPurify for Rich Text Fields

If you ever need to render user-provided HTML (e.g., notes with formatting):

```bash
npm install isomorphic-dompurify
```

```typescript
// src/lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

export function stripHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}
```

### Note on z.any() in Output Schemas

Your output schemas use `z.any()` for OpenAPI documentation:

```typescript
// vehicles.types.ts
export const vehicleDetailOutputSchema = z.any();
```

**This is acceptable** because:
1. Output schemas don't validate user input
2. They're only used for OpenAPI spec generation
3. Input schemas use strict types (which is what matters)

### Checklist

| Item | Priority | Status |
|------|----------|--------|
| All user input validated through Zod | Critical | ✅ Done |
| No dangerouslySetInnerHTML usage | Critical | ✅ Done |
| Input schemas use strict types (no z.any()) | Critical | ✅ Done |
| Install DOMPurify if rich text needed | Low | ☐ Optional |

---

## 5. Rate Limiting & DoS Protection

### Current Implementation ✅

You have a comprehensive rate limiting system in `src/server/api/common/middlewares/rate-limit.middleware.ts`:

| Preset | Limit | Window | Use Case |
|--------|-------|--------|----------|
| `AUTH` | 5 req | 1 min | Authentication attempts |
| `DRIVER_CREATE` | 10 req | 1 hour | Driver creation |
| `VEHICLE_CREATE` | 10 req | 1 hour | Vehicle creation |
| `FILE_UPLOAD` | 20 req | 1 hour | File uploads |
| `INVITATION` | 10 req | 1 hour | Invitation sending |
| `MUTATION` | 100 req | 1 min | General mutations |
| `BULK` | 5 req | 1 hour | Bulk operations |

### Checklist

| Item | Priority | Status |
|------|----------|--------|
| Rate limiting middleware exists | Critical | ✅ Done |
| Redis connection configured | Critical | ✅ Done |
| Auth endpoints rate limited | Critical | ✅ Done |
| Expensive operations rate limited | High | ✅ Done |
| Graceful degradation on Redis failure | High | ✅ Done |

---

## 6. Database & Prisma Security

### Current Protection ✅

Your repositories follow secure patterns:

1. **Explicit `select` clauses** - Only return needed fields
2. **Organization scoping** - Queries filtered by `organizationId`
3. **No `$queryRawUnsafe`** - All queries use Prisma's query builder
4. **Pagination limits** - Max 100 items per request

### Minor Improvement: Use findUnique Where Possible

In `vehicles.repository.ts:77`, you use `findFirst`:

```typescript
// Current
return db.vehicle.findFirst({
  where,
  select: vehicleDetailSelect,
});

// Preferred when querying by unique field
return db.vehicle.findUnique({
  where: { id: vehicleId },
  select: vehicleDetailSelect,
});
```

`findUnique` is slightly faster and clearer about intent. However, your current use is safe because you're filtering by ID.

### Checklist

| Item | Priority | Status |
|------|----------|--------|
| Never use `$queryRawUnsafe` with user input | Critical | ✅ Done |
| Define explicit `select` for all queries | Critical | ✅ Done |
| Implement pagination with max limits | High | ✅ Done |
| Scope queries by organizationId | High | ✅ Done |
| Parse input through Zod before Prisma | High | ✅ Done |
| Prefer `findUnique` over `findFirst` for ID lookups | Low | ☐ Optional |

---

## 7. Error Handling & Logging

### Current Implementation ✅

Your logging system in `src/server/api/common/logger.ts` includes:

- **Sensitive data redaction** - Emails, tokens, keys automatically redacted
- **Structured JSON logging** - Production-ready format
- **Request ID tracking** - Correlate logs across requests
- **Log level filtering** - Only warn/error in production

### Improvement: Sanitize tRPC Errors in Production

Your current error formatter exposes `zodError` in production:

```typescript
// Current - src/server/api/trpc.ts
errorFormatter({ shape, error }) {
  return {
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  };
}
```

**Recommended change:**

```typescript
errorFormatter({ shape, error }) {
  const isDev = process.env.NODE_ENV === 'development';

  return {
    ...shape,
    data: {
      ...shape.data,
      // Only expose Zod errors in development
      zodError: isDev && error.cause instanceof ZodError
        ? error.cause.flatten()
        : null,
      // Never expose stack traces
      stack: undefined,
    },
    // Generic message for internal errors in production
    message: !isDev && error.code === 'INTERNAL_SERVER_ERROR'
      ? 'An unexpected error occurred'
      : shape.message,
  };
}
```

### Checklist

| Item | Priority | Status |
|------|----------|--------|
| Logger with sensitive data redaction | Critical | ✅ Done |
| Request ID tracking | High | ✅ Done |
| Hide zodError in production | High | ☐ |
| Hide stack traces in production | High | ☐ |
| Generic message for INTERNAL_SERVER_ERROR | Medium | ☐ |

---

## 8. CI/CD Security

### Missing Items

Your project doesn't have:
- `.npmrc` for npm security settings
- `.github/dependabot.yml` for automated updates
- `.github/workflows/security.yml` for security checks

### Solution: Add Security Files

**1. Create `.npmrc`:**

```ini
# .npmrc
package-lock=true
audit-level=high
save-exact=true
registry=https://registry.npmjs.org/
```

**2. Create `.github/dependabot.yml`:**

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
    groups:
      production-dependencies:
        dependency-type: 'production'
        update-types: ['minor', 'patch']
      development-dependencies:
        dependency-type: 'development'
        update-types: ['minor', 'patch']
```

**3. Create `.github/workflows/security.yml`:**

```yaml
# .github/workflows/security.yml
name: Security Checks

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm audit --audit-level=high
        continue-on-error: true # Don't fail build, but report

  lockfile-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx lockfile-lint --path package-lock.json --type npm --validate-https --allowed-hosts npm --validate-integrity
```

**4. Add scripts to `package.json`:**

```json
{
  "scripts": {
    "audit": "npm audit --audit-level=high",
    "audit:fix": "npm audit fix"
  }
}
```

### Checklist

| Item | Priority | Status |
|------|----------|--------|
| Run `npm audit` and fix vulnerabilities | Critical | ☐ |
| Create `.npmrc` with security settings | High | ☐ |
| Set up Dependabot | High | ☐ |
| Create GitHub Actions security workflow | High | ☐ |
| Add audit scripts to package.json | Medium | ☐ |

---

## 9. Quick Reference Checklist

### Critical Priority

| # | Item | Status |
|---|------|--------|
| 1 | Add security headers in `next.config.ts` | ☐ |
| 2 | Configure CORS for tRPC endpoints | ☐ |
| 3 | Sanitize tRPC errors in production | ☐ |
| 4 | Run `npm audit` and fix vulnerabilities | ☐ |

### High Priority

| # | Item | Status |
|---|------|--------|
| 5 | Set up Dependabot | ☐ |
| 6 | Create GitHub Actions security workflow | ☐ |
| 7 | Create `.npmrc` with security settings | ☐ |
| 8 | Add Content-Security-Policy header | ☐ |

### Already Complete ✅

| # | Item | Status |
|---|------|--------|
| 9 | Rate limiting with Redis | ✅ |
| 10 | Logging with sensitive data redaction | ✅ |
| 11 | Zod input validation on all endpoints | ✅ |
| 12 | Explicit Prisma select clauses | ✅ |
| 13 | Organization-scoped queries | ✅ |
| 14 | Non-root Docker user | ✅ |
| 15 | Package versions above CVE thresholds | ✅ |

### Environment Variables

```env
# Required (already configured)
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
DATABASE_URL=postgresql://...?sslmode=require
REDIS_URL=

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

---

## Sources & References

### Official Documentation
- [Next.js Security Headers](https://nextjs.org/docs/pages/api-reference/next-config-js/headers)
- [Clerk Security](https://clerk.com/docs/security/overview)
- [tRPC Security](https://trpc.io/docs/server/security)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access)

### Security Research
- [Prisma NoSQL-style Injection](https://www.aikido.dev/blog/prisma-and-postgresql-vulnerable-to-nosql-injection)
- [tRPC Security Research](https://medium.com/@LogicalHunter/trpc-security-research-hunting-for-vulnerabilities-in-modern-apis-b0d38e06fa71)

---

*Last Updated: January 2026*
*Tailored for Fleet Pulse architecture (CSR + tRPC)*
