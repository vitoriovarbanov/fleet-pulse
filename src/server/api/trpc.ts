import { initTRPC, TRPCError } from '@trpc/server';
import { NextRequest } from 'next/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

/**
 * Context creation
 * This is where you define what's available to all procedures
 */
export const createTRPCContext = async (opts: { headers: Headers; req: NextRequest }) => {
    return {
        ...opts,
        // TODO: Add Clerk auth session here
        // session: await getAuth(opts.headers),
    };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * tRPC initialization
 */
const t = initTRPC.context<TRPCContext>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
            },
        };
    },
});

/**
 * Router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/**
 * Public procedure
 * No authentication required
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure middleware
 * Validates that user is authenticated via Clerk
 */
const enforceUserIsAuthenticated = t.middleware(async ({ ctx, next }) => {
    // TODO: Implement Clerk auth check
    // if (!ctx.session?.userId) {
    //   throw new TRPCError({ code: "UNAUTHORIZED" });
    // }

    return next({
        ctx: {
            ...ctx,
            // TODO: Add validated user to context
            // user: ctx.session.user,
        },
    });
});

/**
 * Protected procedure
 * Requires authenticated user
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthenticated);
