import { createTRPCRouter } from "./trpc";
import { healthRouter } from "./routers/health/health.router";
import { authRouter } from "./routers/auth/auth.router";
import { driversRouter } from "./routers/drivers/drivers.router";
import { filesRouter } from "./routers/files/files.router";
import { vehiclesRouter } from "./routers/vehicles/vehicles.router";

/**
 * Primary router for the server
 * All feature routers are merged here
 */
export const appRouter = createTRPCRouter({
  health: healthRouter,
  auth: authRouter,
  drivers: driversRouter,
  files: filesRouter,
  vehicles: vehiclesRouter,
});

/**
 * Type definition of the API
 * Used for client-side type inference
 */
export type AppRouter = typeof appRouter;
