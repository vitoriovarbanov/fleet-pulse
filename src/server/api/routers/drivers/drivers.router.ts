import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import * as service from "./service/drivers.service";
import {
  listDriversInputSchema,
  getDriverInputSchema,
  createDriverInputSchema,
  updateDriverInputSchema,
  deleteDriverInputSchema,
  assignVehicleInputSchema,
} from "./drivers.types";

/**
 * Drivers Router
 * All procedures require ADMIN or FLEET_MANAGER role
 */
export const driversRouter = createTRPCRouter({
  /**
   * List drivers with filtering and pagination
   * - ADMIN: Can query any organization or all
   * - FLEET_MANAGER: Only their organization
   */
  list: adminProcedure
    .input(listDriversInputSchema)
    .query(async ({ ctx, input }) => {
      const isAdmin = ctx.user.role === "ADMIN";
      return service.listDrivers(input, ctx.organizationId, isAdmin);
    }),

  /**
   * Get a single driver by ID with full details
   */
  getById: adminProcedure
    .input(getDriverInputSchema)
    .query(async ({ ctx, input }) => {
      const isAdmin = ctx.user.role === "ADMIN";
      return service.getDriver(input.driverId, ctx.organizationId, isAdmin);
    }),

  /**
   * Create a new driver (User + DriverProfile)
   */
  create: adminProcedure
    .input(createDriverInputSchema)
    .mutation(async ({ ctx, input }) => {
      return service.createDriver(input, ctx.organizationId);
    }),

  /**
   * Update an existing driver
   */
  update: adminProcedure
    .input(updateDriverInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { driverId, ...updateData } = input;
      const isAdmin = ctx.user.role === "ADMIN";
      return service.updateDriver(
        driverId,
        updateData,
        ctx.organizationId,
        isAdmin
      );
    }),

  /**
   * Soft delete a driver (set status to INACTIVE)
   */
  delete: adminProcedure
    .input(deleteDriverInputSchema)
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.user.role === "ADMIN";
      return service.deleteDriver(
        input.driverId,
        ctx.organizationId,
        isAdmin
      );
    }),

  /**
   * Assign or unassign a vehicle to a driver
   */
  assignVehicle: adminProcedure
    .input(assignVehicleInputSchema)
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.user.role === "ADMIN";
      return service.assignVehicle(
        input.driverId,
        input.vehicleId,
        ctx.organizationId,
        isAdmin
      );
    }),
});
