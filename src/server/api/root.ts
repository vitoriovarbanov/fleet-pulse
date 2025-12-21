import { createTRPCRouter } from "./trpc";
import { healthRouter } from "./routers/health/health.router";

/**
 * Primary router for the server
 * All feature routers are merged here
 */
export const appRouter = createTRPCRouter({
  health: healthRouter,
  // Add feature routers here:
  // auth: authRouter,
  // vehicles: vehiclesRouter,
});

/**
 * Type definition of the API
 * Used for client-side type inference
 */
export type AppRouter = typeof appRouter;
