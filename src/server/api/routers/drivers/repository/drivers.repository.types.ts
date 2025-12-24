import type { Prisma } from "@/generated/prisma/client";

/**
 * Prisma select for card view (minimal data for list display)
 */
export const driverCardSelect = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  phoneNumber: true,
  email: true,
  status: true,
  driverProfile: {
    select: {
      id: true,
      driverStatus: true,
      isAvailable: true,
      licenseCategories: true,
      licenseExpiryDate: true,
      assignedVehicleId: true,
      assignedVehicle: {
        select: {
          id: true,
          plateNumber: true,
          make: true,
          model: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect;

/**
 * Prisma select for detail view (full data for editing)
 */
export const driverDetailSelect = {
  id: true,
  clerkId: true,
  organizationId: true,
  email: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  phoneNumber: true,
  role: true,
  status: true,
  employeeId: true,
  hireDate: true,
  terminationDate: true,
  address: true,
  city: true,
  postalCode: true,
  country: true,
  contractType: true,
  createdAt: true,
  updatedAt: true,
  organization: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  driverProfile: {
    select: {
      id: true,
      licenseNumber: true,
      licenseCountry: true,
      licenseIssueDate: true,
      licenseExpiryDate: true,
      licenseCategories: true,
      medicalCertIssueDate: true,
      medicalCertExpiryDate: true,
      driverStatus: true,
      isAvailable: true,
      yearsExperience: true,
      assignedVehicleId: true,
      safetyScore: true,
      onTimeDeliveryRate: true,
      adrCertNumber: true,
      adrExpiryDate: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      assignedVehicle: {
        select: {
          id: true,
          plateNumber: true,
          make: true,
          model: true,
          type: true,
          status: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect;

/**
 * Inferred type for driver card (list view)
 */
export type DriverCard = Prisma.UserGetPayload<{
  select: typeof driverCardSelect;
}>;

/**
 * Inferred type for driver detail (full view)
 */
export type DriverDetail = Prisma.UserGetPayload<{
  select: typeof driverDetailSelect;
}>;
