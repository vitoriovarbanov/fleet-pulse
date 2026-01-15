import { createTRPCRouter, publicProcedure } from "../../trpc";
import { db } from "@/server/database";
import { redis } from "@/server/redis";
import { z } from "zod";

const healthStatusSchema = z.enum(["healthy", "unhealthy", "degraded"]);

const serviceHealthSchema = z.object({
  status: healthStatusSchema,
  latency: z.number().optional(),
  error: z.string().optional(),
});

const healthCheckOutputSchema = z.object({
  status: healthStatusSchema,
  timestamp: z.string(),
  services: z.record(z.string(), serviceHealthSchema),
});

type HealthStatus = z.infer<typeof healthStatusSchema>;

type ServiceHealth = z.infer<typeof serviceHealthSchema>;

export const healthRouter = createTRPCRouter({
  /**
   * Full health check - verifies all dependencies
   * Test: /api/trpc/health.check
   */
  check: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/health/check",
        tags: ["Health"],
        summary: "Full health check",
        description: "Verifies all dependencies (database, Redis) and returns overall system health status",
      },
    })
    .input(z.void())
    .output(healthCheckOutputSchema)
    .query(async () => {
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
  ping: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/health/ping",
        tags: ["Health"],
        summary: "Ping",
        description: "Simple liveness check that returns 'pong' - no dependencies required",
      },
    })
    .input(z.void())
    .output(z.literal("pong"))
    .query(() => {
      return "pong" as const;
    }),
});
