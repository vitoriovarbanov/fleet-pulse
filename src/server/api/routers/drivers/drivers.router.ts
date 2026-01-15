import { createTRPCRouter, adminProcedure, adminRateLimitedProcedure } from '@/server/api/trpc';
import { RateLimits } from '@/server/api/common/middlewares/rate-limit.middleware';
import * as service from './service/drivers.service';
import {
    listDriversInputSchema,
    getDriverInputSchema,
    createDriverInputSchema,
    updateDriverInputSchema,
    deleteDriverInputSchema,
    assignVehicleInputSchema,
    listDriversOutputSchema,
    driverDetailOutputSchema,
    createDriverOutputSchema,
    updateDriverOutputSchema,
    deleteDriverOutputSchema,
    assignVehicleOutputSchema,
} from './drivers.types';

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
        .meta({
            openapi: {
                method: "GET",
                path: "/drivers",
                tags: ["Drivers"],
                summary: "List drivers",
                description: "Returns a paginated list of drivers with optional filtering. ADMIN can query any organization.",
                protect: true,
            },
        })
        .input(listDriversInputSchema)
        .output(listDriversOutputSchema)
        .query(async ({ ctx, input }) => {
            const isAdmin = ctx.user.role === 'ADMIN';
            return service.listDrivers(input, ctx.organizationId, isAdmin, ctx.logger);
        }),

    /**
     * Get a single driver by ID with full details
     */
    getById: adminProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/drivers/{driverId}",
                tags: ["Drivers"],
                summary: "Get driver by ID",
                description: "Returns a single driver with full details including profile and assigned vehicle",
                protect: true,
            },
        })
        .input(getDriverInputSchema)
        .output(driverDetailOutputSchema)
        .query(async ({ ctx, input }) => {
            const isAdmin = ctx.user.role === 'ADMIN';
            return service.getDriver(input.driverId, ctx.organizationId, isAdmin, ctx.logger);
        }),

    /**
     * Create a new driver (User + DriverProfile)
     * Rate limited: 10 per hour
     */
    create: adminRateLimitedProcedure(RateLimits.DRIVER_CREATE)
        .meta({
            openapi: {
                method: "POST",
                path: "/drivers",
                tags: ["Drivers"],
                summary: "Create driver",
                description: "Creates a new driver with user account and driver profile. Rate limited to 10 per hour.",
                protect: true,
            },
        })
        .input(createDriverInputSchema)
        .output(createDriverOutputSchema)
        .mutation(async ({ ctx, input }) => {
            return service.createDriver(input, ctx.organizationId, ctx.logger);
        }),

    /**
     * Update an existing driver
     */
    update: adminProcedure
        .meta({
            openapi: {
                method: "PATCH",
                path: "/drivers/{driverId}",
                tags: ["Drivers"],
                summary: "Update driver",
                description: "Updates an existing driver's information. Supports partial updates.",
                protect: true,
            },
        })
        .input(updateDriverInputSchema)
        .output(updateDriverOutputSchema)
        .mutation(async ({ ctx, input }) => {
            const { driverId, ...updateData } = input;
            const isAdmin = ctx.user.role === 'ADMIN';
            return service.updateDriver(driverId, updateData, ctx.organizationId, isAdmin, ctx.logger);
        }),

    /**
     * Soft delete a driver (set status to INACTIVE)
     */
    delete: adminProcedure
        .meta({
            openapi: {
                method: "DELETE",
                path: "/drivers/{driverId}",
                tags: ["Drivers"],
                summary: "Delete driver",
                description: "Soft deletes a driver by setting their status to INACTIVE",
                protect: true,
            },
        })
        .input(deleteDriverInputSchema)
        .output(deleteDriverOutputSchema)
        .mutation(async ({ ctx, input }) => {
            const isAdmin = ctx.user.role === 'ADMIN';
            return service.deleteDriver(input.driverId, ctx.organizationId, isAdmin, ctx.logger);
        }),

    /**
     * Assign or unassign a vehicle to a driver
     */
    assignVehicle: adminProcedure
        .meta({
            openapi: {
                method: "POST",
                path: "/drivers/{driverId}/assign-vehicle",
                tags: ["Drivers"],
                summary: "Assign vehicle to driver",
                description: "Assigns or unassigns a vehicle to/from a driver. Pass null vehicleId to unassign.",
                protect: true,
            },
        })
        .input(assignVehicleInputSchema)
        .output(assignVehicleOutputSchema)
        .mutation(async ({ ctx, input }) => {
            const isAdmin = ctx.user.role === 'ADMIN';
            return service.assignVehicle(input.driverId, input.vehicleId, ctx.organizationId, isAdmin, ctx.logger);
        }),
});
