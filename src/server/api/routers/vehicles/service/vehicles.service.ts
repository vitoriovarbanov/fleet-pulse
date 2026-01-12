import { TRPCError } from '@trpc/server';
import { db } from '@/server/database';
import { Logger } from '@/server/api/common/logger';
import * as repository from '../repository/vehicles.repository';
import type { VehicleCard, VehicleWithLocation } from '../repository/vehicles.repository.types';
import type { ListVehiclesInput, CreateVehicleInput, UpdateVehicleInput, ChangeStatusInput } from '../vehicles.types';
import type {
    ListVehiclesResult,
    VehicleResult,
    DeleteVehicleResult,
    AssignDriverResult,
    VehicleStatisticsResult,
} from './vehicles.service.types';

/**
 * List vehicles with filtering and pagination
 */
export async function listVehicles(
    input: ListVehiclesInput,
    organizationId: string,
    isAdmin: boolean,
    logger?: Logger
): Promise<ListVehiclesResult> {
    const log = logger?.child('VehiclesService') ?? new Logger('VehiclesService');
    log.debug('Listing vehicles', { limit: input.limit });

    const result = await repository.findVehicles(input, organizationId, isAdmin);

    log.info('Vehicles listed', { count: result.vehicles.length });
    return result;
}

/**
 * Get a single vehicle by ID
 */
export async function getVehicle(
    vehicleId: string,
    organizationId: string,
    isAdmin: boolean,
    logger?: Logger
): Promise<VehicleResult> {
    const log = logger?.child('VehiclesService') ?? new Logger('VehiclesService');
    log.debug('Getting vehicle', { vehicleId });

    const vehicle = await repository.findVehicleById(vehicleId, organizationId, isAdmin);

    if (!vehicle) {
        log.warn('Vehicle not found', { vehicleId });
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Vehicle not found or access denied',
        });
    }

    log.debug('Vehicle retrieved', { vehicleId });
    return vehicle;
}

/**
 * List available vehicles (no driver assigned, ACTIVE status)
 */
export async function listAvailableVehicles(
    organizationId: string,
    isAdmin: boolean,
    logger?: Logger
): Promise<VehicleCard[]> {
    const log = logger?.child('VehiclesService') ?? new Logger('VehiclesService');
    log.debug('Listing available vehicles');

    const vehicles = await repository.findAvailableVehicles(organizationId, isAdmin);

    log.info('Available vehicles listed', { count: vehicles.length });
    return vehicles;
}

/**
 * Create a new vehicle
 */
export async function createVehicle(
    input: CreateVehicleInput,
    organizationId: string,
    logger?: Logger
): Promise<VehicleResult> {
    const log = logger?.child('VehiclesService') ?? new Logger('VehiclesService');
    log.info('Creating vehicle');

    // Validate plate number uniqueness
    const existingPlate = await db.vehicle.findUnique({
        where: { plateNumber: input.plateNumber },
    });
    if (existingPlate) {
        log.warn('Plate number already exists');
        throw new TRPCError({
            code: 'CONFLICT',
            message: 'A vehicle with this plate number already exists',
        });
    }

    // Validate VIN uniqueness if provided
    if (input.vin) {
        const existingVin = await db.vehicle.findUnique({
            where: { vin: input.vin },
        });
        if (existingVin) {
            log.warn('VIN already exists');
            throw new TRPCError({
                code: 'CONFLICT',
                message: 'A vehicle with this VIN already exists',
            });
        }
    }

    const vehicle = await repository.createVehicle(input, organizationId);
    log.info('Vehicle created', { vehicleId: vehicle.id });

    return vehicle;
}

/**
 * Update an existing vehicle
 */
export async function updateVehicle(
    vehicleId: string,
    input: Omit<UpdateVehicleInput, 'vehicleId'>,
    organizationId: string,
    isAdmin: boolean,
    logger?: Logger
): Promise<VehicleResult> {
    const log = logger?.child('VehiclesService') ?? new Logger('VehiclesService');
    log.info('Updating vehicle', { vehicleId });

    // Validate plate number uniqueness if changing
    if (input.plateNumber) {
        const existingPlate = await db.vehicle.findFirst({
            where: {
                plateNumber: input.plateNumber,
                id: { not: vehicleId },
            },
        });
        if (existingPlate) {
            log.warn('Plate number already exists');
            throw new TRPCError({
                code: 'CONFLICT',
                message: 'A vehicle with this plate number already exists',
            });
        }
    }

    // Validate VIN uniqueness if changing
    if (input.vin) {
        const existingVin = await db.vehicle.findFirst({
            where: {
                vin: input.vin,
                id: { not: vehicleId },
            },
        });
        if (existingVin) {
            log.warn('VIN already exists');
            throw new TRPCError({
                code: 'CONFLICT',
                message: 'A vehicle with this VIN already exists',
            });
        }
    }

    const result = await repository.updateVehicle(vehicleId, input, organizationId, isAdmin);

    if (!result) {
        log.warn('Vehicle not found for update', { vehicleId });
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Vehicle not found or access denied',
        });
    }

    log.info('Vehicle updated', { vehicleId });
    return result;
}

/**
 * Soft delete a vehicle
 */
export async function deleteVehicle(
    vehicleId: string,
    organizationId: string,
    isAdmin: boolean,
    logger?: Logger
): Promise<DeleteVehicleResult> {
    const log = logger?.child('VehiclesService') ?? new Logger('VehiclesService');
    log.info('Deleting vehicle', { vehicleId });

    const success = await repository.softDeleteVehicle(vehicleId, organizationId, isAdmin);

    if (!success) {
        log.warn('Vehicle not found for deletion', { vehicleId });
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Vehicle not found or access denied',
        });
    }

    log.info('Vehicle set to OUT_OF_SERVICE', { vehicleId });
    return {
        success: true,
        message: 'Vehicle marked as out of service successfully',
    };
}

/**
 * Change vehicle status
 */
export async function changeStatus(
    vehicleId: string,
    status: ChangeStatusInput['status'],
    organizationId: string,
    isAdmin: boolean,
    logger?: Logger
): Promise<VehicleResult> {
    const log = logger?.child('VehiclesService') ?? new Logger('VehiclesService');
    log.info('Changing vehicle status', { vehicleId, status });

    const result = await repository.changeVehicleStatus(vehicleId, status, organizationId, isAdmin);

    if (!result) {
        log.warn('Vehicle not found for status change', { vehicleId });
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Vehicle not found or access denied',
        });
    }

    log.info('Vehicle status changed', { vehicleId, status });
    return result;
}

/**
 * Assign or unassign a driver to a vehicle
 */
export async function assignDriver(
    vehicleId: string,
    driverId: string | null,
    organizationId: string,
    isAdmin: boolean,
    logger?: Logger
): Promise<AssignDriverResult> {
    const log = logger?.child('VehiclesService') ?? new Logger('VehiclesService');
    log.info('Assigning driver', { vehicleId, driverId });

    const result = await repository.assignDriverToVehicle(vehicleId, driverId, organizationId, isAdmin);

    if (!result) {
        log.warn('Failed to assign driver', { vehicleId, driverId });
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: driverId
                ? 'Vehicle or driver not found, or driver is not available'
                : 'Vehicle not found or access denied',
        });
    }

    log.info('Driver assignment updated', { vehicleId, driverId });
    return {
        success: true,
        vehicle: result,
        message: driverId ? 'Driver assigned successfully' : 'Driver unassigned successfully',
    };
}

/**
 * Get vehicle statistics
 */
export async function getStatistics(
    organizationId: string,
    isAdmin: boolean,
    logger?: Logger
): Promise<VehicleStatisticsResult> {
    const log = logger?.child('VehiclesService') ?? new Logger('VehiclesService');
    log.debug('Getting vehicle statistics');

    const stats = await repository.getVehicleStatistics(organizationId, isAdmin);

    log.debug('Vehicle statistics retrieved', { total: stats.total });
    return stats;
}

/**
 * List vehicles with location data for map display
 */
export async function listVehiclesWithLocation(
    organizationId: string,
    isAdmin: boolean,
    logger?: Logger
): Promise<VehicleWithLocation[]> {
    const log = logger?.child('VehiclesService') ?? new Logger('VehiclesService');
    log.debug('Listing vehicles with location');

    const vehicles = await repository.findVehiclesWithLocation(organizationId, isAdmin);

    log.info('Vehicles with location listed', { count: vehicles.length });
    return vehicles;
}

export async function saleToNewOrganization(
    vehicleId: string,
    organizationId: string,
    newOrganizationId: string,
    isAdmin: boolean,
    logger?: Logger
): Promise<VehicleResult> {
    const log = logger?.child('VehiclesService') ?? new Logger('VehiclesService');
    log.debug('Selling vehicle to new organization', { vehicleId, newOrganizationId });

    const result = await repository.saleVehicleToNewOrganization(vehicleId, organizationId, newOrganizationId, isAdmin);

    if (!result.success) {
        const errorMessages = {
            NOT_FOUND: 'Vehicle not found or access denied',
            HAS_DRIVER: 'Cannot sell vehicle with assigned driver. Please unassign the driver first.',
            ORG_NOT_FOUND: 'Target organization not found',
        };

        log.warn('Failed to sell vehicle', { vehicleId, newOrganizationId, reason: result.reason });
        throw new TRPCError({
            code: result.reason === 'HAS_DRIVER' ? 'BAD_REQUEST' : 'NOT_FOUND',
            message: errorMessages[result.reason],
        });
    }

    log.info('Vehicle sold to new organization', { vehicleId, newOrganizationId });
    return result.vehicle;
}
