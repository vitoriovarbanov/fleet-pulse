import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/server/database";
import { env } from "@/env";
import * as repository from "../repository/drivers.repository";
import type {
  ListDriversInput,
  CreateDriverInput,
  UpdateDriverInput,
} from "../drivers.types";
import type {
  ListDriversResult,
  DriverResult,
  DeleteDriverResult,
  AssignVehicleResult,
} from "./drivers.service.types";

/**
 * List drivers with filtering and pagination
 */
export async function listDrivers(
  input: ListDriversInput,
  organizationId: string,
  isAdmin: boolean
): Promise<ListDriversResult> {
  return repository.findDrivers(input, organizationId, isAdmin);
}

/**
 * Get a single driver by ID
 */
export async function getDriver(
  driverId: string,
  organizationId: string,
  isAdmin: boolean
): Promise<DriverResult> {
  const driver = await repository.findDriverById(
    driverId,
    organizationId,
    isAdmin
  );

  if (!driver) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Driver not found or access denied",
    });
  }

  return driver;
}

/**
 * Create a new driver
 */
export async function createDriver(
  input: CreateDriverInput,
  organizationId: string
): Promise<DriverResult> {
  // Validate email uniqueness
  const existingEmail = await db.user.findUnique({
    where: { email: input.email },
  });
  if (existingEmail) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "A user with this email already exists",
    });
  }

  // Validate license number uniqueness
  const existingLicense = await db.driverProfile.findUnique({
    where: { licenseNumber: input.licenseNumber },
  });
  if (existingLicense) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "A driver with this license number already exists",
    });
  }

  // Validate employee ID uniqueness if provided
  if (input.employeeId) {
    const existingEmployeeId = await db.user.findUnique({
      where: { employeeId: input.employeeId },
    });
    if (existingEmployeeId) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A user with this employee ID already exists",
      });
    }
  }

  // Validate license expiry is in the future
  if (input.licenseExpiryDate < new Date()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "License expiry date must be in the future",
    });
  }

  // Create driver in database
  const driver = await repository.createDriver(input, organizationId);

  // Send Clerk invitation if requested
  if (input.sendInvitation) {
    try {
      const clerk = await clerkClient();
      await clerk.invitations.createInvitation({
        emailAddress: input.email,
        publicMetadata: {
          role: "DRIVER",
          organizationId,
        },
        redirectUrl: `${env.NEXT_PUBLIC_APP_URL}/sign-up`,
      });
      console.log(`[Drivers Service] Sent invitation to ${input.email}`);
    } catch (error) {
      // Log but don't fail - driver is created, invitation can be resent
      console.error(`[Drivers Service] Failed to send invitation to ${input.email}:`, error);
    }
  }

  return driver;
}

/**
 * Update an existing driver
 */
export async function updateDriver(
  driverId: string,
  input: Omit<UpdateDriverInput, "driverId">,
  organizationId: string,
  isAdmin: boolean
): Promise<DriverResult> {
  // Validate license number uniqueness if changing
  if (input.licenseNumber) {
    const existingLicense = await db.driverProfile.findFirst({
      where: {
        licenseNumber: input.licenseNumber,
        user: { id: { not: driverId } },
      },
    });
    if (existingLicense) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A driver with this license number already exists",
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
      throw new TRPCError({
        code: "CONFLICT",
        message: "A user with this employee ID already exists",
      });
    }
  }

  const result = await repository.updateDriver(
    driverId,
    input,
    organizationId,
    isAdmin
  );

  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Driver not found or access denied",
    });
  }

  return result;
}

/**
 * Soft delete a driver
 */
export async function deleteDriver(
  driverId: string,
  organizationId: string,
  isAdmin: boolean
): Promise<DeleteDriverResult> {
  const success = await repository.softDeleteDriver(
    driverId,
    organizationId,
    isAdmin
  );

  if (!success) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Driver not found or access denied",
    });
  }

  return {
    success: true,
    message: "Driver deactivated successfully",
  };
}

/**
 * Assign or unassign a vehicle to a driver
 */
export async function assignVehicle(
  driverId: string,
  vehicleId: string | null,
  organizationId: string,
  isAdmin: boolean
): Promise<AssignVehicleResult> {
  const result = await repository.assignVehicleToDriver(
    driverId,
    vehicleId,
    organizationId,
    isAdmin
  );

  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: vehicleId
        ? "Driver or vehicle not found, or vehicle is not available"
        : "Driver not found or access denied",
    });
  }

  return {
    success: true,
    driver: result,
    message: vehicleId
      ? "Vehicle assigned successfully"
      : "Vehicle unassigned successfully",
  };
}
