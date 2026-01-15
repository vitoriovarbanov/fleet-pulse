import { createTRPCRouter, adminProcedure, adminRateLimitedProcedure } from '@/server/api/trpc';
import { z } from 'zod';
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
    listVehiclesOutputSchema,
    vehicleDetailOutputSchema,
    createVehicleOutputSchema,
    updateVehicleOutputSchema,
    deleteVehicleOutputSchema,
    changeStatusOutputSchema,
    assignDriverOutputSchema,
    listAvailableOutputSchema,
    statisticsOutputSchema,
    listWithLocationOutputSchema,
    saleVehicleOutputSchema,
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
    list: adminProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/vehicles",
                tags: ["Vehicles"],
                summary: "List vehicles",
                description: "Returns a paginated list of vehicles with optional filtering. ADMIN can query any organization.",
                protect: true,
            },
        })
        .input(listVehiclesInputSchema)
        .output(listVehiclesOutputSchema)
        .query(({ ctx, input }) => {
            const isAdmin = ctx.user.role === 'ADMIN';
            return service.listVehicles(input, ctx.organizationId, isAdmin, ctx.logger);
        }),

    /**
     * Get a single vehicle by ID with full details
     */
    getById: adminProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/vehicles/{vehicleId}",
                tags: ["Vehicles"],
                summary: "Get vehicle by ID",
                description: "Returns a single vehicle with full details including assigned driver",
                protect: true,
            },
        })
        .input(getVehicleInputSchema)
        .output(vehicleDetailOutputSchema)
        .query(async ({ ctx, input }) => {
            const isAdmin = ctx.user.role === 'ADMIN';
            return service.getVehicle(input.vehicleId, ctx.organizationId, isAdmin, ctx.logger);
        }),

    /**
     * List available vehicles (no driver assigned, ACTIVE status)
     */
    listAvailable: adminProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/vehicles/available",
                tags: ["Vehicles"],
                summary: "List available vehicles",
                description: "Returns vehicles with no driver assigned and ACTIVE status",
                protect: true,
            },
        })
        .input(z.void())
        .output(listAvailableOutputSchema)
        .query(async ({ ctx }) => {
            const isAdmin = ctx.user.role === 'ADMIN';
            return service.listAvailableVehicles(ctx.organizationId, isAdmin, ctx.logger);
        }),

    /**
     * Get vehicle statistics
     */
    getStatistics: adminProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/vehicles/statistics",
                tags: ["Vehicles"],
                summary: "Get vehicle statistics",
                description: "Returns aggregated statistics about the vehicle fleet",
                protect: true,
            },
        })
        .input(z.void())
        .output(statisticsOutputSchema)
        .query(async ({ ctx }) => {
            const isAdmin = ctx.user.role === 'ADMIN';
            return service.getStatistics(ctx.organizationId, isAdmin, ctx.logger);
        }),

    /**
     * List vehicles with location data for map display
     * Used by the live fleet map dashboard
     */
    listWithLocation: adminProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/vehicles/with-location",
                tags: ["Vehicles"],
                summary: "List vehicles with location",
                description: "Returns vehicles with location data for map display on the live fleet dashboard",
                protect: true,
            },
        })
        .input(z.void())
        .output(listWithLocationOutputSchema)
        .query(async ({ ctx }) => {
            const isAdmin = ctx.user.role === 'ADMIN';
            return service.listVehiclesWithLocation(ctx.organizationId, isAdmin, ctx.logger);
        }),

    /**
     * Create a new vehicle
     * Rate limited: 10 per hour
     */
    create: adminRateLimitedProcedure(RateLimits.VEHICLE_CREATE)
        .meta({
            openapi: {
                method: "POST",
                path: "/vehicles",
                tags: ["Vehicles"],
                summary: "Create vehicle",
                description: "Creates a new vehicle. Rate limited to 10 per hour.",
                protect: true,
            },
        })
        .input(createVehicleInputSchema)
        .output(createVehicleOutputSchema)
        .mutation(async ({ ctx, input }) => {
            return service.createVehicle(input, ctx.organizationId, ctx.logger);
        }),

    /**
     * Update an existing vehicle
     */
    update: adminProcedure
        .meta({
            openapi: {
                method: "PATCH",
                path: "/vehicles/{vehicleId}",
                tags: ["Vehicles"],
                summary: "Update vehicle",
                description: "Updates an existing vehicle's information. Supports partial updates.",
                protect: true,
            },
        })
        .input(updateVehicleInputSchema)
        .output(updateVehicleOutputSchema)
        .mutation(async ({ ctx, input }) => {
            const { vehicleId, ...updateData } = input;
            const isAdmin = ctx.user.role === 'ADMIN';
            return service.updateVehicle(vehicleId, updateData, ctx.organizationId, isAdmin, ctx.logger);
        }),

    /**
     * Soft delete a vehicle (set status to OUT_OF_SERVICE)
     */
    delete: adminProcedure
        .meta({
            openapi: {
                method: "DELETE",
                path: "/vehicles/{vehicleId}",
                tags: ["Vehicles"],
                summary: "Delete vehicle",
                description: "Soft deletes a vehicle by setting its status to OUT_OF_SERVICE",
                protect: true,
            },
        })
        .input(deleteVehicleInputSchema)
        .output(deleteVehicleOutputSchema)
        .mutation(async ({ ctx, input }) => {
            const isAdmin = ctx.user.role === 'ADMIN';
            return service.deleteVehicle(input.vehicleId, ctx.organizationId, isAdmin, ctx.logger);
        }),

    /**
     * Change vehicle status
     */
    changeStatus: adminProcedure
        .meta({
            openapi: {
                method: "POST",
                path: "/vehicles/{vehicleId}/status",
                tags: ["Vehicles"],
                summary: "Change vehicle status",
                description: "Changes the status of a vehicle (ACTIVE, MAINTENANCE, OUT_OF_SERVICE)",
                protect: true,
            },
        })
        .input(changeStatusInputSchema)
        .output(changeStatusOutputSchema)
        .mutation(async ({ ctx, input }) => {
            const isAdmin = ctx.user.role === 'ADMIN';
            return service.changeStatus(input.vehicleId, input.status, ctx.organizationId, isAdmin, ctx.logger);
        }),

    /**
     * Assign or unassign a driver to a vehicle
     */
    assignDriver: adminProcedure
        .meta({
            openapi: {
                method: "POST",
                path: "/vehicles/{vehicleId}/assign-driver",
                tags: ["Vehicles"],
                summary: "Assign driver to vehicle",
                description: "Assigns or unassigns a driver to/from a vehicle. Pass null driverId to unassign.",
                protect: true,
            },
        })
        .input(assignDriverInputSchema)
        .output(assignDriverOutputSchema)
        .mutation(async ({ ctx, input }) => {
            const isAdmin = ctx.user.role === 'ADMIN';
            return service.assignDriver(input.vehicleId, input.driverId, ctx.organizationId, isAdmin, ctx.logger);
        }),

    /**
     * Unassign driver from vehicle (convenience method)
     */
    unassignDriver: adminProcedure
        .meta({
            openapi: {
                method: "POST",
                path: "/vehicles/{vehicleId}/unassign-driver",
                tags: ["Vehicles"],
                summary: "Unassign driver from vehicle",
                description: "Removes the currently assigned driver from a vehicle",
                protect: true,
            },
        })
        .input(getVehicleInputSchema)
        .output(assignDriverOutputSchema)
        .mutation(async ({ ctx, input }) => {
            const isAdmin = ctx.user.role === 'ADMIN';
            return service.assignDriver(input.vehicleId, null, ctx.organizationId, isAdmin, ctx.logger);
        }),

    /**
     * Transfer vehicle to another organization
     */
    saleVehicle: adminProcedure
        .meta({
            openapi: {
                method: "POST",
                path: "/vehicles/{vehicleId}/sale",
                tags: ["Vehicles"],
                summary: "Transfer vehicle to organization",
                description: "Transfers a vehicle to another organization",
                protect: true,
            },
        })
        .input(saleVehicleInputSchema)
        .output(saleVehicleOutputSchema)
        .mutation(async ({ ctx, input }) => {
            const isAdmin = ctx.user.role === 'ADMIN';
            return service.saleToNewOrganization(input.vehicleId, ctx.organizationId, input.newOrganizationId, isAdmin, ctx.logger);
        }),
});
