import { z } from "zod";

// ============================================
// ENUMS (matching Prisma enums)
// ============================================

export const vehicleTypeSchema = z.enum([
  "TRUCK",
  "TRAILER",
  "VAN",
  "BUS",
]);

export const vehicleStatusSchema = z.enum([
  "ACTIVE",
  "MAINTENANCE",
  "OUT_OF_SERVICE",
]);

// ============================================
// INPUT SCHEMAS
// ============================================

/**
 * List vehicles query input with filtering and pagination
 */
export const listVehiclesInputSchema = z.object({
  organizationId: z.string().optional(), // Only for ADMIN cross-org queries
  status: vehicleStatusSchema.optional(),
  type: vehicleTypeSchema.optional(),
  hasDriver: z.boolean().optional(), // Filter by assigned/unassigned
  search: z.string().optional(), // Search by plate, make, model, VIN
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional(), // For cursor-based pagination
});

/**
 * Get single vehicle input
 */
export const getVehicleInputSchema = z.object({
  vehicleId: z.string().min(1),
});

/**
 * Create vehicle input
 */
export const createVehicleInputSchema = z.object({
  plateNumber: z.string().min(1).max(20),
  vin: z.string().length(17).optional(), // VIN is exactly 17 characters
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  type: vehicleTypeSchema,
  notes: z.string().optional(),
});

/**
 * Update vehicle input (partial updates supported)
 */
export const updateVehicleInputSchema = z.object({
  vehicleId: z.string().min(1),
  plateNumber: z.string().min(1).max(20).optional(),
  vin: z.string().length(17).nullable().optional(),
  make: z.string().min(1).max(100).optional(),
  model: z.string().min(1).max(100).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).nullable().optional(),
  type: vehicleTypeSchema.optional(),
  status: vehicleStatusSchema.optional(),
  imageKey: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

/**
 * Delete (soft delete) vehicle input
 */
export const deleteVehicleInputSchema = z.object({
  vehicleId: z.string().min(1),
});

/**
 * Change vehicle status input
 */
export const changeStatusInputSchema = z.object({
  vehicleId: z.string().min(1),
  status: vehicleStatusSchema,
});

/**
 * Assign driver to vehicle input
 */
export const assignDriverInputSchema = z.object({
  vehicleId: z.string().min(1),
  driverId: z.string().nullable(), // null to unassign
});

// ============================================
// INFERRED TYPES
// ============================================

export type ListVehiclesInput = z.infer<typeof listVehiclesInputSchema>;
export type GetVehicleInput = z.infer<typeof getVehicleInputSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleInputSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleInputSchema>;
export type DeleteVehicleInput = z.infer<typeof deleteVehicleInputSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusInputSchema>;
export type AssignDriverInput = z.infer<typeof assignDriverInputSchema>;


/**
 * Change vehicle status input
 */
export const saleVehicleInputSchema = z.object({
  vehicleId: z.string().min(1),
  newOrganizationId: z.string().min(1),
});

export type SaleVehicleInput = z.infer<typeof saleVehicleInputSchema>;

// ============================================
// OUTPUT SCHEMAS (for OpenAPI documentation)
// These use z.any() to avoid type conflicts with Prisma service returns
// while still providing OpenAPI documentation structure
// ============================================

export const listVehiclesOutputSchema = z.object({
  vehicles: z.array(z.any()),
  nextCursor: z.string().nullable(),
});

export const vehicleDetailOutputSchema = z.any();

export const createVehicleOutputSchema = z.any();

export const updateVehicleOutputSchema = z.any();

export const deleteVehicleOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const changeStatusOutputSchema = z.any();

export const assignDriverOutputSchema = z.object({
  success: z.boolean(),
  vehicle: z.any().nullable(),
  message: z.string(),
});

export const listAvailableOutputSchema = z.array(z.any());

export const statisticsOutputSchema = z.object({
  total: z.number(),
  byStatus: z.record(z.string(), z.number()),
  byType: z.record(z.string(), z.number()),
  assigned: z.number(),
  unassigned: z.number(),
});

export const listWithLocationOutputSchema = z.array(z.any());

export const saleVehicleOutputSchema = z.any().nullable();
