import { Redis } from "ioredis";
import { env } from "@/env";

/**
 * Redis client singleton
 * Used for rate limiting, caching, and session storage
 */
export const redis = new Redis(env.REDIS_URL);
