import { TRPCError } from "@trpc/server";
import { redis } from "@/server/redis";
import type { Logger } from "../logger";

/**
 * Time window units for rate limiting
 */
export type WindowType = "seconds" | "minutes" | "hours" | "days" | "weeks";

/**
 * Rate limit configuration
 */
export type RateLimitConfig = {
    /** Maximum number of requests allowed in the time window */
    max: number;
    /** Time window duration */
    window: number;
    /** Time window unit */
    windowType: WindowType;
    /** Unique identifier for this rate limit (e.g., "auth:login", "files:upload") */
    identifier: string;
    /** Whether rate limiting is enabled (defaults to true) */
    enabled?: boolean;
};

/**
 * Context required for rate limiting
 */
export type RateLimitContext = {
    /** User ID for user-based rate limiting */
    userId?: string;
    /** Clerk user ID as fallback */
    clerkUserId?: string | null;
    /** Logger instance */
    logger: Logger;
};

/**
 * Convert window type to seconds
 */
function windowToSeconds(window: number, windowType: WindowType): number {
    switch (windowType) {
        case "seconds":
            return window;
        case "minutes":
            return window * 60;
        case "hours":
            return window * 60 * 60;
        case "days":
            return window * 60 * 60 * 24;
        case "weeks":
            return window * 60 * 60 * 24 * 7;
    }
}

/**
 * Check rate limit and throw if exceeded
 *
 * @param config - Rate limit configuration
 * @param ctx - Context with user info and logger
 * @throws TRPCError with code TOO_MANY_REQUESTS if limit exceeded
 */
export async function checkRateLimit(
    config: RateLimitConfig,
    ctx: RateLimitContext
): Promise<void> {
    // Skip if disabled
    if (config.enabled === false) {
        return;
    }

    const log = ctx.logger.child("RateLimit");

    // Get user identifier (prefer database user ID, fall back to Clerk ID)
    const userId = ctx.userId ?? ctx.clerkUserId;

    if (!userId) {
        // Can't rate limit without a user identifier
        log.warn("No user ID for rate limiting", { identifier: config.identifier });
        return;
    }

    const windowSeconds = windowToSeconds(config.window, config.windowType);
    const key = `rate_limit:${config.identifier}:${userId}`;

    try {
        // Get current count
        const currentCount = await redis.get(key);
        const count = currentCount ? parseInt(currentCount, 10) : 0;

        if (count >= config.max) {
            log.warn("Rate limit exceeded", {
                identifier: config.identifier,
                count,
                max: config.max,
            });

            // Get TTL for retry-after header info
            const ttl = await redis.ttl(key);

            throw new TRPCError({
                code: "TOO_MANY_REQUESTS",
                message: `Rate limit exceeded. Please try again in ${ttl > 0 ? ttl : windowSeconds} seconds.`,
            });
        }

        // Increment counter atomically with expiration
        const pipeline = redis.pipeline();
        pipeline.incr(key);

        // Only set expiration if this is the first request in the window
        if (count === 0) {
            pipeline.expire(key, windowSeconds);
        }

        await pipeline.exec();

        log.debug("Rate limit check passed", {
            identifier: config.identifier,
            count: count + 1,
            max: config.max,
        });
    } catch (error) {
        // Re-throw rate limit errors
        if (error instanceof TRPCError && error.code === "TOO_MANY_REQUESTS") {
            throw error;
        }

        // Log Redis errors but don't block the request
        log.error("Rate limit check failed", {
            identifier: config.identifier,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

/**
 * Pre-configured rate limit configs for common use cases
 */
export const RateLimits = {
    /** Strict limit for authentication attempts: 5 per minute */
    AUTH: {
        max: 5,
        window: 1,
        windowType: "minutes" as const,
        identifier: "auth",
    },

    /** Driver creation: 10 per hour */
    DRIVER_CREATE: {
        max: 10,
        window: 1,
        windowType: "hours" as const,
        identifier: "drivers:create",
    },

    /** Vehicle creation: 10 per hour */
    VEHICLE_CREATE: {
        max: 10,
        window: 1,
        windowType: "hours" as const,
        identifier: "vehicles:create",
    },

    /** File uploads: 20 per hour */
    FILE_UPLOAD: {
        max: 20,
        window: 1,
        windowType: "hours" as const,
        identifier: "files:upload",
    },

    /** Invitation sending: 10 per hour */
    INVITATION: {
        max: 10,
        window: 1,
        windowType: "hours" as const,
        identifier: "invitations",
    },

    /** General mutations: 100 per minute (prevents abuse) */
    MUTATION: {
        max: 100,
        window: 1,
        windowType: "minutes" as const,
        identifier: "mutations",
    },

    /** Bulk operations: 5 per hour */
    BULK: {
        max: 5,
        window: 1,
        windowType: "hours" as const,
        identifier: "bulk",
    },
} satisfies Record<string, Omit<RateLimitConfig, "enabled">>;
