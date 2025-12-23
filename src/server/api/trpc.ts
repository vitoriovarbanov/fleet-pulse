import { initTRPC, TRPCError } from '@trpc/server';
import { NextRequest } from 'next/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/server/database';
import type { User, Organization, DriverProfile, DispatcherProfile } from '@/generated/prisma/client';
import { syncUserToDatabase } from './routers/auth/service/auth.service';

/**
 * User with related data from database
 */
export type DbUser = User & {
    organization: Organization;
    driverProfile: DriverProfile | null;
    dispatcherProfile: DispatcherProfile | null;
};

/**
 * Context creation
 * This is where you define what's available to all procedures
 */
export const createTRPCContext = async (opts: { headers: Headers; req: NextRequest }) => {
    const { userId: clerkUserId } = await auth();

    return {
        ...opts,
        db,
        clerkUserId,
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
 * Validates that user is authenticated via Clerk and fetches/creates DB user (lazy sync)
 */
const enforceUserIsAuthenticated = t.middleware(async ({ ctx, next }) => {
    if (!ctx.clerkUserId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
    }

    // Lazy sync: fetch existing user or create from Clerk data
    const dbUser = await syncUserToDatabase(ctx.clerkUserId);

    if (dbUser.status === "INACTIVE") {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Your account has been deactivated",
        });
    }

    return next({
        ctx: {
            ...ctx,
            user: dbUser,
            organizationId: dbUser.organizationId,
        },
    });
});

/**
 * Protected procedure
 * Requires authenticated user
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthenticated);

/**
 * Admin procedure middleware
 * Requires user to have ADMIN or FLEET_MANAGER role
 */
const enforceUserIsAdmin = t.middleware(async ({ ctx, next }) => {
    if (!ctx.clerkUserId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
    }

    // Lazy sync: fetch existing user or create from Clerk data
    const dbUser = await syncUserToDatabase(ctx.clerkUserId);

    if (dbUser.role !== "ADMIN" && dbUser.role !== "FLEET_MANAGER") {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient permissions",
        });
    }

    return next({
        ctx: {
            ...ctx,
            user: dbUser,
            organizationId: dbUser.organizationId,
        },
    });
});

/**
 * Admin procedure
 * Requires ADMIN or FLEET_MANAGER role
 */
export const adminProcedure = t.procedure.use(enforceUserIsAdmin);
