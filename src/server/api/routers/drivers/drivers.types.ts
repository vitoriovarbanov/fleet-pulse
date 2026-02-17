import { z } from "zod";

// ============================================
// ENUMS (matching Prisma enums)
// ============================================

export const driverStatusSchema = z.enum([
  "AVAILABLE",
  "ON_DUTY",
  "OFF_DUTY",
  "ON_REST",
  "SICK_LEAVE",
  "VACATION",
]);

export const euLicenseCategorySchema = z.enum([
  "C1",
  "C1E",
  "C",
  "CE",
  "D1",
  "D1E",
  "D",
  "DE",
]);

// ============================================
// INPUT SCHEMAS
// ============================================

/**
 * List drivers query input with filtering and pagination
 */
export const listDriversInputSchema = z.object({
  organizationId: z.string().optional(), // Only for ADMIN cross-org queries
  status: driverStatusSchema.optional(),
  isAvailable: z.boolean().optional(),
  search: z.string().optional(), // Search by name, email, license
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional(), // For cursor-based pagination
});

/**
 * Get single driver input
 */
export const getDriverInputSchema = z.object({
  driverId: z.string().min(1),
});

/**
 * Create driver input (creates User + DriverProfile together)
 */
export const createDriverInputSchema = z.object({
  // User fields
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phoneNumber: z.string().optional(),
  employeeId: z.string().optional(),
  hireDate: z.coerce.date().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().length(2).default("DE"), // ISO 3166-1 alpha-2
  contractType: z.string().optional(),

  // DriverProfile fields
  licenseNumber: z.string().min(1),
  licenseCountry: z.string().length(2).default("DE"),
  licenseIssueDate: z.coerce.date(),
  licenseExpiryDate: z.coerce.date(),
  licenseCategories: z.array(euLicenseCategorySchema).min(1),
  medicalCertIssueDate: z.coerce.date().optional(),
  medicalCertExpiryDate: z.coerce.date().optional(),
  yearsExperience: z.number().int().min(0).optional(),
  adrCertNumber: z.string().optional(),
  adrExpiryDate: z.coerce.date().optional(),
  notes: z.string().optional(),

  // Invitation option
  sendInvitation: z.boolean().default(true), // Send Clerk invitation email
});

/**
 * Update driver input (partial updates supported)
 */
export const updateDriverInputSchema = z.object({
  driverId: z.string().min(1),

  // User fields (all optional)
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phoneNumber: z.string().nullable().optional(),
  employeeId: z.string().nullable().optional(),
  hireDate: z.coerce.date().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string().length(2).optional(),
  contractType: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),

  // DriverProfile fields (all optional)
  licenseNumber: z.string().min(1).optional(),
  licenseCountry: z.string().length(2).optional(),
  licenseIssueDate: z.coerce.date().optional(),
  licenseExpiryDate: z.coerce.date().optional(),
  licenseCategories: z.array(euLicenseCategorySchema).min(1).optional(),
  medicalCertIssueDate: z.coerce.date().nullable().optional(),
  medicalCertExpiryDate: z.coerce.date().nullable().optional(),
  driverStatus: driverStatusSchema.optional(),
  isAvailable: z.boolean().optional(),
  yearsExperience: z.number().int().min(0).nullable().optional(),
  safetyScore: z.number().min(0).max(100).nullable().optional(),
  onTimeDeliveryRate: z.number().min(0).max(100).nullable().optional(),
  adrCertNumber: z.string().nullable().optional(),
  adrExpiryDate: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
});

/**
 * Delete (soft delete) driver input
 */
export const deleteDriverInputSchema = z.object({
  driverId: z.string().min(1),
});

/**
 * Assign driver to vehicle input
 */
export const assignVehicleInputSchema = z.object({
  driverId: z.string().min(1),
  vehicleId: z.string().nullable(), // null to unassign
});

// ============================================
// OUTPUT SCHEMAS (for OpenAPI documentation)
// ============================================

const userStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

const vehicleBasicSchema = z.object({
  id: z.string(),
  plateNumber: z.string(),
  make: z.string(),
  model: z.string(),
});

const vehicleDetailSchema = vehicleBasicSchema.extend({
  type: z.string(),
  status: z.string(),
});

const driverCardSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  email: z.string(),
  status: userStatusSchema,
  driverProfile: z.object({
    id: z.string(),
    driverStatus: driverStatusSchema,
    isAvailable: z.boolean(),
    licenseCategories: z.array(euLicenseCategorySchema),
    licenseExpiryDate: z.coerce.date(),
    assignedVehicleId: z.string().nullable(),
    assignedVehicle: vehicleBasicSchema.nullable(),
  }).nullable(),
});

const organizationBasicSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const driverProfileDetailSchema = z.object({
  id: z.string(),
  licenseNumber: z.string(),
  licenseCountry: z.string(),
  licenseIssueDate: z.coerce.date(),
  licenseExpiryDate: z.coerce.date(),
  licenseCategories: z.array(euLicenseCategorySchema),
  medicalCertIssueDate: z.coerce.date().nullable(),
  medicalCertExpiryDate: z.coerce.date().nullable(),
  driverStatus: driverStatusSchema,
  isAvailable: z.boolean(),
  yearsExperience: z.number().nullable(),
  assignedVehicleId: z.string().nullable(),
  safetyScore: z.any().nullable(), // Decimal from Prisma, serialized by superjson
  onTimeDeliveryRate: z.any().nullable(), // Decimal from Prisma, serialized by superjson
  adrCertNumber: z.string().nullable(),
  adrExpiryDate: z.coerce.date().nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  assignedVehicle: vehicleDetailSchema.nullable(),
});

const driverDetailSchema = z.object({
  id: z.string(),
  clerkId: z.string().nullable(),
  organizationId: z.string(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  role: z.enum(["ADMIN", "FLEET_MANAGER", "DISPATCHER", "DRIVER"]),
  status: userStatusSchema,
  employeeId: z.string().nullable(),
  hireDate: z.coerce.date().nullable(),
  terminationDate: z.coerce.date().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),
  contractType: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  organization: organizationBasicSchema,
  driverProfile: driverProfileDetailSchema.nullable(),
});

export const listDriversOutputSchema = z.object({
  drivers: z.array(driverCardSchema),
  nextCursor: z.string().nullable(),
});

export const driverDetailOutputSchema = driverDetailSchema.nullable();

export const createDriverOutputSchema = driverDetailSchema.nullable();

export const updateDriverOutputSchema = driverDetailSchema.nullable();

export const deleteDriverOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const assignVehicleOutputSchema = z.object({
  success: z.boolean(),
  driver: driverDetailSchema.nullable(),
  message: z.string(),
});

// ============================================
// INFERRED TYPES
// ============================================

export type ListDriversInput = z.infer<typeof listDriversInputSchema>;
export type GetDriverInput = z.infer<typeof getDriverInputSchema>;
export type CreateDriverInput = z.infer<typeof createDriverInputSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverInputSchema>;
export type DeleteDriverInput = z.infer<typeof deleteDriverInputSchema>;
export type AssignVehicleInput = z.infer<typeof assignVehicleInputSchema>;
