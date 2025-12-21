# Frontend Architecture

This document defines the frontend architecture, folder structure, and patterns for Next.js applications using tRPC, React, and shadcn/ui. This is a reusable template for any project using this tech stack.

## Tech Stack

```
Next.js 15+ (App Router)
├── tRPC Client           → End-to-end typed API calls
├── TanStack Query        → Data fetching, caching, state management
├── Zod                   → Client-side validation (shared with backend)
├── Clerk                 → Authentication UI, session management
└── Server Actions        → Simple form mutations (optional)

React
├── shadcn/ui             → Headless UI components
├── Tailwind CSS          → Styling and design system
├── Framer Motion         → Production-ready animations
├── React Hook Form       → Form state management
└── Sonner                → Toast notifications

Development
├── TypeScript            → Type safety (strict mode)
├── ESLint                → Code quality
└── Prettier              → Code formatting

Infrastructure
├── Vercel                → Deployment and hosting
└── GitHub Actions        → CI/CD pipelines
```

---

## Package Dependencies

### Required Dependencies

```json
{
  "dependencies": {
    "@clerk/nextjs": "^6.12.0",
    "@hookform/resolvers": "^3.9.1",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-slot": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.4",
    "@t3-oss/env-nextjs": "^0.13.10",
    "@tanstack/react-query": "^5.90.12",
    "@tanstack/react-query-devtools": "^5.90.12",
    "@trpc/client": "^11.8.1",
    "@trpc/react-query": "^11.8.1",
    "@trpc/server": "^11.8.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "geist": "^1.3.1",
    "lucide-react": "^0.469.0",
    "next": "16.1.0",
    "next-themes": "^0.4.4",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-hook-form": "^7.54.2",
    "sonner": "^1.7.3",
    "superjson": "^2.2.6",
    "framer-motion": "^11.18.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@typescript-eslint/eslint-plugin": "^8.50.0",
    "@typescript-eslint/parser": "^8.50.0",
    "eslint": "^9",
    "eslint-config-next": "16.1.0",
    "tailwindcss": "^4",
    "typescript": "^5",
    "typescript-eslint": "^8.50.0"
  }
}
```

**Note:** Zod v3.24.1 is the current stable version (not v4). The package `geist` provides the Geist font family. `next-themes` enables dark mode support. `@tanstack/react-query-devtools` is essential for debugging queries during development. `framer-motion` v11+ provides production-ready animations with excellent React 19 support and automatic `prefers-reduced-motion` detection.

---

## Folder Structure

```
src/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Route group for auth pages
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx          # Clerk sign-in page
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/
│   │   │       └── page.tsx          # Clerk sign-up page
│   │   └── layout.tsx                # Auth layout (centered, minimal)
│   ├── (dashboard)/                  # Route group for authenticated pages
│   │   ├── [feature]/
│   │   │   ├── page.tsx              # List/index page
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx          # Detail page
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx      # Edit page
│   │   │   └── new/
│   │   │       └── page.tsx          # Create page
│   │   └── layout.tsx                # Dashboard layout (nav, header)
│   ├── api/
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts          # tRPC API handler
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles
│   └── page.tsx                      # Landing/home page
├── components/
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── ...
│   ├── features/                     # Feature-specific components
│   │   └── [feature]/
│   │       ├── [feature]-form.tsx    # Create/edit form
│   │       ├── [feature]-card.tsx    # Display card
│   │       ├── [feature]-list.tsx    # List with filters
│   │       └── [feature]-table.tsx   # Data table
│   ├── layout/                       # Layout components
│   │   ├── header.tsx                # App header
│   │   ├── sidebar.tsx               # Navigation sidebar
│   │   ├── mobile-nav.tsx            # Mobile navigation
│   │   └── footer.tsx                # Footer
│   └── shared/                       # Shared utility components
│       ├── loading-spinner.tsx
│       ├── error-boundary.tsx
│       ├── protected-route.tsx
│       ├── responsive-wrapper.tsx
│       ├── animated-page.tsx         # Page transition wrapper
│       ├── animated-list.tsx         # Staggered list animations
│       ├── animated-card.tsx         # Interactive card with hover
│       └── theme-toggle.tsx          # Dark mode toggle
├── lib/
│   ├── utils.ts                      # Utility functions (cn helper, etc.)
│   ├── device.ts                     # Device detection utilities
│   ├── animations.ts                 # Framer Motion variants & config
│   └── validations/                  # Frontend-specific validations
│       └── [feature].validation.ts
├── hooks/                            # Custom React hooks
│   ├── use-toast.ts                  # Toast hook (from shadcn)
│   ├── use-media-query.ts            # Responsive design hook
│   ├── use-debounce.ts               # Debounce hook
│   ├── use-device.ts                 # Device detection hook
│   └── use-reduced-motion.ts         # Accessibility: reduced motion
├── trpc/
│   ├── react.tsx                     # tRPC React client setup
│   ├── server.ts                     # tRPC server-side caller (optional)
│   └── shared.ts                     # Shared types and transformer
├── providers/
│   └── theme-provider.tsx            # Dark mode provider (next-themes)
├── env.ts                            # Environment variable validation (t3-env)
└── server/                           # Backend code (see server-architecture.md)
```

---

## Core Setup Files

### 1. Environment Variables - `env.ts`

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    CLERK_SECRET_KEY: z.string().min(1),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default("/dashboard"),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default("/dashboard"),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    NODE_ENV: process.env.NODE_ENV,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
```

### 2. TypeScript Configuration - `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3. Tailwind Configuration - `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 4. PostCSS Configuration - `postcss.config.mjs`

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### 5. ESLint Configuration - `eslint.config.mjs`

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
    },
  },
];

export default eslintConfig;
```

### 6. Global Styles - `app/globals.css`

```css
@import "tailwindcss";

:root {
  /* Base colors */
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;

  /* Card */
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;

  /* Popover */
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;

  /* Primary */
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;

  /* Secondary */
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;

  /* Muted */
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;

  /* Accent */
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;

  /* Destructive */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;

  /* Border */
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;

  /* Radius */
  --radius: 0.5rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;

  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;

  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;

  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;

  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;

  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;

  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;

  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;

  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
}

* {
  @apply border-border;
}

body {
  @apply bg-background text-foreground;
  font-feature-settings: "rlig" 1, "calt" 1;
}
```

### 7. Theme Provider - `providers/theme-provider.tsx`

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

### 8. Root Layout - `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fleet Pulse",
  description: "Modern fleet management application",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={GeistSans.className} suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCReactProvider>
              {children}
              <Toaster />
            </TRPCReactProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### 9. tRPC Client Setup - `trpc/react.tsx`

```tsx
"use client";

import type { AppRouter } from "@/server/api/root";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpBatchLink, loggerLink, TRPCClientError } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import React from "react";
import { transformer } from "./shared";

/**
 * tRPC React client
 * Use this to call tRPC procedures from Client Components
 */
export const api = createTRPCReact<AppRouter>();

type TRPCReactProviderProps = {
  children: React.ReactNode;
};

export function TRPCReactProvider({ children }: TRPCReactProviderProps) {
  const queryClient = React.useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't retry on unauthorized errors
            retry(failureCount, error) {
              if (
                error instanceof TRPCClientError &&
                error.data?.code === "UNAUTHORIZED"
              ) {
                return false;
              }
              return failureCount < 2;
            },
            // Data considered fresh for 30 seconds
            staleTime: 30 * 1000,
            // Refetch on window focus in production only
            refetchOnWindowFocus: process.env.NODE_ENV === "production",
          },
        },
      }),
    []
  );

  const trpcClient = React.useMemo(
    () =>
      api.createClient({
        links: [
          // Logger for development debugging
          loggerLink({
            enabled: (op) =>
              process.env.NODE_ENV === "development" ||
              (op.direction === "down" && op.result instanceof Error),
          }),
          // HTTP batch link - batches multiple requests into one
          httpBatchLink({
            url: "/api/trpc",
            transformer,
            // Add headers for better error tracking
            headers() {
              return {
                "x-trpc-source": "react",
              };
            },
          }),
        ],
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
      {/* React Query DevTools - only in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

### 10. tRPC API Route Handler - `app/api/trpc/[trpc]/route.ts`

```typescript
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { type NextRequest } from "next/server";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest, resHeaders: Headers) => {
  return createTRPCContext({
    headers: resHeaders,
    req,
  });
};

/**
 * tRPC HTTP handler for Next.js App Router
 * Handles all /api/trpc/* requests
 */
const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: ({ resHeaders }) => createContext(req, resHeaders),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
```

### 11. tRPC Server Caller - `trpc/server.ts` (Optional)

**Note:** This file is optional. In Next.js 15+, you can call tRPC procedures directly in Server Components using the pattern below. Only create this file if you need a reusable server-side caller.

```typescript
import "server-only";

import { createTRPCContext } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";
import { createCallerFactory } from "@/server/api/trpc";
import { headers } from "next/headers";

/**
 * Server-side tRPC caller for Server Components
 * Use this to call tRPC procedures from Server Components
 */
const createCaller = createCallerFactory(appRouter);

export const api = createCaller(async () => {
  const headersList = await headers();
  return createTRPCContext({
    headers: headersList,
    req: null,
  });
});
```

**Alternative Pattern (Direct Call in Server Component):**

```tsx
// In a Server Component
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { headers } from "next/headers";

export default async function Page() {
  const headersList = await headers();
  const ctx = await createTRPCContext({
    headers: headersList,
    req: null,
  });

  const caller = appRouter.createCaller(ctx);
  const data = await caller.feature.list();

  return <div>{/* Use data */}</div>;
}
```

### 12. Shared tRPC Types - `trpc/shared.ts`

```typescript
import type { AppRouter } from "@/server/api/root";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

/**
 * Transformer for serializing complex types (Date, Map, Set, etc.)
 */
export const transformer = superjson;

/**
 * Inference helpers for input types
 * @example
 * type CreateInput = RouterInputs['feature']['create'];
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type Item = RouterOutputs['feature']['getById'];
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
```

### 13. Utility Functions - `lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string, locale: string = "en-US"): string {
  return new Date(date).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + "..." : str;
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

### 14. Device Detection Utilities - `lib/device.ts`

```typescript
/**
 * Device type enum
 */
export enum DeviceType {
  MOBILE = "mobile",
  TABLET = "tablet",
  DESKTOP = "desktop",
}

/**
 * Breakpoint configuration (matches Tailwind defaults)
 */
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

/**
 * Get device type from window width
 */
export function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.tablet) return DeviceType.MOBILE;
  if (width < BREAKPOINTS.desktop) return DeviceType.TABLET;
  return DeviceType.DESKTOP;
}

/**
 * Check if device is mobile
 */
export function isMobile(width: number): boolean {
  return width < BREAKPOINTS.tablet;
}

/**
 * Check if device is tablet
 */
export function isTablet(width: number): boolean {
  return width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
}

/**
 * Check if device is desktop
 */
export function isDesktop(width: number): boolean {
  return width >= BREAKPOINTS.desktop;
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

/**
 * Get responsive value based on device type
 */
export function getResponsiveValue<T>(
  width: number,
  values: {
    mobile: T;
    tablet?: T;
    desktop?: T;
  }
): T {
  const deviceType = getDeviceType(width);

  switch (deviceType) {
    case DeviceType.MOBILE:
      return values.mobile;
    case DeviceType.TABLET:
      return values.tablet ?? values.mobile;
    case DeviceType.DESKTOP:
      return values.desktop ?? values.tablet ?? values.mobile;
  }
}
```

### 15. Device Detection Hook - `hooks/use-device.ts`

```typescript
"use client";

import { useEffect, useState } from "react";
import { DeviceType, getDeviceType, isMobile, isTablet, isDesktop, isTouchDevice } from "@/lib/device";

/**
 * Hook to detect device type and window dimensions
 * Follows mobile-first approach with SSR support
 */
export function useDevice() {
  // Start with mobile-first default (SSR-safe)
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  const [deviceType, setDeviceType] = useState<DeviceType>(DeviceType.MOBILE);

  useEffect(() => {
    // Only run on client
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setDeviceType(getDeviceType(window.innerWidth));
    }

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    width: windowSize.width,
    height: windowSize.height,
    deviceType,
    isMobile: isMobile(windowSize.width),
    isTablet: isTablet(windowSize.width),
    isDesktop: isDesktop(windowSize.width),
    isTouchDevice: isTouchDevice(),
  };
}
```

### 16. Media Query Hook - `hooks/use-media-query.ts`

```typescript
"use client";

import { useEffect, useState } from "react";

/**
 * Hook to check if a media query matches
 * Mobile-first approach with SSR support
 */
export function useMediaQuery(query: string): boolean {
  // Default to false for SSR (mobile-first)
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Add listener
    media.addEventListener("change", listener);

    // Cleanup
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoint hooks
 */
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}

export function useIsTablet() {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)");
}

export function useIsAboveTablet() {
  return useMediaQuery("(min-width: 768px)");
}

export function useIsAboveDesktop() {
  return useMediaQuery("(min-width: 1024px)");
}
```

### 17. Debounce Hook - `hooks/use-debounce.ts`

```typescript
"use client";

import { useEffect, useState } from "react";

/**
 * Hook to debounce a value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### 18. Toast Setup - `components/ui/sonner.tsx`

```tsx
"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
```

### 19. Dark Mode Toggle - `components/shared/theme-toggle.tsx`

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 20. Loading Spinner - `components/shared/loading-spinner.tsx`

```tsx
"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-primary border-t-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
```

### 21. Error Boundary Component - `components/shared/error-boundary.tsx`

```tsx
"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Component Patterns

### UI Components (shadcn/ui)

Install shadcn/ui components as needed:

```bash
npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add toast
npx shadcn@latest add table
npx shadcn@latest add card
```

All UI components live in `components/ui/` and follow the shadcn pattern:
- Headless components from Radix UI
- Styled with Tailwind CSS
- Fully customizable via className prop
- Type-safe with TypeScript

### Feature Components Structure

Feature components follow a consistent pattern:

```tsx
// components/features/[feature]/[feature]-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Validation schema (can be imported from server types)
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FeatureFormProps {
  itemId?: string;
  onSuccess?: () => void;
}

export function FeatureForm({ itemId, onSuccess }: FeatureFormProps) {
  const utils = api.useUtils();

  // Fetch existing data if editing
  const { data: item } = api.feature.getById.useQuery(
    { id: itemId! },
    { enabled: !!itemId }
  );

  // Create mutation
  const createMutation = api.feature.create.useMutation({
    onSuccess: () => {
      toast.success("Item created successfully");
      utils.feature.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update mutation
  const updateMutation = api.feature.update.useMutation({
    onSuccess: () => {
      toast.success("Item updated successfully");
      utils.feature.list.invalidate();
      utils.feature.getById.invalidate({ id: itemId! });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: item || {
      name: "",
      description: "",
    },
  });

  function onSubmit(data: FormValues) {
    if (itemId) {
      updateMutation.mutate({ id: itemId, ...data });
    } else {
      createMutation.mutate(data);
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : itemId ? "Update" : "Create"}
        </Button>
      </form>
    </Form>
  );
}
```

### Responsive Layout Components

```tsx
// components/layout/header.tsx
"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsAboveTablet } from "@/hooks/use-media-query";
import { useState } from "react";

export function Header() {
  const isAboveTablet = useIsAboveTablet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-lg md:text-xl font-bold">
          App Name
        </Link>

        {/* Desktop Navigation */}
        {isAboveTablet ? (
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
              Dashboard
            </Link>
            <Link href="/feature-1" className="text-sm font-medium hover:text-primary">
              Feature 1
            </Link>
            <Link href="/feature-2" className="text-sm font-medium hover:text-primary">
              Feature 2
            </Link>
            <UserButton afterSignOutUrl="/" />
          </nav>
        ) : (
          /* Mobile Navigation */
          <div className="flex items-center gap-2">
            <UserButton afterSignOutUrl="/" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {!isAboveTablet && mobileMenuOpen && (
        <div className="border-t border-border bg-background">
          <nav className="container flex flex-col gap-4 py-4 px-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/feature-1"
              className="text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Feature 1
            </Link>
            <Link
              href="/feature-2"
              className="text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Feature 2
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
```

### Responsive Component Example

```tsx
// components/shared/responsive-wrapper.tsx
"use client";

import { useDevice } from "@/hooks/use-device";
import { DeviceType } from "@/lib/device";

interface ResponsiveWrapperProps {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Render different content based on device type
 * Mobile-first approach
 */
export function ResponsiveWrapper({
  mobile,
  tablet,
  desktop,
  children,
}: ResponsiveWrapperProps) {
  const { deviceType } = useDevice();

  // If children provided, render same content for all
  if (children) {
    return <>{children}</>;
  }

  // Render device-specific content
  switch (deviceType) {
    case DeviceType.MOBILE:
      return <>{mobile}</>;
    case DeviceType.TABLET:
      return <>{tablet ?? mobile}</>;
    case DeviceType.DESKTOP:
      return <>{desktop ?? tablet ?? mobile}</>;
    default:
      return <>{mobile}</>;
  }
}
```

---

## Animation Patterns (Framer Motion)

Framer Motion provides production-ready animations that integrate seamlessly with Tailwind CSS and shadcn/ui components. Use animations purposefully to enhance UX, not distract from it.

### Animation Philosophy

| Principle | Description |
|-----------|-------------|
| **Purposeful** | Animations should guide attention, provide feedback, or improve perceived performance |
| **Subtle** | Keep animations fast (150-300ms) and unobtrusive |
| **Consistent** | Use the same easing and duration patterns throughout the app |
| **Accessible** | Respect `prefers-reduced-motion` for users who are motion-sensitive |

### Animation Configuration - `lib/animations.ts`

```typescript
import { type Variants } from "framer-motion";

/**
 * Shared animation configuration
 * Use these to maintain consistency across the app
 */
export const ANIMATION_CONFIG = {
  // Durations (in seconds)
  duration: {
    fast: 0.15,
    normal: 0.25,
    slow: 0.4,
  },
  // Easing curves
  ease: {
    default: [0.25, 0.1, 0.25, 1],
    smooth: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
    spring: { type: "spring", stiffness: 300, damping: 30 },
  },
} as const;

/**
 * Fade in animation variants
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: ANIMATION_CONFIG.duration.normal },
  },
  exit: {
    opacity: 0,
    transition: { duration: ANIMATION_CONFIG.duration.fast },
  },
};

/**
 * Fade in with upward slide
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: ANIMATION_CONFIG.duration.fast },
  },
};

/**
 * Scale in animation (for modals, cards)
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: ANIMATION_CONFIG.duration.fast },
  },
};

/**
 * Slide in from right (for side panels, drawers)
 */
export const slideInRight: Variants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: ANIMATION_CONFIG.duration.fast },
  },
};

/**
 * Stagger children animation (for lists)
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * Individual item for stagger lists
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  },
};
```

### Reduced Motion Hook - `hooks/use-reduced-motion.ts`

```typescript
"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if user prefers reduced motion
 * Always respect this preference for accessibility
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return prefersReducedMotion;
}
```

### Animated Components

#### Animated Page Wrapper - `components/shared/animated-page.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

#### Animated List - `components/shared/animated-list.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface AnimatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
}

export function AnimatedList<T>({
  items,
  renderItem,
  keyExtractor,
  className,
}: AnimatedListProps<T>) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={className}
    >
      {items.map((item, index) => (
        <motion.div key={keyExtractor(item)} variants={staggerItem}>
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

#### Animated Card - `components/shared/animated-card.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className,
  hoverScale = 1.02,
  onClick,
}: AnimatedCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const baseClasses = cn(
    "rounded-lg border bg-card p-4 shadow-sm transition-colors",
    onClick && "cursor-pointer",
    className
  );

  if (prefersReducedMotion) {
    return (
      <div className={cn(baseClasses, "hover:bg-accent")} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={baseClasses}
      whileHover={{ scale: hoverScale, y: -2 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
```

### Integrating with shadcn/ui Components

#### Animated Dialog

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { scaleIn } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { forwardRef } from "react";

const MotionDialogContent = motion.create(
  forwardRef<HTMLDivElement, React.ComponentProps<typeof DialogContent>>(
    (props, ref) => <DialogContent ref={ref} {...props} />
  )
);

interface AnimatedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AnimatedDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
}: AnimatedDialogProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <AnimatePresence mode="wait">
        {open && (
          <MotionDialogContent
            forceMount
            initial={prefersReducedMotion ? undefined : "hidden"}
            animate={prefersReducedMotion ? undefined : "visible"}
            exit={prefersReducedMotion ? undefined : "exit"}
            variants={prefersReducedMotion ? undefined : scaleIn}
          >
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
            {children}
          </MotionDialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
```

#### Animated Button with Loading State

```tsx
"use client";

import { motion } from "framer-motion";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

const MotionButton = motion.create(Button);

interface AnimatedButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ isLoading, loadingText, children, disabled, ...props }, ref) => {
    return (
      <MotionButton
        ref={ref}
        disabled={isLoading || disabled}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || "Loading..."}
          </>
        ) : (
          children
        )}
      </MotionButton>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";
```

### Page Transitions with Layout Animations

```tsx
// app/(dashboard)/layout.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { fadeIn } from "@/lib/animations";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={fadeIn}
          className="flex-1"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
```

### Skeleton Loading with Animation

```tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedSkeletonProps {
  className?: string;
  count?: number;
}

export function AnimatedSkeleton({ className, count = 1 }: AnimatedSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={cn("rounded-md bg-muted", className)}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </>
  );
}

// Usage
function CardSkeleton() {
  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <AnimatedSkeleton className="h-4 w-3/4" />
      <AnimatedSkeleton className="h-4 w-1/2" />
      <AnimatedSkeleton className="h-20 w-full" />
    </div>
  );
}
```

### Combining with Tailwind Animations

Use Tailwind's built-in animations for simple cases, Framer Motion for complex orchestration:

```tsx
// Simple hover effects - use Tailwind
<button className="transition-all duration-200 hover:scale-105 active:scale-95">
  Click me
</button>

// Complex sequences - use Framer Motion
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{
    duration: 0.3,
    delay: 0.1,
    ease: [0.25, 0.1, 0.25, 1]
  }}
>
  Complex animation
</motion.div>

// Combine both - Tailwind for colors, Framer for transforms
<motion.div
  className="bg-card hover:bg-accent transition-colors"
  whileHover={{ y: -4 }}
  transition={{ duration: 0.15 }}
>
  Best of both worlds
</motion.div>
```

### Animation Best Practices

| Do | Don't |
|----|----|
| Use `will-change` sparingly (Framer handles this) | Animate layout properties (`width`, `height`) directly |
| Prefer `transform` and `opacity` for performance | Create animations that block user interaction |
| Use `AnimatePresence` for exit animations | Ignore `prefers-reduced-motion` preference |
| Keep durations under 400ms for UI elements | Use spring animations for critical UI feedback |
| Test on low-end devices | Over-animate - less is more |

---

## Data Fetching Patterns

### Server Components (Preferred for Initial Data)

```tsx
// app/(dashboard)/[feature]/page.tsx
import { api } from "@/trpc/server";
import { FeatureList } from "@/components/features/[feature]/feature-list";

export default async function FeaturePage() {
  // Fetch initial data on server - no loading state needed
  const items = await api.feature.list();

  return (
    <div className="container py-4 md:py-6 lg:py-8 px-4 md:px-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Feature</h1>
      <FeatureList initialData={items} />
    </div>
  );
}
```

### Client Components (For Interactive Data)

```tsx
// components/features/[feature]/feature-list.tsx
"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";

interface FeatureListProps {
  initialData?: any[];
}

export function FeatureList({ initialData }: FeatureListProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Use initialData for instant display, then refetch
  const { data: items, isLoading } = api.feature.list.useQuery(
    { search: debouncedSearch },
    {
      initialData,
      refetchOnMount: false,
      staleTime: 30 * 1000, // 30 seconds
    }
  );

  return (
    <div className="space-y-4">
      <Input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="max-w-sm"
      />

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items?.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### When to Use Server vs Client Components

| Pattern | Use Case |
|---------|----------|
| **Server Component** | Initial page load, SEO-critical data, static content |
| **Client Component** | User interactions, real-time updates, form handling |
| **Server Actions** | Simple form submissions without complex client logic |
| **tRPC Mutations** | Complex operations, type-safe validation, error handling |

### Server Component with Dynamic Routes

```tsx
// app/(dashboard)/[feature]/[id]/page.tsx
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

interface DetailPageProps {
  params: { id: string };
}

export default async function DetailPage({ params }: DetailPageProps) {
  const item = await api.feature.getById({ id: params.id });

  if (!item) {
    notFound();
  }

  return (
    <div className="container py-4 md:py-8 px-4 md:px-6">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">{item.name}</h1>
      <p className="text-sm md:text-base text-muted-foreground mt-2">
        {item.description}
      </p>
    </div>
  );
}
```

---

## State Management

### React Query (TanStack Query) - Primary State Management

React Query handles:
- Server state caching
- Background refetching
- Optimistic updates
- Request deduplication
- Pagination and infinite scroll

#### Cursor-Based Pagination

```tsx
"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PaginatedList() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = api.feature.list.useQuery({
    page,
    limit: 10,
  });

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <h3 className="font-medium">{item.name}</h3>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isFetching}
          variant="outline"
        >
          Previous
        </Button>
        <span className="px-4 py-2">Page {page}</span>
        <Button
          onClick={() => setPage((p) => p + 1)}
          disabled={!data?.hasMore || isFetching}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

#### Infinite Scroll Pattern

```tsx
"use client";

import { api } from "@/trpc/react";
import { useEffect, useRef } from "react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export function InfiniteScrollList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = api.feature.listInfinite.useInfiniteQuery(
    {
      limit: 20,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allItems.map((item) => (
          <div key={item.id} className="border rounded-lg p-4">
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Intersection observer target */}
      <div ref={observerTarget} className="py-4">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        )}
      </div>

      {!hasNextPage && allItems.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          No more items to load
        </p>
      )}
    </div>
  );
}
```

### Optimistic Updates

```tsx
"use client";

import { api } from "@/trpc/react";
import { toast } from "sonner";

export function OptimisticToggle({ itemId, currentStatus }) {
  const utils = api.useUtils();

  const updateStatus = api.feature.updateStatus.useMutation({
    // Optimistic update
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await utils.feature.getById.cancel({ id: itemId });

      // Snapshot previous value
      const previous = utils.feature.getById.getData({ id: itemId });

      // Optimistically update
      utils.feature.getById.setData({ id: itemId }, (old) => ({
        ...old!,
        status: newData.status,
      }));

      return { previous };
    },
    // Rollback on error
    onError: (err, variables, context) => {
      utils.feature.getById.setData({ id: itemId }, context?.previous);
      toast.error("Failed to update status");
    },
    // Refetch on success
    onSuccess: () => {
      utils.feature.getById.invalidate({ id: itemId });
      toast.success("Status updated");
    },
  });

  return (
    <button
      onClick={() =>
        updateStatus.mutate({
          id: itemId,
          status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE",
        })
      }
      className="px-3 py-1 text-sm bg-secondary rounded"
    >
      Toggle Status
    </button>
  );
}
```

### Local State (useState/useReducer)

Use for UI-only state:

```tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function Accordion({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4"
      >
        <span className="font-medium">{title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isOpen && <div className="p-4 pt-0">{children}</div>}
    </div>
  );
}
```

## Error Handling & Loading States

### Error Boundaries

```tsx
// app/error.tsx (catches errors in app)
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-sm md:text-base text-muted-foreground mb-6">
          {error.message}
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
```

### Loading States

```tsx
// app/(dashboard)/[feature]/loading.tsx
export default function Loading() {
  return (
    <div className="container py-4 md:py-8 px-4 md:px-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 md:h-8 w-32 md:w-48 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 md:h-32 bg-muted rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Not Found Pages

```tsx
// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">404</h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-6">
          Page not found
        </p>
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
```

### tRPC Error Handling

```tsx
"use client";

import { api } from "@/trpc/react";
import { TRPCClientError } from "@trpc/client";

export function DataFetcher({ id }: { id: string }) {
  const { data, error, isLoading } = api.feature.getById.useQuery({ id });

  if (isLoading) {
    return <div className="animate-pulse h-20 bg-muted rounded" />;
  }

  if (error) {
    if (error.data?.code === "NOT_FOUND") {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Item not found</p>
        </div>
      );
    }
    if (error.data?.code === "UNAUTHORIZED") {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please sign in to view this item</p>
        </div>
      );
    }
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error: {error.message}</p>
      </div>
    );
  }

  return <div>{/* Render data */}</div>;
}
```

---

## Type Safety Patterns

### Sharing Types Between Frontend and Backend

Types are automatically inferred from tRPC routers:

```typescript
// Usage in components
import type { RouterInputs, RouterOutputs } from "@/trpc/shared";

// Input types
type CreateInput = RouterInputs["feature"]["create"];
type ListInput = RouterInputs["feature"]["list"];

// Output types
type Item = RouterOutputs["feature"]["getById"];
type ItemList = RouterOutputs["feature"]["list"];

// Use in component props
interface ItemCardProps {
  item: Item;
  onUpdate?: (data: CreateInput) => void;
}

export function ItemCard({ item, onUpdate }: ItemCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium">{item.name}</h3>
      <p className="text-sm text-muted-foreground">{item.description}</p>
    </div>
  );
}
```

### Zod Schema Sharing

Share validation schemas between client and server:

```typescript
// server/api/routers/[feature]/[feature].types.ts
import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
```

```typescript
// components/features/[feature]/[feature]-form.tsx
import { createItemSchema } from "@/server/api/routers/[feature]/[feature].types";

const form = useForm({
  resolver: zodResolver(createItemSchema),
});
```

### Type-Safe Enums

```typescript
// server/api/common/enums/status.enum.ts
export enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
}

// Use in frontend
import { Status } from "@/server/api/common/enums/status.enum";

const statuses = Object.values(Status);

// In form
<Select>
  {statuses.map((status) => (
    <option key={status} value={status}>
      {status}
    </option>
  ))}
</Select>
```

---

## Authentication with Clerk

### Protected Routes via Layout

```tsx
// app/(dashboard)/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

### Sign In/Up Pages

```tsx
// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SignIn />
    </div>
  );
}
```

```tsx
// app/(auth)/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SignUp />
    </div>
  );
}
```

### Middleware for Route Protection

```typescript
// middleware.ts (root directory)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/trpc(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Using Auth in Client Components

```tsx
"use client";

import { useUser } from "@clerk/nextjs";

export function UserProfile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="h-8 w-32 bg-muted animate-pulse rounded" />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden md:block text-right">
        <p className="text-sm font-medium">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-muted-foreground">
          {user.emailAddresses[0]?.emailAddress}
        </p>
      </div>
    </div>
  );
}
```

---

## Mobile-First Development

### Design Philosophy

Always start with mobile layout and progressively enhance:

1. **Default styles = mobile styles**
2. **Use Tailwind breakpoints for larger screens**:
   - `md:` for tablet (768px+)
   - `lg:` for desktop (1024px+)
   - `xl:` for large desktop (1280px+)

### Responsive Spacing Example

```tsx
export function Container({ children }) {
  return (
    <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
      {children}
    </div>
  );
}
```

### Responsive Typography

```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Heading
</h1>

<p className="text-sm md:text-base lg:text-lg text-muted-foreground">
  Body text
</p>
```

### Responsive Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>
```

### Responsive Navigation

```tsx
// Show different navigation on mobile vs desktop
export function Navigation() {
  const isAboveTablet = useIsAboveTablet();

  return isAboveTablet ? (
    <nav className="flex items-center gap-6">
      {/* Desktop horizontal nav */}
    </nav>
  ) : (
    <nav className="flex flex-col gap-4">
      {/* Mobile vertical nav */}
    </nav>
  );
}
```

### Touch-Friendly Interactions

```tsx
// Larger tap targets on mobile
<button className="h-11 px-4 md:h-10 md:px-3">
  Click me
</button>

// Hide hover effects on touch devices
<div className="hover:bg-secondary active:bg-secondary">
  Tappable area
</div>
```

### Responsive Images

```tsx
import Image from "next/image";

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  className="w-full h-auto"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

---

## Best Practices

### Component Organization

| Component Type | Location | Example |
|----------------|----------|---------|
| UI Primitives | `components/ui/` | button.tsx, input.tsx |
| Feature Components | `components/features/[feature]/` | feature-form.tsx |
| Layout Components | `components/layout/` | header.tsx, sidebar.tsx |
| Shared Utilities | `components/shared/` | loading-spinner.tsx |

### File Naming Conventions

```
kebab-case.tsx           → Components and files
PascalCase               → Component names
camelCase                → Functions and variables
SCREAMING_SNAKE_CASE     → Constants and enums
```

### No Index Files for Re-exports

**Do NOT create `index.ts` files for re-exporting modules.** Import directly from the source file.

```typescript
// ❌ AVOID - Don't create barrel exports
// hooks/index.ts
export { useDebounce } from "./use-debounce";
export { useDevice } from "./use-device";

// ✅ CORRECT - Import directly from source
import { useDebounce } from "@/hooks/use-debounce";
import { useDevice } from "@/hooks/use-device";
```

**Why:**
- Avoids circular dependency issues
- Better tree-shaking in production builds
- Faster TypeScript compilation
- Clearer import paths show exactly where code lives
- Prevents accidental bundling of unused modules

### Import Order

```typescript
// 1. React and Next.js
import { useState } from "react";
import Link from "next/link";

// 2. External libraries
import { z } from "zod";
import { useForm } from "react-hook-form";

// 3. Internal - tRPC and API
import { api } from "@/trpc/react";

// 4. Internal - Components
import { Button } from "@/components/ui/button";

// 5. Internal - Hooks
import { useDevice } from "@/hooks/use-device";

// 6. Internal - Utils and types
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/shared";
```

### Performance Optimization

1. **Use Server Components by default**
   - Only use "use client" when needed
   - Reduces JavaScript bundle size

2. **Implement proper caching**
   ```tsx
   const { data } = api.feature.list.useQuery(undefined, {
     staleTime: 5 * 60 * 1000, // 5 minutes
   });
   ```

3. **Use React.memo for expensive components**
   ```tsx
   export const ExpensiveComponent = React.memo(({ data }) => {
     // Expensive rendering logic
   });
   ```

4. **Optimize images**
   ```tsx
   <Image
     src="/image.jpg"
     alt="Description"
     width={500}
     height={300}
     priority // For above-fold images
   />
   ```

5. **Code splitting**
   ```tsx
   import dynamic from "next/dynamic";

   const HeavyComponent = dynamic(
     () => import("@/components/features/heavy-component"),
     { ssr: false, loading: () => <LoadingSpinner /> }
   );
   ```

6. **Debounce user inputs**
   ```tsx
   const [search, setSearch] = useState("");
   const debouncedSearch = useDebounce(search, 300);

   api.feature.search.useQuery({ query: debouncedSearch });
   ```

---

## Testing Strategy

### Unit Tests (Vitest)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

```typescript
// components/ui/button.test.tsx
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("handles click events", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button");
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests (Playwright)

```bash
npm install -D @playwright/test
```

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test("user can sign in", async ({ page }) => {
  await page.goto("/sign-in");

  // Fill in credentials
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "password123");

  // Submit form
  await page.click('button[type="submit"]');

  // Should redirect to dashboard
  await expect(page).toHaveURL("/dashboard");
});
```

---

## SEO and Metadata Patterns

### Page Metadata (Static)

```tsx
// app/(dashboard)/vehicles/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vehicles | Fleet Pulse",
  description: "Manage your fleet vehicles, track maintenance, and monitor performance.",
  openGraph: {
    title: "Vehicles | Fleet Pulse",
    description: "Manage your fleet vehicles, track maintenance, and monitor performance.",
    images: ["/og-vehicles.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vehicles | Fleet Pulse",
    description: "Manage your fleet vehicles, track maintenance, and monitor performance.",
  },
};

export default function VehiclesPage() {
  return <div>Vehicles page content</div>;
}
```

### Dynamic Metadata (from API data)

```tsx
// app/(dashboard)/vehicles/[id]/page.tsx
import type { Metadata } from "next";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { headers } from "next/headers";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const headersList = await headers();
  const ctx = await createTRPCContext({
    headers: headersList,
    req: null,
  });

  const caller = appRouter.createCaller(ctx);
  const vehicle = await caller.vehicles.getById({ id });

  if (!vehicle) {
    return {
      title: "Vehicle Not Found | Fleet Pulse",
    };
  }

  return {
    title: `${vehicle.make} ${vehicle.model} | Fleet Pulse`,
    description: `View details for ${vehicle.make} ${vehicle.model} - VIN: ${vehicle.vin}`,
    openGraph: {
      title: `${vehicle.make} ${vehicle.model}`,
      description: `Fleet vehicle details - ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      images: vehicle.imageUrl ? [vehicle.imageUrl] : [],
    },
  };
}

export default async function VehicleDetailPage({ params }: Props) {
  const { id } = await params;
  // Page implementation
}
```

### JSON-LD Structured Data

```tsx
// app/(dashboard)/vehicles/[id]/page.tsx
export default async function VehicleDetailPage({ params }: Props) {
  const { id } = await params;
  const vehicle = await getVehicle(id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${vehicle.make} ${vehicle.model}`,
    brand: {
      "@type": "Brand",
      name: vehicle.make,
    },
    model: vehicle.model,
    vehicleIdentificationNumber: vehicle.vin,
    productionDate: vehicle.year,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>{/* Page content */}</div>
    </>
  );
}
```

### Sitemap Generation

```typescript
// app/sitemap.ts
import { type MetadataRoute } from "next";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://fleetpulse.com";

  // Get all vehicles for sitemap
  const ctx = await createTRPCContext({
    headers: new Headers(),
    req: null,
  });
  const caller = appRouter.createCaller(ctx);
  const vehicles = await caller.vehicles.list({ limit: 1000 });

  const vehicleUrls = vehicles.items.map((vehicle) => ({
    url: `${baseUrl}/vehicles/${vehicle.id}`,
    lastModified: vehicle.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vehicles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...vehicleUrls,
  ];
}
```

### Robots.txt

```typescript
// app/robots.ts
import { type MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/sign-in", "/sign-up"],
    },
    sitemap: "https://fleetpulse.com/sitemap.xml",
  };
}
```

---

## Real-Time Updates (Optional)

### Server-Sent Events (SSE) Pattern

For real-time updates without WebSocket complexity:

```tsx
// hooks/use-sse.ts
"use client";

import { useEffect, useState } from "react";

interface UseSSEOptions<T> {
  url: string;
  onMessage?: (data: T) => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
}

export function useSSE<T = unknown>({
  url,
  onMessage,
  onError,
  enabled = true,
}: UseSSEOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Event | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data) as T;
        setData(parsedData);
        onMessage?.(parsedData);
      } catch (err) {
        console.error("Failed to parse SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      setIsConnected(false);
      setError(err);
      onError?.(err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [url, enabled, onMessage, onError]);

  return { data, error, isConnected };
}
```

### Polling Pattern (Simple Real-Time)

```tsx
"use client";

import { api } from "@/trpc/react";
import { useEffect } from "react";

export function VehicleStatusMonitor({ vehicleId }: { vehicleId: string }) {
  // Poll every 10 seconds
  const { data: vehicle } = api.vehicles.getById.useQuery(
    { id: vehicleId },
    {
      refetchInterval: 10000, // 10 seconds
      refetchIntervalInBackground: true,
    }
  );

  // Show notification on status change
  useEffect(() => {
    if (vehicle?.status === "MAINTENANCE_REQUIRED") {
      toast.warning(`Vehicle ${vehicle.name} requires maintenance`);
    }
  }, [vehicle?.status, vehicle?.name]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            vehicle?.status === "ACTIVE" && "bg-green-500",
            vehicle?.status === "INACTIVE" && "bg-gray-500",
            vehicle?.status === "MAINTENANCE" && "bg-yellow-500"
          )}
        />
        <span className="text-sm">{vehicle?.status}</span>
      </div>
    </div>
  );
}
```

### WebSocket Pattern (Advanced)

For true real-time bidirectional communication:

```tsx
// lib/websocket.ts
"use client";

import { useEffect, useRef, useState } from "react";

interface UseWebSocketOptions {
  url: string;
  onMessage?: (data: unknown) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnect?: boolean;
  reconnectDelay?: number;
}

export function useWebSocket({
  url,
  onMessage,
  onError,
  onOpen,
  onClose,
  reconnect = true,
  reconnectDelay = 3000,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      ws.onerror = (error) => {
        onError?.(error);
      };

      ws.onclose = () => {
        setIsConnected(false);
        onClose?.();

        if (reconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [url]);

  const send = (data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  return { isConnected, send };
}
```

---

## Deployment Checklist

### Environment Variables

```bash
# .env.example
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://host:6379
```

### Vercel Deployment

1. **Connect GitHub repository**
2. **Set environment variables** in Vercel dashboard
3. **Configure build settings**:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm install"
   }
   ```
4. **Enable automatic deployments** on push to main

### Pre-deployment Checklist

- [ ] Run `npm run build` locally to check for errors
- [ ] Run `npm run lint` to ensure code quality
- [ ] Test all critical user flows on mobile, tablet, and desktop
- [ ] Verify environment variables are set
- [ ] Check database migrations are applied
- [ ] Review Clerk authentication setup
- [ ] Test responsive design on various screen sizes
- [ ] Verify touch interactions work on mobile devices
- [ ] Enable error tracking (Sentry, LogRocket)
- [ ] Configure analytics (Vercel Analytics, PostHog)
- [ ] Test loading and error states
- [ ] Verify SEO metadata is configured

### Performance Monitoring

1. **Bundle Analysis**:
   ```bash
   # Add to package.json scripts
   "analyze": "ANALYZE=true next build"
   ```

   ```javascript
   // next.config.mjs
   import withBundleAnalyzer from "@next/bundle-analyzer";

   const bundleAnalyzer = withBundleAnalyzer({
     enabled: process.env.ANALYZE === "true",
   });

   export default bundleAnalyzer({
     // your next config
   });
   ```

2. **Vercel Analytics** (if deploying to Vercel):
   ```tsx
   // app/layout.tsx
   import { Analytics } from "@vercel/analytics/react";
   import { SpeedInsights } from "@vercel/speed-insights/next";

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
           <SpeedInsights />
         </body>
       </html>
     );
   }
   ```

3. **Performance Budget** - Add to `next.config.mjs`:
   ```javascript
   export default {
     experimental: {
       optimizePackageImports: ["lucide-react", "@radix-ui/react-*"],
     },
   };
   ```

---

## Quick Start Checklist

Use this checklist when setting up a new project:

### Initial Setup

- [ ] Install dependencies: `npm install`
- [ ] Set up environment variables in `.env.local`
- [ ] Run environment validation: `npm run dev` (will validate on startup)
- [ ] Initialize shadcn/ui: `npx shadcn@latest init`
- [ ] Install required UI components (button, form, input, etc.)

### Database & Backend

- [ ] Set up Prisma schema
- [ ] Run database migrations
- [ ] Create initial tRPC routers
- [ ] Test tRPC endpoints

### Authentication

- [ ] Create Clerk account and get API keys
- [ ] Configure Clerk environment variables
- [ ] Set up middleware for route protection
- [ ] Create sign-in/sign-up pages

### Frontend Components

- [ ] Create base UI components from shadcn
- [ ] Set up theme provider and dark mode toggle
- [ ] Create layout components (header, sidebar, footer)
- [ ] Build feature-specific components

### Testing & Quality

- [ ] Set up ESLint and run: `npm run lint`
- [ ] Write unit tests for critical components
- [ ] Test responsive design on mobile/tablet/desktop
- [ ] Test with React Query DevTools in development

### Deployment

- [ ] Build locally: `npm run build`
- [ ] Fix any build errors
- [ ] Deploy to Vercel/Railway
- [ ] Configure production environment variables
- [ ] Test production deployment

---

## Reference

This architecture follows patterns from:
- Next.js 15+ App Router documentation
- tRPC v11 best practices
- shadcn/ui component library
- Clerk authentication patterns
- T3 Stack conventions
- Mobile-first responsive design principles

For backend patterns, see: `documentation/server-architecture.md`
