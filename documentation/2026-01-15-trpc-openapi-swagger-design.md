# tRPC OpenAPI Documentation with Swagger UI

## Overview

Add Swagger UI documentation to the tRPC API at `/api/docs`, accessible only to authenticated users. Users can view all endpoints, their input/output schemas, and interactively test them using their own authentication.

## Requirements

- **Access**: Authenticated users only (Clerk)
- **Location**: `/api/docs` for Swagger UI
- **Interactive**: Users can "Try it out" and execute real API calls
- **No raw spec download**: OpenAPI JSON not exposed publicly

## Architecture

### Route Structure

```
/api/docs          → Swagger UI page (protected)
/api/openapi/*     → REST endpoints for OpenAPI calls
```

### Data Flow

1. User navigates to `/api/docs`
2. Clerk middleware checks authentication → redirect to sign-in if needed
3. Swagger UI loads, fetches OpenAPI spec from server-side generation
4. User clicks "Try it out" → request goes to `/api/openapi/...` → forwarded to tRPC procedure
5. Response flows back through Swagger UI

## Dependencies

```json
{
  "trpc-to-openapi": "^2.0.0",
  "swagger-ui-react": "^5.x",
  "@types/swagger-ui-react": "^5.x"
}
```

## Files to Create

### 1. `src/server/api/openapi.ts`

OpenAPI document generator that introspects the appRouter and generates OpenAPI 3.0 spec.

```typescript
import { generateOpenApiDocument } from 'trpc-to-openapi';
import { appRouter } from './root';

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Fleet Pulse API',
  version: '1.0.0',
  baseUrl: '/api/openapi',
  description: 'Fleet management API documentation',
  tags: ['Health', 'Auth', 'Drivers', 'Files', 'Vehicles'],
});
```

### 2. `src/app/api/openapi/[...path]/route.ts`

REST handler that bridges OpenAPI requests to tRPC procedures.

```typescript
import { createOpenApiNextHandler } from 'trpc-to-openapi';
import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';

const handler = createOpenApiNextHandler({
  router: appRouter,
  createContext: createTRPCContext,
});

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
```

### 3. `src/app/(dashboard)/docs/page.tsx`

Swagger UI page protected by Clerk (inside dashboard route group for auth).

```typescript
'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { useEffect, useState } from 'react';

export default function DocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    // Fetch spec from internal API route
    fetch('/api/docs/spec')
      .then(res => res.json())
      .then(setSpec);
  }, []);

  if (!spec) return <div>Loading...</div>;

  return <SwaggerUI spec={spec} />;
}
```

### 4. `src/app/api/docs/spec/route.ts`

Internal route to serve OpenAPI spec (only accessible from authenticated context).

```typescript
import { openApiDocument } from '@/server/api/openapi';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(openApiDocument);
}
```

## Files to Modify

### 1. `src/server/api/trpc.ts`

Add OpenAPI meta type to tRPC initialization:

```typescript
import { OpenApiMeta } from 'trpc-to-openapi';

const t = initTRPC
  .context<TRPCContext>()
  .meta<OpenApiMeta>()
  .create({
    transformer: superjson,
    // ... existing config
  });
```

### 2. Router Files - Add `.meta()` Annotations

Each procedure needs OpenAPI metadata. Example for drivers router:

```typescript
// src/server/api/routers/drivers/drivers.router.ts

getById: protectedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/drivers/{id}',
      tags: ['Drivers'],
      summary: 'Get driver by ID',
      description: 'Retrieves a single driver by their unique identifier',
      protect: true,
    },
  })
  .input(z.object({ id: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    // ... existing implementation
  }),

list: protectedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/drivers',
      tags: ['Drivers'],
      summary: 'List all drivers',
      description: 'Returns a paginated list of drivers for the organization',
      protect: true,
    },
  })
  .input(listDriversInputSchema)
  .query(async ({ ctx, input }) => {
    // ... existing implementation
  }),
```

### Routers to Annotate

- `health.router.ts` - Health check endpoints
- `auth.router.ts` - Authentication endpoints
- `drivers.router.ts` - Driver CRUD operations
- `files.router.ts` - File upload/management
- `vehicles.router.ts` - Vehicle CRUD operations

## OpenAPI Tags

Organize endpoints by feature:

| Tag | Description |
|-----|-------------|
| Health | System health and status checks |
| Auth | Authentication and user management |
| Drivers | Driver profile management |
| Files | File upload and storage |
| Vehicles | Vehicle fleet management |

## Authentication in Swagger

- Swagger UI inherits the user's Clerk session cookie
- No separate API key or bearer token configuration needed
- "Try it out" calls use existing authentication context
- Protected procedures enforce their existing auth guards

## Error Handling

OpenAPI responses include standard error schemas:

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `422 Unprocessable Entity` - Validation error (Zod)
- `429 Too Many Requests` - Rate limited
- `500 Internal Server Error` - Server error

## Implementation Notes

1. **superjson compatibility**: `trpc-to-openapi` works with superjson transformer
2. **Zod to OpenAPI**: Input/output schemas automatically convert to OpenAPI schemas
3. **Path parameters**: Use `{param}` syntax in path, must match input schema field
4. **Query vs Mutation**: Queries map to GET, mutations map to POST/PUT/DELETE based on `.meta()`

## Testing

After implementation:

1. Run `npm run dev`
2. Sign in to the application
3. Navigate to `/docs` (redirects from dashboard)
4. Verify all endpoints appear with correct schemas
5. Test "Try it out" on a few endpoints
6. Verify unauthorized access redirects to sign-in
