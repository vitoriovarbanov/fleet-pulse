import type { Prisma } from "@/generated/prisma/client";

/**
 * Prisma select for card view (minimal data for list display)
 */
export const vehicleCardSelect = {
  id: true,
  plateNumber: true,
  make: true,
  model: true,
  year: true,
  type: true,
  status: true,
  imageKey: true,
  assignedDriver: {
    select: {
      id: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
  },
} satisfies Prisma.VehicleSelect;

/**
 * Prisma select for detail view (full data for editing)
 */
export const vehicleDetailSelect = {
  id: true,
  organizationId: true,
  plateNumber: true,
  vin: true,
  make: true,
  model: true,
  year: true,
  type: true,
  status: true,
  imageKey: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  organization: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  assignedDriver: {
    select: {
      id: true,
      driverStatus: true,
      isAvailable: true,
      licenseCategories: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          avatarUrl: true,
        },
      },
    },
  },
} satisfies Prisma.VehicleSelect;

/**
 * Inferred type for vehicle card (list view)
 */
export type VehicleCard = Prisma.VehicleGetPayload<{
  select: typeof vehicleCardSelect;
}>;

/**
 * Inferred type for vehicle detail (full view)
 */
export type VehicleDetail = Prisma.VehicleGetPayload<{
  select: typeof vehicleDetailSelect;
}>;

/**
 * Prisma select for map/dashboard view (vehicles with location and driver info)
 */
export const vehicleWithLocationSelect = {
  id: true,
  plateNumber: true,
  make: true,
  model: true,
  type: true,
  status: true,
  imageKey: true,
  latitude: true,
  longitude: true,
  lastLocationUpdate: true,
  assignedDriver: {
    select: {
      id: true,
      driverStatus: true,
      isAvailable: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          phoneNumber: true,
        },
      },
    },
  },
} satisfies Prisma.VehicleSelect;

/**
 * Inferred type for vehicle with location (map view)
 */
export type VehicleWithLocation = Prisma.VehicleGetPayload<{
  select: typeof vehicleWithLocationSelect;
}>;
