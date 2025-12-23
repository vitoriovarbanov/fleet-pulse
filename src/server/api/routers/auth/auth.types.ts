import { z } from "zod";

/**
 * Zod schemas for auth-related operations
 */

export const syncUserInputSchema = z.object({
    clerkUserId: z.string().min(1),
});

export const userResponseSchema = z.object({
    id: z.string(),
    clerkId: z.string(),
    email: z.string().email(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    avatarUrl: z.string().nullable(),
    role: z.enum(["ADMIN", "FLEET_MANAGER", "DISPATCHER", "DRIVER"]),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    organizationId: z.string(),
});

export type SyncUserInput = z.infer<typeof syncUserInputSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
