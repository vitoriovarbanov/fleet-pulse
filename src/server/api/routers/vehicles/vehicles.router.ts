import { createTRPCRouter, adminProcedure, adminRateLimitedProcedure } from '@/server/api/trpc';
import { RateLimits } from '@/server/api/common/middlewares/rate-limit.middleware';
import * as service from './service/vehicles.service';
import {
    listVehiclesInputSchema,
    getVehicleInputSchema,
    createVehicleInputSchema,
    updateVehicleInputSchema,
    deleteVehicleInputSchema,
    changeStatusInputSchema,
    assignDriverInputSchema,
    saleVehicleInputSchema,
} from './vehicles.types';

/**
 * Vehicles Router
 * All procedures require ADMIN or FLEET_MANAGER role
 */
export const vehiclesRouter = createTRPCRouter({
    /**
     * List vehicles with filtering and pagination
     * - ADMIN: Can query any organization or all
     * - FLEET_MANAGER: Only their organization
     */

    list: adminProcedure.input(listVehiclesInputSchema).query(({ ctx, input }) => {
        const isAdmin = ctx.user.role === 'ADMIN';
        return service.listVehicles(input, ctx.organizationId, isAdmin, ctx.logger);
    }),

    /**
     * Get a single vehicle by ID with full details
     */
    getById: adminProcedure.input(getVehicleInputSchema).query(async ({ ctx, input }) => {
        const isAdmin = ctx.user.role === 'ADMIN';
        return service.getVehicle(input.vehicleId, ctx.organizationId, isAdmin, ctx.logger);
    }),

    /**
     * List available vehicles (no driver assigned, ACTIVE status)
     */
    listAvailable: adminProcedure.query(async ({ ctx }) => {
        const isAdmin = ctx.user.role === 'ADMIN';
        return service.listAvailableVehicles(ctx.organizationId, isAdmin, ctx.logger);
    }),

    /**
     * Get vehicle statistics
     */
    getStatistics: adminProcedure.query(async ({ ctx }) => {
        const isAdmin = ctx.user.role === 'ADMIN';
        return service.getStatistics(ctx.organizationId, isAdmin, ctx.logger);
    }),

    /**
     * Create a new vehicle
     * Rate limited: 10 per hour
     */
    create: adminRateLimitedProcedure(RateLimits.VEHICLE_CREATE)
        .input(createVehicleInputSchema)
        .mutation(async ({ ctx, input }) => {
            return service.createVehicle(input, ctx.organizationId, ctx.logger);
        }),

    /**
     * Update an existing vehicle
     */
    update: adminProcedure.input(updateVehicleInputSchema).mutation(async ({ ctx, input }) => {
        const { vehicleId, ...updateData } = input;
        const isAdmin = ctx.user.role === 'ADMIN';
        return service.updateVehicle(vehicleId, updateData, ctx.organizationId, isAdmin, ctx.logger);
    }),

    /**
     * Soft delete a vehicle (set status to OUT_OF_SERVICE)
     */
    delete: adminProcedure.input(deleteVehicleInputSchema).mutation(async ({ ctx, input }) => {
        const isAdmin = ctx.user.role === 'ADMIN';
        return service.deleteVehicle(input.vehicleId, ctx.organizationId, isAdmin, ctx.logger);
    }),

    /**
     * Change vehicle status
     */
    changeStatus: adminProcedure.input(changeStatusInputSchema).mutation(async ({ ctx, input }) => {
        const isAdmin = ctx.user.role === 'ADMIN';
        return service.changeStatus(input.vehicleId, input.status, ctx.organizationId, isAdmin, ctx.logger);
    }),

    /**
     * Assign or unassign a driver to a vehicle
     */
    assignDriver: adminProcedure.input(assignDriverInputSchema).mutation(async ({ ctx, input }) => {
        const isAdmin = ctx.user.role === 'ADMIN';
        return service.assignDriver(input.vehicleId, input.driverId, ctx.organizationId, isAdmin, ctx.logger);
    }),

    /**
     * Unassign driver from vehicle (convenience method)
     */
    unassignDriver: adminProcedure.input(getVehicleInputSchema).mutation(async ({ ctx, input }) => {
        const isAdmin = ctx.user.role === 'ADMIN';
        return service.assignDriver(input.vehicleId, null, ctx.organizationId, isAdmin, ctx.logger);
    }),

    saleVehicle: adminProcedure.input(saleVehicleInputSchema).mutation(async ({ ctx, input }) => {
        const isAdmin = ctx.user.role === 'ADMIN';
        return service.saleToNewOrganization(input.vehicleId, ctx.organizationId, input.newOrganizationId, isAdmin, ctx.logger)
    }),
});
