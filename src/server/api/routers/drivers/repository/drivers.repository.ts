import { db } from '@/server/database';
import type { Prisma } from '@/generated/prisma/client';
import { driverCardSelect, driverDetailSelect, type DriverCard, type DriverDetail } from './drivers.repository.types';
import type { ListDriversInput, CreateDriverInput, UpdateDriverInput } from '../drivers.types';

/**
 * Find drivers with pagination and filtering
 */
export async function findDrivers(
    input: ListDriversInput,
    organizationId: string,
    isAdmin: boolean
): Promise<{ drivers: DriverCard[]; nextCursor: string | null }> {
    const { status, isAvailable, search, limit, cursor } = input;

    // Build where clause
    const where: Prisma.UserWhereInput = {
        role: 'DRIVER',
        status: 'ACTIVE', // Only show active users
        // Org scoping: ADMIN can query specific org or all, FLEET_MANAGER only their org
        ...(isAdmin && input.organizationId
            ? { organizationId: input.organizationId }
            : isAdmin
            ? {} // ADMIN with no org filter sees all
            : { organizationId }), // FLEET_MANAGER sees only their org
        ...(search && {
            OR: [
                { firstName: { contains: search, mode: 'insensitive' as const } },
                { lastName: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
                {
                    driverProfile: {
                        licenseNumber: { contains: search, mode: 'insensitive' as const },
                    },
                },
            ],
        }),
        ...((status !== undefined || isAvailable !== undefined) && {
            driverProfile: {
                ...(status && { driverStatus: status }),
                ...(isAvailable !== undefined && { isAvailable }),
            },
        }),
    };

    const drivers = await db.user.findMany({
        where,
        select: driverCardSelect,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        take: limit + 1, // Fetch one extra for cursor
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    let nextCursor: string | null = null;
    if (drivers.length > limit) {
        const nextItem = drivers.pop();
        nextCursor = nextItem?.id ?? null;
    }

    return { drivers, nextCursor };
}

/**
 * Find a single driver by ID with full details
 */
export async function findDriverById(
    driverId: string,
    organizationId: string,
    isAdmin: boolean
): Promise<DriverDetail | null> {
    const where: Prisma.UserWhereInput = {
        id: driverId,
        role: 'DRIVER',
        // ADMIN can access any org, FLEET_MANAGER only their org
        ...(isAdmin ? {} : { organizationId }),
    };

    return db.user.findFirst({
        where,
        select: driverDetailSelect,
    });
}

/**
 * Create a new driver (User + DriverProfile in transaction)
 */
export async function createDriver(input: CreateDriverInput, organizationId: string): Promise<DriverDetail> {
    const {
        // User fields
        email,
        firstName,
        lastName,
        phoneNumber,
        employeeId,
        hireDate,
        address,
        city,
        postalCode,
        country,
        contractType,
        // DriverProfile fields
        licenseNumber,
        licenseCountry,
        licenseIssueDate,
        licenseExpiryDate,
        licenseCategories,
        medicalCertIssueDate,
        medicalCertExpiryDate,
        yearsExperience,
        adrCertNumber,
        adrExpiryDate,
        notes,
    } = input;

    return db.user.create({
        data: {
            // Generate a placeholder clerkId for manually created drivers
            clerkId: `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            organizationId,
            email,
            firstName,
            lastName,
            phoneNumber,
            employeeId,
            hireDate,
            address,
            city,
            postalCode,
            country,
            contractType,
            role: 'DRIVER',
            status: 'ACTIVE',
            driverProfile: {
                create: {
                    licenseNumber,
                    licenseCountry,
                    licenseIssueDate,
                    licenseExpiryDate,
                    licenseCategories,
                    medicalCertIssueDate,
                    medicalCertExpiryDate,
                    yearsExperience,
                    adrCertNumber,
                    adrExpiryDate,
                    notes,
                    driverStatus: 'OFF_DUTY',
                    isAvailable: true,
                },
            },
        },
        select: driverDetailSelect,
    });
}

/**
 * Update an existing driver
 */
export async function updateDriver(
    driverId: string,
    input: Omit<UpdateDriverInput, 'driverId'>,
    organizationId: string,
    isAdmin: boolean
): Promise<DriverDetail | null> {
    // First verify the driver exists and user has access
    const existingDriver = await findDriverById(driverId, organizationId, isAdmin);
    if (!existingDriver) return null;

    // Separate user and profile fields
    const {
        firstName,
        lastName,
        phoneNumber,
        employeeId,
        hireDate,
        address,
        city,
        postalCode,
        country,
        contractType,
        avatarUrl,
        // Profile fields
        licenseNumber,
        licenseCountry,
        licenseIssueDate,
        licenseExpiryDate,
        licenseCategories,
        medicalCertIssueDate,
        medicalCertExpiryDate,
        driverStatus,
        isAvailable,
        yearsExperience,
        safetyScore,
        onTimeDeliveryRate,
        adrCertNumber,
        adrExpiryDate,
        notes,
    } = input;

    // Build user update data
    const userData: Prisma.UserUpdateInput = {};
    if (firstName !== undefined) userData.firstName = firstName;
    if (lastName !== undefined) userData.lastName = lastName;
    if (phoneNumber !== undefined) userData.phoneNumber = phoneNumber;
    if (employeeId !== undefined) userData.employeeId = employeeId;
    if (hireDate !== undefined) userData.hireDate = hireDate;
    if (address !== undefined) userData.address = address;
    if (city !== undefined) userData.city = city;
    if (postalCode !== undefined) userData.postalCode = postalCode;
    if (country !== undefined) userData.country = country;
    if (contractType !== undefined) userData.contractType = contractType;
    if (avatarUrl !== undefined) userData.avatarUrl = avatarUrl;

    // Build profile update data
    const profileData: Prisma.DriverProfileUpdateInput = {};
    if (licenseNumber !== undefined) profileData.licenseNumber = licenseNumber;
    if (licenseCountry !== undefined) profileData.licenseCountry = licenseCountry;
    if (licenseIssueDate !== undefined) profileData.licenseIssueDate = licenseIssueDate;
    if (licenseExpiryDate !== undefined) profileData.licenseExpiryDate = licenseExpiryDate;
    if (licenseCategories !== undefined) profileData.licenseCategories = licenseCategories;
    if (medicalCertIssueDate !== undefined) profileData.medicalCertIssueDate = medicalCertIssueDate;
    if (medicalCertExpiryDate !== undefined) profileData.medicalCertExpiryDate = medicalCertExpiryDate;
    if (driverStatus !== undefined) profileData.driverStatus = driverStatus;
    if (isAvailable !== undefined) profileData.isAvailable = isAvailable;
    if (yearsExperience !== undefined) profileData.yearsExperience = yearsExperience;
    if (safetyScore !== undefined) profileData.safetyScore = safetyScore;
    if (onTimeDeliveryRate !== undefined) profileData.onTimeDeliveryRate = onTimeDeliveryRate;
    if (adrCertNumber !== undefined) profileData.adrCertNumber = adrCertNumber;
    if (adrExpiryDate !== undefined) profileData.adrExpiryDate = adrExpiryDate;
    if (notes !== undefined) profileData.notes = notes;

    // Add driverProfile update if there are profile changes
    if (Object.keys(profileData).length > 0) {
        userData.driverProfile = { update: profileData };
    }

    return db.user.update({
        where: { id: driverId },
        data: userData,
        select: driverDetailSelect,
    });
}

/**
 * Soft delete a driver (set status to INACTIVE)
 */
export async function softDeleteDriver(driverId: string, organizationId: string, isAdmin: boolean): Promise<boolean> {
    const existingDriver = await findDriverById(driverId, organizationId, isAdmin);
    if (!existingDriver) return false;

    await db.user.update({
        where: { id: driverId },
        data: {
            status: 'INACTIVE',
            terminationDate: new Date(),
            driverProfile: {
                update: {
                    isAvailable: false,
                    assignedVehicleId: null, // Unassign vehicle
                },
            },
        },
    });

    return true;
}

/**
 * Assign or unassign a vehicle to a driver
 */
export async function assignVehicleToDriver(
    driverId: string,
    vehicleId: string | null,
    organizationId: string,
    isAdmin: boolean
): Promise<DriverDetail | null> {
    const existingDriver = await findDriverById(driverId, organizationId, isAdmin);
    if (!existingDriver || !existingDriver.driverProfile) return null;

    // If assigning a vehicle, verify it exists and belongs to the org
    if (vehicleId) {
        const vehicle = await db.vehicle.findFirst({
            where: {
                id: vehicleId,
                ...(isAdmin ? {} : { organizationId }),
                status: 'ACTIVE',
            },
        });
        if (!vehicle) return null;
    }

    return db.user.update({
        where: { id: driverId },
        data: {
            driverProfile: {
                update: {
                    assignedVehicleId: vehicleId,
                },
            },
        },
        select: driverDetailSelect,
    });
}
