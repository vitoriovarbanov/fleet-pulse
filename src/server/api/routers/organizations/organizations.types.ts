import { z } from "zod";

// ============================================
// INPUT SCHEMAS
// ============================================

/**
 * List organizations query input with filtering and pagination
 */
export const listOrganizationsInputSchema = z.object({
    search: z.string().optional(),
    isActive: z.boolean().optional(),
    limit: z.number().min(1).max(100).default(50),
    cursor: z.string().optional(),
});

/**
 * Get single organization input
 */
export const getOrganizationInputSchema = z.object({
    organizationId: z.string().min(1),
});

/**
 * Create organization input
 */
export const createOrganizationInputSchema = z.object({
    // Organization fields
    name: z.string().min(1).max(200),
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, {
        message: "Slug must be lowercase letters, numbers, and hyphens only",
    }),

    // Legal Information
    registrationNumber: z.string().optional(),

    // Contact Information
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().length(2).default("DE"),

    // Settings
    locale: z.string().default("de-DE"),
    currency: z.string().length(3).default("EUR"),

    // Subscription
    planType: z.enum(["free", "basic", "premium", "enterprise"]).default("free"),

    // Admin representative
    adminEmail: z.string().email(),
    adminFirstName: z.string().min(1).max(100),
    adminLastName: z.string().min(1).max(100),
});

/**
 * Update organization input
 */
export const updateOrganizationInputSchema = z.object({
    organizationId: z.string().min(1),
    name: z.string().min(1).max(200).optional(),

    // Legal Information
    registrationNumber: z.string().nullable().optional(),

    // Contact Information
    email: z.string().email().nullable().optional(),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    postalCode: z.string().nullable().optional(),
    country: z.string().length(2).optional(),

    // Settings
    locale: z.string().optional(),
    currency: z.string().length(3).optional(),

    // Subscription & Status
    planType: z.enum(["free", "basic", "premium", "enterprise"]).optional(),
    isActive: z.boolean().optional(),
});

/**
 * Resend invitation input
 */
export const resendInvitationInputSchema = z.object({
    userId: z.string().min(1),
});

// ============================================
// OUTPUT SCHEMAS (for OpenAPI documentation)
// ============================================

const planTypeSchema = z.enum(["free", "basic", "premium", "enterprise"]);

const organizationCardSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    email: z.string().nullable(),
    country: z.string(),
    planType: z.string(),
    isActive: z.boolean(),
    createdAt: z.coerce.date(),
    _count: z.object({
        users: z.number(),
        vehicles: z.number(),
    }),
});

const userBasicSchema = z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    role: z.enum(["ADMIN", "FLEET_MANAGER", "DISPATCHER", "DRIVER"]),
    status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]),
});

const organizationDetailSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    registrationNumber: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
    city: z.string().nullable(),
    postalCode: z.string().nullable(),
    country: z.string(),
    locale: z.string(),
    currency: z.string(),
    planType: z.string(),
    isActive: z.boolean(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    users: z.array(userBasicSchema),
    _count: z.object({
        users: z.number(),
        vehicles: z.number(),
    }),
});

export const listOrganizationsOutputSchema = z.object({
    organizations: z.array(organizationCardSchema),
    nextCursor: z.string().nullable(),
});

export const organizationDetailOutputSchema = organizationDetailSchema.nullable();

export const createOrganizationOutputSchema = z.object({
    organization: organizationDetailSchema,
    admin: userBasicSchema,
    invitationSent: z.boolean(),
});

export const updateOrganizationOutputSchema = organizationDetailSchema.nullable();

export const resendInvitationOutputSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

// ============================================
// INFERRED TYPES
// ============================================

export type ListOrganizationsInput = z.infer<typeof listOrganizationsInputSchema>;
export type GetOrganizationInput = z.infer<typeof getOrganizationInputSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationInputSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationInputSchema>;
export type ResendInvitationInput = z.infer<typeof resendInvitationInputSchema>;
