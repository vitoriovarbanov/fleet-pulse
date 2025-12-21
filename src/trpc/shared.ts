import type { AppRouter } from "@/server/api/root";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

/**
 * Transformer for serializing complex types (Date, Map, Set, etc.)
 */
export const transformer = superjson;

/**
 * Inference helpers for input types
 * @example
 * type CreateVehicleInput = RouterInputs['vehicles']['create'];
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type Vehicle = RouterOutputs['vehicles']['getById'];
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
