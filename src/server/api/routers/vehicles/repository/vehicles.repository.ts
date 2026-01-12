import { db } from '@/server/database';
import type { Prisma } from '@/generated/prisma/client';
import {
    vehicleCardSelect,
    vehicleDetailSelect,
    vehicleWithLocationSelect,
    type VehicleCard,
    type VehicleDetail,
    type VehicleWithLocation,
} from './vehicles.repository.types';
import type { ListVehiclesInput, CreateVehicleInput, UpdateVehicleInput } from '../vehicles.types';

/**
 * Find vehicles with pagination and filtering
 */
export async function findVehicles(
    input: ListVehiclesInput,
    organizationId: string,
    isAdmin: boolean
): Promise<{ vehicles: VehicleCard[]; nextCursor: string | null }> {
    const { status, type, hasDriver, search, limit, cursor } = input;

    // Build where clause
    const where: Prisma.VehicleWhereInput = {
        // Org scoping: ADMIN can query specific org or all, FLEET_MANAGER only their org
        ...(isAdmin && input.organizationId
            ? { organizationId: input.organizationId }
            : isAdmin
            ? {} // ADMIN with no org filter sees all
            : { organizationId }), // FLEET_MANAGER sees only their org
        ...(status && { status }),
        ...(type && { type }),
        ...(hasDriver !== undefined && {
            assignedDriver: hasDriver ? { isNot: null } : null,
        }),
        ...(search && {
            OR: [
                { plateNumber: { contains: search, mode: 'insensitive' as const } },
                { make: { contains: search, mode: 'insensitive' as const } },
                { model: { contains: search, mode: 'insensitive' as const } },
                { vin: { contains: search, mode: 'insensitive' as const } },
            ],
        }),
    };

    const vehicles = await db.vehicle.findMany({
        where,
        select: vehicleCardSelect,
        orderBy: [{ plateNumber: 'asc' }],
        take: limit + 1, // Fetch one extra for cursor
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    let nextCursor: string | null = null;
    if (vehicles.length > limit) {
        const nextItem = vehicles.pop();
        nextCursor = nextItem?.id ?? null;
    }

    return { vehicles, nextCursor };
}

/**
 * Find a single vehicle by ID with full details
 */
export async function findVehicleById(
    vehicleId: string,
    organizationId: string,
    isAdmin: boolean
): Promise<VehicleDetail | null> {
    const where: Prisma.VehicleWhereInput = {
        id: vehicleId,
        // ADMIN can access any org, FLEET_MANAGER only their org
        ...(isAdmin ? {} : { organizationId }),
    };

    return db.vehicle.findFirst({
        where,
        select: vehicleDetailSelect,
    });
}

/**
 * Find available vehicles (no assigned driver, ACTIVE status)
 */
export async function findAvailableVehicles(organizationId: string, isAdmin: boolean): Promise<VehicleCard[]> {
    return db.vehicle.findMany({
        where: {
            ...(isAdmin ? {} : { organizationId }),
            status: 'ACTIVE',
            assignedDriver: null,
        },
        select: vehicleCardSelect,
        orderBy: [{ plateNumber: 'asc' }],
    });
}

/**
 * Create a new vehicle
 */
export async function createVehicle(input: CreateVehicleInput, organizationId: string): Promise<VehicleDetail> {
    const { plateNumber, vin, make, model, year, type, notes } = input;

    return db.vehicle.create({
        data: {
            organizationId,
            plateNumber,
            vin,
            make,
            model,
            year,
            type,
            notes,
            status: 'ACTIVE',
        },
        select: vehicleDetailSelect,
    });
}

/**
 * Update an existing vehicle
 */
export async function updateVehicle(
    vehicleId: string,
    input: Omit<UpdateVehicleInput, 'vehicleId'>,
    organizationId: string,
    isAdmin: boolean
): Promise<VehicleDetail | null> {
    // First verify the vehicle exists and user has access
    const existingVehicle = await findVehicleById(vehicleId, organizationId, isAdmin);
    if (!existingVehicle) return null;

    // Build update data
    const data: Prisma.VehicleUpdateInput = {};
    if (input.plateNumber !== undefined) data.plateNumber = input.plateNumber;
    if (input.vin !== undefined) data.vin = input.vin;
    if (input.make !== undefined) data.make = input.make;
    if (input.model !== undefined) data.model = input.model;
    if (input.year !== undefined) data.year = input.year;
    if (input.type !== undefined) data.type = input.type;
    if (input.status !== undefined) data.status = input.status;
    if (input.imageKey !== undefined) data.imageKey = input.imageKey;
    if (input.notes !== undefined) data.notes = input.notes;

    return db.vehicle.update({
        where: { id: vehicleId },
        data,
        select: vehicleDetailSelect,
    });
}

/**
 * Soft delete a vehicle (set status to OUT_OF_SERVICE)
 */
export async function softDeleteVehicle(vehicleId: string, organizationId: string, isAdmin: boolean): Promise<boolean> {
    const existingVehicle = await findVehicleById(vehicleId, organizationId, isAdmin);
    if (!existingVehicle) return false;

    // Unassign driver if any
    if (existingVehicle.assignedDriver) {
        await db.driverProfile.update({
            where: { id: existingVehicle.assignedDriver.id },
            data: { assignedVehicleId: null },
        });
    }

    await db.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'OUT_OF_SERVICE' },
    });

    return true;
}

/**
 * Change vehicle status
 */
export async function changeVehicleStatus(
    vehicleId: string,
    status: 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE',
    organizationId: string,
    isAdmin: boolean
): Promise<VehicleDetail | null> {
    const existingVehicle = await findVehicleById(vehicleId, organizationId, isAdmin);
    if (!existingVehicle) return null;

    // If setting to OUT_OF_SERVICE, unassign driver
    if (status === 'OUT_OF_SERVICE' && existingVehicle.assignedDriver) {
        await db.driverProfile.update({
            where: { id: existingVehicle.assignedDriver.id },
            data: { assignedVehicleId: null },
        });
    }

    return db.vehicle.update({
        where: { id: vehicleId },
        data: { status },
        select: vehicleDetailSelect,
    });
}

/**
 * Assign or unassign a driver to a vehicle
 */
export async function assignDriverToVehicle(
    vehicleId: string,
    driverId: string | null,
    organizationId: string,
    isAdmin: boolean
): Promise<VehicleDetail | null> {
    const existingVehicle = await findVehicleById(vehicleId, organizationId, isAdmin);
    if (!existingVehicle) return null;

    // Unassign current driver if any
    if (existingVehicle.assignedDriver) {
        await db.driverProfile.update({
            where: { id: existingVehicle.assignedDriver.id },
            data: { assignedVehicleId: null },
        });
    }

    // If assigning a new driver, verify they exist, are available, and belong to org
    if (driverId) {
        const driver = await db.driverProfile.findFirst({
            where: {
                id: driverId,
                ...(isAdmin ? {} : { user: { organizationId } }),
                isAvailable: true,
                assignedVehicleId: null, // Must not be assigned to another vehicle
            },
        });
        if (!driver) return null;

        // Update driver's assignedVehicleId
        await db.driverProfile.update({
            where: { id: driverId },
            data: { assignedVehicleId: vehicleId },
        });
    }

    return findVehicleById(vehicleId, organizationId, isAdmin);
}

/**
 * Get vehicle statistics
 */
export async function getVehicleStatistics(
    organizationId: string,
    isAdmin: boolean
): Promise<{
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    assigned: number;
    unassigned: number;
    total: number;
}> {
    const whereBase = isAdmin ? {} : { organizationId };

    const [statusCounts, typeCounts, assignedCount, total] = await Promise.all([
        db.vehicle.groupBy({
            by: ['status'],
            where: whereBase,
            _count: { id: true },
        }),
        db.vehicle.groupBy({
            by: ['type'],
            where: whereBase,
            _count: { id: true },
        }),
        db.vehicle.count({
            where: { ...whereBase, assignedDriver: { isNot: null } },
        }),
        db.vehicle.count({ where: whereBase }),
    ]);

    const byStatus: Record<string, number> = {};
    statusCounts.forEach((s) => {
        byStatus[s.status] = s._count.id;
    });

    const byType: Record<string, number> = {};
    typeCounts.forEach((t) => {
        byType[t.type] = t._count.id;
    });

    return {
        byStatus,
        byType,
        assigned: assignedCount,
        unassigned: total - assignedCount,
        total,
    };
}

export type SaleVehicleResult =
    | { success: true; vehicle: VehicleDetail }
    | { success: false; reason: 'NOT_FOUND' | 'HAS_DRIVER' | 'ORG_NOT_FOUND' };

/**
 * Find all vehicles with location data for map display
 * Only returns vehicles that have coordinates set
 */
export async function findVehiclesWithLocation(
    organizationId: string,
    isAdmin: boolean
): Promise<VehicleWithLocation[]> {
    return db.vehicle.findMany({
        where: {
            ...(isAdmin ? {} : { organizationId }),
            // Only include vehicles with location data
            latitude: { not: null },
            longitude: { not: null },
        },
        select: vehicleWithLocationSelect,
        orderBy: [{ lastLocationUpdate: 'desc' }],
    });
}

export async function saleVehicleToNewOrganization(
    vehicleId: string,
    organizationId: string,
    newOrganizationId: string,
    isAdmin: boolean
): Promise<SaleVehicleResult> {
    const existingVehicle = await findVehicleById(vehicleId, organizationId, isAdmin);

    if (!existingVehicle) {
        return { success: false, reason: 'NOT_FOUND' };
    }

    if (existingVehicle.assignedDriver) {
        return { success: false, reason: 'HAS_DRIVER' };
    }

    // Verify new organization exists
    const newOrganization = await db.organization.findUnique({
        where: { id: newOrganizationId },
    });

    if (!newOrganization) {
        return { success: false, reason: 'ORG_NOT_FOUND' };
    }

    const updatedVehicle = await db.vehicle.update({
        where: { id: vehicleId },
        data: { organizationId: newOrganizationId },
        select: vehicleDetailSelect,
    });

    return { success: true, vehicle: updatedVehicle };
}
