import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

/**
 * Allowed origins for CORS
 * Only these origins can make cross-origin requests to the tRPC API
 */
const ALLOWED_ORIGINS = [
    env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3005',
    'http://localhost:3000',
].filter(Boolean);

/**
 * Get CORS headers based on the request origin
 * Only returns Access-Control-Allow-Origin for whitelisted origins
 */
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

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS(req: NextRequest) {
    const origin = req.headers.get('origin');
    return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(origin),
    });
}

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
 * Handles all /api/trpc/* requests with CORS support
 */
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
