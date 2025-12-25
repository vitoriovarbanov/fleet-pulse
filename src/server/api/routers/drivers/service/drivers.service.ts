import { TRPCError } from '@trpc/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/server/database';
import { env } from '@/env';
import { Logger } from '@/server/api/common/logger';
import * as repository from '../repository/drivers.repository';
import type { ListDriversInput, CreateDriverInput, UpdateDriverInput } from '../drivers.types';
import type { ListDriversResult, DriverResult, DeleteDriverResult, AssignVehicleResult } from './drivers.service.types';

/**
 * List drivers with filtering and pagination
 */
export async function listDrivers(
    input: ListDriversInput,
    organizationId: string,
    isAdmin: boolean,
    logger?: Logger
): Promise<ListDriversResult> {
    const log = logger?.child('DriversService') ?? new Logger('DriversService');
    log.debug('Listing drivers', { limit: input.limit });

    const result = await repository.findDrivers(input, organizationId, isAdmin);

    log.info('Drivers listed', { count: result.drivers.length });
    return result;
}

/**
 * Get a single driver by ID
 */
export async function getDriver(
    driverId: string,
    organizationId: string,
    isAdmin: boolean,
    logger?: Logger
): Promise<DriverResult> {
    const log = logger?.child('DriversService') ?? new Logger('DriversService');
    log.debug('Getting driver', { driverId });

    const driver = await repository.findDriverById(driverId, organizationId, isAdmin);

    if (!driver) {
        log.warn('Driver not found', { driverId });
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Driver not found or access denied',
        });
    }

    log.debug('Driver retrieved', { driverId });
    return driver;
}

/**
 * Create a new driver
 */
export async function createDriver(
    input: CreateDriverInput,
    organizationId: string,
    logger?: Logger
): Promise<DriverResult> {
    const log = logger?.child('DriversService') ?? new Logger('DriversService');
    log.info('Creating driver');

    // Validate email uniqueness
    const existingEmail = await db.user.findUnique({
        where: { email: input.email },
    });
    if (existingEmail) {
        log.warn('Email already exists');
        throw new TRPCError({
            code: 'CONFLICT',
            message: 'A user with this email already exists',
        });
    }

    // Validate license number uniqueness
    const existingLicense = await db.driverProfile.findUnique({
        where: { licenseNumber: input.licenseNumber },
    });
    if (existingLicense) {
        log.warn('License number already exists');
        throw new TRPCError({
            code: 'CONFLICT',
            message: 'A driver with this license number already exists',
        });
    }

    // Validate employee ID uniqueness if provided
    if (input.employeeId) {
        const existingEmployeeId = await db.user.findUnique({
            where: { employeeId: input.employeeId },
        });
        if (existingEmployeeId) {
            log.warn('Employee ID already exists');
            throw new TRPCError({
                code: 'CONFLICT',
                message: 'A user with this employee ID already exists',
            });
        }
    }

    // Validate license expiry is in the future
    if (input.licenseExpiryDate < new Date()) {
        log.warn('License expiry date in the past');
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'License expiry date must be in the future',
        });
    }

    // Create driver in database
    const driver = await repository.createDriver(input, organizationId);
    log.info('Driver created', { driverId: driver.id });

    // Send Clerk invitation if requested
    if (input.sendInvitation) {
        try {
            const clerk = await clerkClient();
            await clerk.invitations.createInvitation({
                emailAddress: input.email,
                publicMetadata: {
                    role: 'DRIVER',
                    organizationId,
                },
                redirectUrl: `${env.NEXT_PUBLIC_APP_URL}/sign-up`,
            });
            log.info('Invitation sent to driver');
        } catch (error) {
            // Log but don't fail - driver is created, invitation can be resent
            log.error('Failed to send invitation', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    return driver;
}

/**
 * Update an existing driver
 */
export async function updateDriver(
    driverId: string,
    input: Omit<UpdateDriverInput, 'driverId'>,
    organizationId: string,
    isAdmin: boolean,
    logger?: Logger
): Promise<DriverResult> {
    const log = logger?.child('DriversService') ?? new Logger('DriversService');
    log.info('Updating driver', { driverId });

    // Validate license number uniqueness if changing
    if (input.licenseNumber) {
        const existingLicense = await db.driverProfile.findFirst({
            where: {
                licenseNumber: input.licenseNumber,
                user: { id: { not: driverId } },
            },
        });
        if (existingLicense) {
            log.warn('License number already exists');
            throw new TRPCError({
                code: 'CONFLICT',
                message: 'A driver with this license number already exists',
            });
        }
    }

    // Validate employee ID uniqueness if changing
    if (input.employeeId) {
        const existingEmployeeId = await db.user.findFirst({
            where: {
                employeeId: input.employeeId,
                id: { not: driverId },
            },
        });
        if (existingEmployeeId) {
            log.warn('Employee ID already exists');
            throw new TRPCError({
                code: 'CONFLICT',
                message: 'A user with this employee ID already exists',
            });
        }
    }

    const result = await repository.updateDriver(driverId, input, organizationId, isAdmin);

    if (!result) {
        log.warn('Driver not found for update', { driverId });
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Driver not found or access denied',
        });
    }

    log.info('Driver updated', { driverId });
    return result;
}

/**
 * Soft delete a driver
 */
export async function deleteDriver(
    driverId: string,
    organizationId: string,
    isAdmin: boolean,
    logger?: Logger
): Promise<DeleteDriverResult> {
    const log = logger?.child('DriversService') ?? new Logger('DriversService');
    log.info('Deleting driver', { driverId });

    const success = await repository.softDeleteDriver(driverId, organizationId, isAdmin);

    if (!success) {
        log.warn('Driver not found for deletion', { driverId });
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Driver not found or access denied',
        });
    }

    log.info('Driver deactivated', { driverId });
    return {
        success: true,
        message: 'Driver deactivated successfully',
    };
}

/**
 * Assign or unassign a vehicle to a driver
 */
export async function assignVehicle(
    driverId: string,
    vehicleId: string | null,
    organizationId: string,
    isAdmin: boolean,
    logger?: Logger
): Promise<AssignVehicleResult> {
    const log = logger?.child('DriversService') ?? new Logger('DriversService');
    log.info('Assigning vehicle', { driverId, vehicleId });

    const result = await repository.assignVehicleToDriver(driverId, vehicleId, organizationId, isAdmin);

    if (!result) {
        log.warn('Failed to assign vehicle', { driverId, vehicleId });
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: vehicleId
                ? 'Driver or vehicle not found, or vehicle is not available'
                : 'Driver not found or access denied',
        });
    }

    log.info('Vehicle assignment updated', { driverId, vehicleId });
    return {
        success: true,
        driver: result,
        message: vehicleId ? 'Vehicle assigned successfully' : 'Vehicle unassigned successfully',
    };
}
