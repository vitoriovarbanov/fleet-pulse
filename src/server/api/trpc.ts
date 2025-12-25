import { initTRPC, TRPCError } from "@trpc/server";
import { NextRequest } from "next/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/database";
import type { User, Organization, DriverProfile, DispatcherProfile } from "@/generated/prisma/client";
import { syncUserToDatabase } from "./routers/auth/service/auth.service";
import { Logger, generateRequestId } from "./common/logger";
import { checkRateLimit, type RateLimitConfig } from "./common/middlewares/rate-limit.middleware";

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

    // Generate a unique request ID for tracing
    const requestId = generateRequestId();
    const logger = new Logger("tRPC", requestId);

    return {
        ...opts,
        db,
        clerkUserId,
        requestId,
        logger,
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
 * Logging middleware
 * Logs all procedure calls with timing information
 */
const loggingMiddleware = t.middleware(async ({ ctx, path, type, next }) => {
    const startTime = Date.now();
    const { logger } = ctx;

    logger.info(`${type} ${path} started`);

    try {
        const result = await next();

        if (result.ok) {
            logger.timed("info", `${type} ${path} completed`, startTime);
        } else {
            logger.timed("error", `${type} ${path} failed`, startTime);
        }

        return result;
    } catch (error) {
        const durationMs = Date.now() - startTime;

        if (error instanceof TRPCError) {
            logger.error(`${type} ${path} failed`, {
                durationMs,
                code: error.code,
                message: error.message,
            });
        } else if (error instanceof Error) {
            logger.error(`${type} ${path} failed`, {
                durationMs,
                error: error.message,
            });
        }

        throw error;
    }
});

/**
 * Public procedure
 * No authentication required
 */
export const publicProcedure = t.procedure.use(loggingMiddleware);

/**
 * Protected procedure middleware
 * Validates that user is authenticated via Clerk and fetches/creates DB user (lazy sync)
 */
const enforceUserIsAuthenticated = t.middleware(async ({ ctx, next }) => {
    if (!ctx.clerkUserId) {
        ctx.logger.warn("Unauthenticated request rejected");
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
    }

    // Lazy sync: fetch existing user or create from Clerk data
    const dbUser = await syncUserToDatabase(ctx.clerkUserId, ctx.logger);

    if (dbUser.status === "INACTIVE") {
        ctx.logger.warn("Inactive user access attempt", { userId: dbUser.id });
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Your account has been deactivated",
        });
    }

    ctx.logger.debug("User authenticated", {
        userId: dbUser.id,
        role: dbUser.role,
    });

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
export const protectedProcedure = t.procedure.use(loggingMiddleware).use(enforceUserIsAuthenticated);

/**
 * Admin procedure middleware
 * Requires user to have ADMIN or FLEET_MANAGER role
 */
const enforceUserIsAdmin = t.middleware(async ({ ctx, next }) => {
    if (!ctx.clerkUserId) {
        ctx.logger.warn("Unauthenticated admin request rejected");
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
    }

    // Lazy sync: fetch existing user or create from Clerk data
    const dbUser = await syncUserToDatabase(ctx.clerkUserId, ctx.logger);

    if (dbUser.role !== "ADMIN" && dbUser.role !== "FLEET_MANAGER") {
        ctx.logger.warn("Insufficient permissions for admin route", {
            userId: dbUser.id,
            role: dbUser.role,
        });
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient permissions",
        });
    }

    ctx.logger.debug("Admin user authenticated", {
        userId: dbUser.id,
        role: dbUser.role,
    });

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
export const adminProcedure = t.procedure.use(loggingMiddleware).use(enforceUserIsAdmin);

/**
 * Rate limit middleware factory
 * Creates a middleware that checks rate limits before proceeding
 */
const createRateLimitMiddleware = (config: RateLimitConfig) =>
    t.middleware(async ({ ctx, next }) => {
        // Get user ID from context (may be set by auth middleware)
        const userId = "user" in ctx ? (ctx.user as DbUser).id : undefined;

        await checkRateLimit(config, {
            userId,
            clerkUserId: ctx.clerkUserId,
            logger: ctx.logger,
        });

        return next();
    });

/**
 * Protected procedure with rate limiting
 * Requires authenticated user and enforces rate limits
 *
 * @param config - Rate limit configuration
 * @returns A procedure builder with rate limiting applied
 *
 * @example
 * ```ts
 * import { RateLimits } from "@/server/api/common/middlewares/rate-limit.middleware";
 *
 * myProcedure: protectedRateLimitedProcedure(RateLimits.FILE_UPLOAD)
 *     .input(z.object({ ... }))
 *     .mutation(async ({ ctx, input }) => { ... })
 * ```
 */
export const protectedRateLimitedProcedure = (config: RateLimitConfig) =>
    t.procedure
        .use(loggingMiddleware)
        .use(enforceUserIsAuthenticated)
        .use(createRateLimitMiddleware(config));

/**
 * Admin procedure with rate limiting
 * Requires ADMIN or FLEET_MANAGER role and enforces rate limits
 *
 * @param config - Rate limit configuration
 * @returns A procedure builder with rate limiting applied
 *
 * @example
 * ```ts
 * import { RateLimits } from "@/server/api/common/middlewares/rate-limit.middleware";
 *
 * create: adminRateLimitedProcedure(RateLimits.DRIVER_CREATE)
 *     .input(createDriverInputSchema)
 *     .mutation(async ({ ctx, input }) => { ... })
 * ```
 */
export const adminRateLimitedProcedure = (config: RateLimitConfig) =>
    t.procedure
        .use(loggingMiddleware)
        .use(enforceUserIsAdmin)
        .use(createRateLimitMiddleware(config));
