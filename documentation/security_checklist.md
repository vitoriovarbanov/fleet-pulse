# Security Checklist for Next.js + tRPC + Prisma Applications

This document provides a comprehensive security checklist for modern web applications using the following tech stack:

- **Next.js 15+** (App Router, React Server Components)
- **React 19**
- **tRPC v11**
- **Prisma ORM**
- **Clerk Authentication**
- **Redis** (caching, rate limiting)
- **PostgreSQL**

Use this as a template for security audits and new project setups.

---

## Table of Contents

1. [Critical Vulnerabilities (2025)](#1-critical-vulnerabilities-2025)
2. [Authentication & Session Security](#2-authentication--session-security)
3. [XSS & Input Sanitization](#3-xss--input-sanitization)
4. [Security Headers (CSP, CORS, HSTS)](#4-security-headers-csp-cors-hsts)
5. [Rate Limiting & DoS Protection](#5-rate-limiting--dos-protection)
6. [Database & Prisma Security](#6-database--prisma-security)
7. [Error Handling & Logging Security](#7-error-handling--logging-security)
8. [Dependency & Supply Chain Security](#8-dependency--supply-chain-security)
9. [Quick Reference Checklist](#9-quick-reference-checklist)

---

## 1. Critical Vulnerabilities (2025)

### Known CVEs Affecting This Stack

| CVE | Component | Severity | Fixed In | Description |
|-----|-----------|----------|----------|-------------|
| [CVE-2025-55182](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) | React 19 RSC | **CVSS 10.0** | 19.0.3+ | Remote Code Execution via RSC protocol |
| [CVE-2025-66478](https://nextjs.org/blog/CVE-2025-66478) | Next.js App Router | **CVSS 10.0** | 15.0.7+ | Downstream impact of React RSC vulnerability |
| [CVE-2025-29927](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) | Next.js Middleware | **High** | 15.2.3+ | Middleware bypass via `x-middleware-subrequest` header |
| [CVE-2025-43855](https://github.com/trpc/trpc/security/advisories/GHSA-pj3v-9cm8-gvj8) | tRPC WebSocket | **DoS** | 11.1.1+ | Server crash via malformed connectionParams |

### Minimum Safe Versions

```json
{
  "dependencies": {
    "react": "^19.0.3",
    "react-dom": "^19.0.3",
    "next": "^15.2.3",
    "@trpc/server": "^11.1.1",
    "@trpc/client": "^11.1.1",
    "@trpc/react-query": "^11.1.1"
  }
}
```

### Sources

- [React Security Blog](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- [Next.js Security Updates](https://nextjs.org/blog/security-update-2025-12-11)
- [tRPC Security Advisories](https://github.com/trpc/trpc/security/advisories)
- [Microsoft Security Blog - React2Shell](https://www.microsoft.com/en-us/security/blog/2025/12/15/defending-against-the-cve-2025-55182-react2shell-vulnerability-in-react-server-components/)

---

## 2. Authentication & Session Security

### Threats

| Threat | Description | Risk |
|--------|-------------|------|
| **Session Hijacking** | Stealing session cookies to impersonate users | High |
| **Session Fixation** | Setting known session ID before authentication | Medium |
| **CSRF Attacks** | Forging requests on behalf of authenticated users | Medium |
| **Webhook Forgery** | Sending fake webhook events without signature | High |
| **Brute Force** | Password guessing attacks on login endpoints | High |

### Clerk Security Features

Clerk provides built-in protections:
- `__session` cookie with 60-second rotation (mitigates XSS cookie theft)
- `SameSite=Lax` for CSRF protection
- Session token rotation on sign-in/sign-out
- HttpOnly cookies for Frontend API requests

**References:**
- [Clerk XSS Leak Protection](https://clerk.com/docs/security/xss-leak-protection)
- [Clerk CSRF Protection](https://clerk.com/docs/guides/secure/best-practices/csrf-protection)
- [Clerk Fixation Protection](https://clerk.com/docs/guides/secure/best-practices/fixation-protection)

### Solutions

#### 2.1 Webhook Signature Validation

```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { type WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  // Process verified webhook...
  return new Response('OK', { status: 200 });
}
```

#### 2.2 Re-authentication for Sensitive Operations

```typescript
// src/server/api/trpc.ts
export const sensitiveOperationProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const sessionClaims = ctx.session?.sessionClaims;
    const issuedAt = sessionClaims?.iat;

    // Require session issued within last 5 minutes
    if (issuedAt && Date.now() / 1000 - issuedAt > 300) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Please re-authenticate for this operation',
      });
    }
    return next();
  }
);
```

#### 2.3 Session Activity Tracking

```typescript
// src/server/api/routers/auth/service/auth.service.ts
export async function updateLastActivity(userId: string) {
  await db.user.update({
    where: { clerkId: userId },
    data: { lastActiveAt: new Date() },
  });
}
```

### Checklist

| Item | Priority | Status |
|------|----------|--------|
| Implement Clerk webhook signature validation | Critical | ☐ |
| Add `CLERK_WEBHOOK_SECRET` to environment | Critical | ☐ |
| Track user last activity timestamp | Medium | ☐ |
| Require re-auth for sensitive operations | Medium | ☐ |
| Configure Clerk session lifetime | Low | ☐ |
| Enable Clerk device tracking | Low | ☐ |

---

## 3. XSS & Input Sanitization

### Threats

| Threat | Description | Risk |
|--------|-------------|------|
| **Stored XSS** | Malicious scripts saved in database, executed later | Critical |
| **DOM-based XSS** | URL parameters rendered without sanitization | High |
| **React2Shell (CVE-2025-55182)** | RCE via React Server Components | Critical |
| **Prisma Operator Injection** | Query operators bypass authentication | High |
| **dangerouslySetInnerHTML** | Bypasses React's built-in escaping | High |

### Sources

- [React XSS Vulnerabilities](https://www.invicti.com/blog/web-security/is-react-vulnerable-to-xss)
- [Prisma NoSQL-style Injection](https://www.aikido.dev/blog/prisma-and-postgresql-vulnerable-to-nosql-injection)
- [tRPC Security Research](https://medium.com/@LogicalHunter/trpc-security-research-hunting-for-vulnerabilities-in-modern-apis-b0d38e06fa71)

### Solutions

#### 3.1 Install Sanitization Library

```bash
npm install isomorphic-dompurify
```

#### 3.2 HTML Sanitization Utility

```typescript
// src/lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Strip all HTML tags - use for plain text fields
 */
export function stripHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize for safe attribute values
 */
export function sanitizeAttribute(value: string): string {
  return value.replace(/[<>"'&]/g, (char) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;',
    };
    return entities[char] ?? char;
  });
}
```

#### 3.3 Zod Schemas with Sanitization

```typescript
// src/server/api/routers/[feature]/[feature].types.ts
import { z } from 'zod';
import { stripHtml, sanitizeHtml } from '@/lib/sanitize';

// Transform that strips HTML for plain text fields
const sanitizedString = z.string().transform(stripHtml);

// Transform that allows safe HTML for rich text fields
const sanitizedHtmlString = z.string().transform(sanitizeHtml);

// Example schema
export const createVehicleSchema = z.object({
  licensePlate: sanitizedString.pipe(z.string().min(1).max(20)),
  make: sanitizedString.pipe(z.string().min(1).max(50)),
  model: sanitizedString.pipe(z.string().min(1).max(50)),
  notes: sanitizedHtmlString.pipe(z.string().max(2000)).optional(),
});

// IMPORTANT: Never use z.any() or z.unknown() for user input
// WRONG: z.object({ filters: z.any() })
// RIGHT: z.object({ filters: z.object({ status: z.enum(['active', 'inactive']) }) })
```

#### 3.4 Prevent Prisma Operator Injection

```typescript
// src/server/api/common/utils/input-guards.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

/**
 * Ensure a value is a primitive string, not an object
 * Prevents: { password: { not: "" } } attacks
 */
export function ensureString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `${fieldName} must be a string`,
    });
  }
  return value;
}

// Safe user lookup
export async function findUserByEmail(email: unknown) {
  const safeEmail = ensureString(email, 'email');

  // Use findUnique instead of findFirst when possible
  return db.user.findUnique({
    where: { email: safeEmail },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      // NEVER include: passwordHash, apiKey, etc.
    },
  });
}
```

#### 3.5 Safe Rich Text Component

```tsx
// src/components/shared/safe-html.tsx
'use client';

import { sanitizeHtml } from '@/lib/sanitize';
import { useMemo } from 'react';

type SafeHtmlProps = {
  html: string;
  className?: string;
};

export function SafeHtml({ html, className }: SafeHtmlProps) {
  const sanitized = useMemo(() => sanitizeHtml(html), [html]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
```

### Checklist

| Item | Priority | Status |
|------|----------|--------|
| Upgrade React to 19.0.3+ (CVE-2025-55182) | Critical | ☐ |
| Install and configure DOMPurify | Critical | ☐ |
| Add sanitization transforms to Zod schemas | Critical | ☐ |
| Create SafeHtml component wrapper | Critical | ☐ |
| Audit all uses of `dangerouslySetInnerHTML` | Critical | ☐ |
| Ensure Zod schemas use strict types (no `z.any()`) | High | ☐ |
| Validate Prisma query inputs are primitive types | High | ☐ |
| Sanitize URL search parameters before rendering | Medium | ☐ |
| Disable tRPC panel in production | Medium | ☐ |

---

## 4. Security Headers (CSP, CORS, HSTS)

### Threats

| Threat | Description | Risk |
|--------|-------------|------|
| **XSS via Missing CSP** | Injected scripts execute freely | Critical |
| **Clickjacking** | App embedded in malicious iframe | High |
| **MIME Sniffing** | Browser executes files as scripts | Medium |
| **Man-in-the-Middle** | HTTP requests intercepted | High |
| **CORS Misconfiguration** | API exposed to unauthorized origins | High |
| **Middleware Bypass (CVE-2025-29927)** | Headers bypass security checks | Critical |

### Sources

- [Next.js CSP Guide](https://nextjs.org/docs/pages/guides/content-security-policy)
- [Next.js Middleware Bypass](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass)

### Solutions

#### 4.1 Security Headers in next.config.ts

```typescript
// next.config.ts
import type { NextConfig } from 'next';

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
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
];

const nextConfig: NextConfig = {
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

#### 4.2 CSP with Nonces via Middleware

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Block middleware bypass attack (CVE-2025-29927)
  const subrequestHeader = request.headers.get('x-middleware-subrequest');
  if (subrequestHeader) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' https://api.clerk.dev https://*.clerk.accounts.dev;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)'],
};
```

#### 4.3 CORS Configuration for tRPC

```typescript
// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  'http://localhost:3000',
].filter(Boolean) as string[];

function getCorsHeaders(origin: string | null) {
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

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

const handler = async (req: NextRequest) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: ({ resHeaders }) => createContext(req, resHeaders),
  });

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};

export { handler as GET, handler as POST };
```

#### 4.4 Edge/Reverse Proxy Protection (Nginx)

```nginx
# Block CVE-2025-29927 at edge
proxy_set_header x-middleware-subrequest "";

# Security headers (defense in depth)
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```

### CSP Directives Reference

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | `'self'` | Fallback for unspecified directives |
| `script-src` | `'self' 'nonce-xxx' 'strict-dynamic'` | Allow scripts with nonce only |
| `style-src` | `'self' 'unsafe-inline'` | Required for CSS-in-JS |
| `img-src` | `'self' blob: data: https:` | Allow images from HTTPS |
| `connect-src` | `'self' https://api.clerk.dev` | Whitelist API endpoints |
| `frame-ancestors` | `'none'` | Prevent clickjacking |
| `form-action` | `'self'` | Prevent form hijacking |
| `object-src` | `'none'` | Block plugins |

### Checklist

| Item | Priority | Status |
|------|----------|--------|
| Upgrade Next.js to 15.2.3+ (CVE-2025-29927) | Critical | ☐ |
| Block `x-middleware-subrequest` header | Critical | ☐ |
| Add security headers in `next.config.ts` | Critical | ☐ |
| Implement CSP with nonces in middleware | Critical | ☐ |
| Configure strict CORS with allowed origins | Critical | ☐ |
| Add `NEXT_PUBLIC_APP_URL` to environment | High | ☐ |
| Block bypass header at reverse proxy | Medium | ☐ |
| Test CSP with [CSP Evaluator](https://csp-evaluator.withgoogle.com/) | Medium | ☐ |
| Enable HSTS preloading | Low | ☐ |

---

## 5. Rate Limiting & DoS Protection

### Threats

| Threat | Description | Risk |
|--------|-------------|------|
| **Brute Force** | Password guessing, credential stuffing | Critical |
| **DDoS** | Overwhelming server with requests | High |
| **API Abuse** | Data scraping, inventory hoarding | High |
| **tRPC WebSocket DoS (CVE-2025-43855)** | Server crash via malformed params | High |
| **Expensive Operation Abuse** | Reports, exports drain resources | Medium |

### Sources

- [Redis Rate Limiting](https://redis.io/glossary/rate-limiting/)
- [Brute Force Prevention](https://medium.com/@sandunilakshika2026/prevent-brute-force-attacks-in-node-js-using-redis-and-rate-limiter-flexible-d93ecc4235f9)

### Solutions

#### 5.1 Install Rate Limiting Package

```bash
npm install @upstash/ratelimit @upstash/redis
```

#### 5.2 Rate Limiter Setup

```typescript
// src/server/api/common/middlewares/rate-limit.middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { TRPCError } from '@trpc/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimiters = {
  // Standard API: 100 req / 10 sec
  standard: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '10 s'),
    prefix: 'ratelimit:standard',
  }),

  // Auth endpoints: 5 req / 1 min (brute force protection)
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'ratelimit:auth',
  }),

  // Sensitive operations: 10 req / 1 min
  sensitive: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'ratelimit:sensitive',
  }),

  // Expensive queries: 5 req / 1 min
  expensive: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'ratelimit:expensive',
  }),

  // IP-based spam protection: 20 req / 10 sec
  antiSpam: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '10 s'),
    prefix: 'ratelimit:antispam',
  }),
};

export type RateLimitType = keyof typeof rateLimiters;

export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'standard'
): Promise<void> {
  const { success, reset } = await rateLimiters[type].limit(identifier);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
    });
  }
}

export function getRateLimitIdentifier(
  ip: string | null,
  userId?: string | null
): string {
  return userId ? `user:${userId}` : `ip:${ip ?? 'unknown'}`;
}
```

#### 5.3 Rate Limited Procedures

```typescript
// src/server/api/trpc.ts
const createRateLimitMiddleware = (type: RateLimitType) => {
  return t.middleware(async ({ ctx, next }) => {
    const ip = getClientIp(ctx.headers);
    const identifier = getRateLimitIdentifier(ip, ctx.session?.userId);
    await checkRateLimit(identifier, type);
    return next();
  });
};

export const authRateLimitedProcedure = publicProcedure.use(
  createRateLimitMiddleware('auth')
);

export const protectedRateLimitedProcedure = protectedProcedure.use(
  createRateLimitMiddleware('standard')
);

export const expensiveOperationProcedure = protectedProcedure.use(
  createRateLimitMiddleware('expensive')
);
```

#### 5.4 IP Blocking for Repeat Offenders

```typescript
// src/server/api/common/middlewares/ip-block.middleware.ts
const BLOCK_THRESHOLD = 100;
const BLOCK_DURATION = 60 * 60; // 1 hour

export async function trackViolation(ip: string): Promise<void> {
  const key = `violations:${ip}`;
  const violations = await redis.incr(key);

  if (violations === 1) {
    await redis.expire(key, 600); // 10 min window
  }

  if (violations >= BLOCK_THRESHOLD) {
    await redis.setex(`blocked:${ip}`, BLOCK_DURATION, '1');
  }
}

export async function isIpBlocked(ip: string): Promise<boolean> {
  return (await redis.get(`blocked:${ip}`)) === '1';
}
```

### Rate Limit Presets Reference

| Preset | Limit | Window | Use Case |
|--------|-------|--------|----------|
| `standard` | 100 req | 10 sec | Normal API calls |
| `auth` | 5 req | 1 min | Login, signup, password reset |
| `sensitive` | 10 req | 1 min | Delete, role changes |
| `expensive` | 5 req | 1 min | Reports, exports |
| `antiSpam` | 20 req | 10 sec | Public endpoints |

### Checklist

| Item | Priority | Status |
|------|----------|--------|
| Upgrade tRPC to 11.1.1+ (CVE-2025-43855) | Critical | ☐ |
| Install `@upstash/ratelimit` | Critical | ☐ |
| Configure Redis connection | Critical | ☐ |
| Create rate limit middleware | Critical | ☐ |
| Apply rate limiting to auth endpoints | Critical | ☐ |
| Apply rate limiting to expensive operations | High | ☐ |
| Implement IP extraction from headers | High | ☐ |
| Add graceful degradation for Redis failures | High | ☐ |
| Implement IP blocking for repeat offenders | Medium | ☐ |
| Configure CDN/WAF rate limiting | Medium | ☐ |

---

## 6. Database & Prisma Security

### Threats

| Threat | Description | Risk |
|--------|-------------|------|
| **SQL Injection via Raw Queries** | `$queryRawUnsafe` with user input | Critical |
| **Operator Injection** | Query operators bypass auth | High |
| **Time-Based ORM Leak** | Data enumeration via timing | Medium |
| **Mass Assignment** | Extra fields in create/update | High |
| **Data Exposure** | Returning sensitive fields | High |

### Sources

- [Prisma SQL Injection](https://www.nodejs-security.com/blog/prisma-raw-query-sql-injection)
- [Prisma Operator Injection](https://www.aikido.dev/blog/prisma-and-postgresql-vulnerable-to-nosql-injection)
- [Prisma ORM Timing Attacks](https://www.elttam.com/blog/plorming-your-primsa-orm/)

### Solutions

#### 6.1 Safe Prisma Query Patterns

```typescript
// VULNERABLE - String concatenation
async function vulnerableSearch(userInput: string) {
  return db.$queryRawUnsafe(
    `SELECT * FROM "User" WHERE email LIKE '%${userInput}%'`
  );
}

// SAFE - Parameterized query
async function safeSearch(userInput: string) {
  return db.$queryRaw`
    SELECT * FROM "User"
    WHERE email LIKE ${`%${userInput}%`}
  `;
}
```

#### 6.2 Select/Omit Patterns

```typescript
// src/server/api/routers/users/users.repository.ts
export const userPublicSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

// NEVER expose: passwordHash, apiKey, resetToken

export const usersRepository = {
  findById: async (id: string) => {
    return db.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });
  },

  findMany: async (params: { skip?: number; take?: number }) => {
    return db.user.findMany({
      select: userPublicSelect,
      skip: params.skip ?? 0,
      take: Math.min(params.take ?? 20, 100), // Cap at 100
    });
  },
};
```

#### 6.3 Prevent Mass Assignment

```typescript
// Define exactly what fields can be updated
const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  // role - cannot be self-updated
  // status - cannot be self-updated
});

export async function updateUser(userId: string, input: unknown) {
  const data = updateUserSchema.parse(input);
  return db.user.update({
    where: { id: userId },
    data,
    select: userPublicSelect,
  });
}
```

#### 6.4 Pagination Guards

```typescript
// src/server/api/common/utils/pagination.ts
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export function toPrismaArgs(pagination: z.infer<typeof paginationSchema>) {
  return {
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
  };
}
```

#### 6.5 Secure Docker Compose

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - '127.0.0.1:5432:5432'  # Bind to localhost only
    security_opt:
      - no-new-privileges:true
    deploy:
      resources:
        limits:
          memory: 512M

  redis:
    image: redis:7-alpine
    ports:
      - '127.0.0.1:6379:6379'
    command: redis-server --appendonly yes ${REDIS_PASSWORD:+--requirepass ${REDIS_PASSWORD}}
```

#### 6.6 Database User Permissions (Production)

```sql
-- Create application user with minimal permissions
CREATE ROLE fleet_pulse_app WITH LOGIN PASSWORD 'secure_password';

GRANT CONNECT ON DATABASE fleet_pulse TO fleet_pulse_app;
GRANT USAGE ON SCHEMA public TO fleet_pulse_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fleet_pulse_app;

-- Prevent schema modifications
REVOKE CREATE ON SCHEMA public FROM fleet_pulse_app;
```

### Checklist

| Item | Priority | Status |
|------|----------|--------|
| Never use `$queryRawUnsafe` with user input | Critical | ☐ |
| Validate inputs are primitive types | Critical | ☐ |
| Use `findUnique` instead of `findFirst` | Critical | ☐ |
| Define explicit `select` for all queries | Critical | ☐ |
| Never expose password hashes or tokens | Critical | ☐ |
| Parse input through Zod before Prisma | High | ☐ |
| Implement pagination with max page size | High | ☐ |
| Use SSL for database in production | High | ☐ |
| Bind database ports to localhost in Docker | High | ☐ |
| Create app DB user with minimal permissions | High | ☐ |

---

## 7. Error Handling & Logging Security

### Threats

| Threat | Description | Risk |
|--------|-------------|------|
| **Information Disclosure** | Stack traces reveal internals | High |
| **Log Injection** | Malicious content in logs | Medium |
| **Sensitive Data in Logs** | Passwords, tokens logged | Critical |
| **Missing Security Logging** | No audit trail | Medium |

### Solutions

#### 7.1 Install Logging Package

```bash
npm install pino pino-pretty
```

#### 7.2 Secure Logger Setup

```typescript
// src/server/api/common/logger.ts
import pino from 'pino';

const REDACT_PATHS = [
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'authorization',
  'cookie',
];

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: REDACT_PATHS,
    censor: '[REDACTED]',
  },
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});
```

#### 7.3 Security Event Logger

```typescript
// src/server/api/common/security-logger.ts
export type SecurityEventType =
  | 'AUTH_SUCCESS'
  | 'AUTH_FAILURE'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'ADMIN_ACTION';

export function logSecurityEvent(event: {
  type: SecurityEventType;
  userId?: string | null;
  ip?: string | null;
  details?: Record<string, unknown>;
}): void {
  const criticalEvents = ['PERMISSION_DENIED', 'SUSPICIOUS_ACTIVITY'];
  const method = criticalEvents.includes(event.type) ? 'error' : 'info';

  logger[method]({ event: event.type, ...event });
}
```

#### 7.4 Safe Error Handling

```typescript
// src/server/api/common/utils/error-handler.ts
const SAFE_ERROR_MESSAGES: Record<string, string> = {
  P2002: 'A record with this value already exists',
  P2025: 'Record not found',
  DATABASE_ERROR: 'A database error occurred',
  INTERNAL_ERROR: 'An unexpected error occurred',
};

export function toSafeTRPCError(error: unknown): TRPCError {
  if (error instanceof PrismaClientKnownRequestError) {
    const safeMessage = SAFE_ERROR_MESSAGES[error.code] ?? SAFE_ERROR_MESSAGES.DATABASE_ERROR;

    logger.error({ type: 'prisma_error', code: error.code });

    return new TRPCError({
      code: error.code === 'P2025' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
      message: safeMessage,
    });
  }

  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: SAFE_ERROR_MESSAGES.INTERNAL_ERROR,
  });
}
```

#### 7.5 tRPC Error Formatter

```typescript
// src/server/api/trpc.ts
const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error, ctx }) {
    logger.error({
      type: 'trpc_error',
      code: error.code,
      path: shape.data?.path,
      userId: ctx?.session?.userId,
    });

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: process.env.NODE_ENV === 'development'
          ? error.cause instanceof ZodError ? error.cause.flatten() : null
          : null,
        stack: undefined, // Never expose stack traces
      },
      message: process.env.NODE_ENV === 'production' && error.code === 'INTERNAL_SERVER_ERROR'
        ? 'An unexpected error occurred'
        : shape.message,
    };
  },
});
```

#### 7.6 Log Injection Prevention

```typescript
// src/server/api/common/utils/log-sanitize.ts
export function sanitizeForLog(input: string, maxLength = 200): string {
  return input
    .replace(/[\r\n]/g, ' ')       // Remove newlines
    .replace(/\x1b\[[0-9;]*m/g, '') // Remove ANSI codes
    .replace(/[\x00-\x1f\x7f]/g, '') // Remove control chars
    .slice(0, maxLength);
}
```

### Checklist

| Item | Priority | Status |
|------|----------|--------|
| Install Pino logger with redaction | Critical | ☐ |
| Create security event logger | Critical | ☐ |
| Sanitize TRPCError messages in production | Critical | ☐ |
| Remove stack traces from responses | Critical | ☐ |
| Configure tRPC error formatter | Critical | ☐ |
| Log authentication failures | High | ☐ |
| Log rate limit violations | High | ☐ |
| Implement log injection prevention | High | ☐ |
| Create audit logger for sensitive ops | High | ☐ |

---

## 8. Dependency & Supply Chain Security

### Threats

| Threat | Description | Risk |
|--------|-------------|------|
| **Known CVEs** | Outdated packages with vulnerabilities | Critical |
| **Supply Chain Attacks** | Compromised npm packages | Critical |
| **Typosquatting** | Malicious lookalike packages | High |
| **Lockfile Injection** | Modified package-lock.json | High |

### Sources

- [React Supply Chain Attacks](https://www.webpronews.com/react-vulnerabilities-supply-chain-attacks-bypassing-xss-protections/)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)

### Solutions

#### 8.1 Package.json Security Scripts

```json
{
  "scripts": {
    "audit": "npm audit --audit-level=high",
    "audit:fix": "npm audit fix",
    "audit:prod": "npm audit --omit=dev --audit-level=high",
    "check:deps": "npx depcheck",
    "check:outdated": "npm outdated"
  }
}
```

#### 8.2 GitHub Actions Security Workflow

```yaml
# .github/workflows/security.yml
name: Security Checks

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'

jobs:
  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm audit --audit-level=high

  lockfile-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          npx lockfile-lint \
            --path package-lock.json \
            --type npm \
            --validate-https \
            --allowed-hosts npm \
            --validate-integrity
```

#### 8.3 Dependabot Configuration

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
```

#### 8.4 NPM Configuration

```ini
# .npmrc
package-lock=true
audit-level=high
save-exact=true
ignore-scripts=true
registry=https://registry.npmjs.org/
```

#### 8.5 Secure Dockerfile

```dockerfile
FROM node:20.11.0-alpine AS base

# Run as non-root
RUN addgroup --system nodejs && adduser --system nextjs

# Install security updates
RUN apk update && apk upgrade --no-cache

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore-scripts

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
USER nextjs

COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
# ... rest of build

CMD ["node", "server.js"]
```

#### 8.6 Runtime Version Verification

```typescript
// src/server/verify-deps.ts
export function verifyDependencies(): void {
  const criticalDeps = [
    { name: 'react', minVersion: '19.0.3' },
    { name: 'next', minVersion: '15.2.3' },
    { name: '@trpc/server', minVersion: '11.1.1' },
  ];

  for (const dep of criticalDeps) {
    const pkg = require(`${dep.name}/package.json`);
    if (compareVersions(pkg.version, dep.minVersion) < 0) {
      console.error(`SECURITY: ${dep.name}@${pkg.version} < ${dep.minVersion}`);
      if (process.env.NODE_ENV === 'production') process.exit(1);
    }
  }
}
```

### Checklist

| Item | Priority | Status |
|------|----------|--------|
| Upgrade React to 19.0.3+ | Critical | ☐ |
| Upgrade Next.js to 15.2.3+ | Critical | ☐ |
| Upgrade tRPC to 11.1.1+ | Critical | ☐ |
| Run `npm audit` and fix vulnerabilities | Critical | ☐ |
| Set up Dependabot | High | ☐ |
| Create GitHub Actions security workflow | High | ☐ |
| Configure lockfile-lint in CI | High | ☐ |
| Use exact versions (`save-exact=true`) | High | ☐ |
| Create secure Dockerfile | Medium | ☐ |
| Verify critical versions at runtime | Medium | ☐ |

---

## 9. Quick Reference Checklist

### Critical Priority (Do First)

| # | Item | Section |
|---|------|---------|
| 1 | Upgrade React to 19.0.3+ | CVEs |
| 2 | Upgrade Next.js to 15.2.3+ | CVEs |
| 3 | Upgrade tRPC to 11.1.1+ | CVEs |
| 4 | Block `x-middleware-subrequest` header | Headers |
| 5 | Implement rate limiting on auth endpoints | Rate Limiting |
| 6 | Add CSP headers | Headers |
| 7 | Install DOMPurify and sanitize inputs | XSS |
| 8 | Configure CORS with allowed origins | Headers |
| 9 | Implement webhook signature validation | Auth |
| 10 | Never use `$queryRawUnsafe` with user input | Database |
| 11 | Remove stack traces from production errors | Logging |
| 12 | Run `npm audit` and fix vulnerabilities | Dependencies |

### High Priority (Do Soon)

| # | Item | Section |
|---|------|---------|
| 13 | Define explicit `select` for all Prisma queries | Database |
| 14 | Validate inputs are primitive types | XSS |
| 15 | Add security headers in next.config.ts | Headers |
| 16 | Log authentication failures | Logging |
| 17 | Set up Dependabot | Dependencies |
| 18 | Implement pagination with max limits | Database |
| 19 | Parse all input through Zod | XSS |
| 20 | Create security event logger | Logging |

### Medium Priority (Plan For)

| # | Item | Section |
|---|------|---------|
| 21 | Implement IP blocking for repeat offenders | Rate Limiting |
| 22 | Set up audit logging | Logging |
| 23 | Create secure Dockerfile | Dependencies |
| 24 | Test CSP with evaluator tools | Headers |
| 25 | Configure log rotation | Logging |

### Environment Variables Required

```env
# Authentication
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_WEBHOOK_SECRET=

# Database
DATABASE_URL=postgresql://...?sslmode=require

# Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

---

## Sources & References

### Official Documentation
- [Next.js Security](https://nextjs.org/docs/pages/guides/content-security-policy)
- [Clerk Security](https://clerk.com/docs/security/overview)
- [tRPC Security](https://trpc.io/docs/server/security)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access)

### Vulnerability Databases
- [React Security Blog](https://react.dev/blog)
- [Next.js Security Advisories](https://nextjs.org/blog)
- [tRPC Security Advisories](https://github.com/trpc/trpc/security/advisories)
- [Snyk Vulnerability Database](https://security.snyk.io/)

### Security Research
- [Prisma NoSQL Injection - Aikido](https://www.aikido.dev/blog/prisma-and-postgresql-vulnerable-to-nosql-injection)
- [tRPC Security Research - Medium](https://medium.com/@LogicalHunter/trpc-security-research-hunting-for-vulnerabilities-in-modern-apis-b0d38e06fa71)
- [Next.js Middleware Bypass - ProjectDiscovery](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass)
- [React2Shell - Microsoft](https://www.microsoft.com/en-us/security/blog/2025/12/15/defending-against-the-cve-2025-55182-react2shell-vulnerability-in-react-server-components/)

---

*Last Updated: December 2025*
*Template Version: 1.0.0*
