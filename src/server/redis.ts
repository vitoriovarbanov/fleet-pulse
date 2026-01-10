import { Redis } from "ioredis";

/**
 * Redis client singleton (lazy initialization)
 * Used for rate limiting, caching, and session storage
 *
 * Lazy init prevents connection attempts during Next.js build
 */
let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error("REDIS_URL environment variable is required");
    }
    redisClient = new Redis(redisUrl);
  }
  return redisClient;
}

// For backwards compatibility - lazy getter
export const redis = new Proxy({} as Redis, {
  get(_, prop) {
    return Reflect.get(getRedis(), prop);
  },
});
