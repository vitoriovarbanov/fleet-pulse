import { createTRPCRouter, publicProcedure } from "../../trpc";
import { db } from "@/server/database";
import { redis } from "@/server/redis";

type HealthStatus = "healthy" | "unhealthy" | "degraded";

type ServiceHealth = {
  status: HealthStatus;
  latency?: number;
  error?: string;
};

export const healthRouter = createTRPCRouter({
  /**
   * Full health check - verifies all dependencies
   * Test: /api/trpc/health.check
   */
  check: publicProcedure.query(async () => {
    const services: Record<string, ServiceHealth> = {};

    // Check Database
    const dbStart = Date.now();
    try {
      await db.$queryRaw`SELECT 1`;
      services.database = {
        status: "healthy",
        latency: Date.now() - dbStart,
      };
    } catch (error) {
      services.database = {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // Check Redis
    const redisStart = Date.now();
    try {
      await redis.ping();
      services.redis = {
        status: "healthy",
        latency: Date.now() - redisStart,
      };
    } catch (error) {
      services.redis = {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // Determine overall status
    const allHealthy = Object.values(services).every(
      (s) => s.status === "healthy"
    );
    const allUnhealthy = Object.values(services).every(
      (s) => s.status === "unhealthy"
    );

    let overallStatus: HealthStatus;
    if (allHealthy) {
      overallStatus = "healthy";
    } else if (allUnhealthy) {
      overallStatus = "unhealthy";
    } else {
      overallStatus = "degraded";
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
    };
  }),

  /**
   * Ping endpoint - simple liveness check (no dependencies)
   * Test: /api/trpc/health.ping
   */
  ping: publicProcedure.query(() => {
    return "pong";
  }),
});
