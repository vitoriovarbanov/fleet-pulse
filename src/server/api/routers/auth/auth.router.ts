import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { getCurrentUser, refreshUserFromClerk } from "./service/auth.service";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Output schemas for OpenAPI documentation
const meOutputSchema = z.object({
    id: z.string(),
    clerkId: z.string(),
    email: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    avatarUrl: z.string().nullable(),
    role: z.enum(["ADMIN", "FLEET_MANAGER", "DISPATCHER", "DRIVER"]),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    organization: z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
    }),
});

const userRoleSchema = z.enum(["ADMIN", "FLEET_MANAGER", "DISPATCHER", "DRIVER"]);

const syncStatusOutputSchema = z.union([
    z.object({
        synced: z.literal(false),
        reason: z.string(),
    }),
    z.object({
        synced: z.literal(true),
        userId: z.string(),
        role: userRoleSchema,
    }),
]);

const refreshProfileOutputSchema = z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    avatarUrl: z.string().nullable(),
});

/**
 * Auth Router
 * Handles authentication-related procedures
 */
export const authRouter = createTRPCRouter({
    /**
     * Get the current authenticated user
     * Returns null if user is not found in database
     */
    me: protectedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/auth/me",
                tags: ["Auth"],
                summary: "Get current user",
                description: "Returns the currently authenticated user's profile and organization",
                protect: true,
            },
        })
        .input(z.void())
        .output(meOutputSchema)
        .query(async ({ ctx }) => {
            // User is already available from the protectedProcedure middleware
            return {
                id: ctx.user.id,
                clerkId: ctx.user.clerkId,
                email: ctx.user.email,
                firstName: ctx.user.firstName,
                lastName: ctx.user.lastName,
                avatarUrl: ctx.user.avatarUrl,
                role: ctx.user.role,
                status: ctx.user.status,
                organization: {
                    id: ctx.user.organization.id,
                    name: ctx.user.organization.name,
                    slug: ctx.user.organization.slug,
                },
            };
        }),

    /**
     * Check if the current Clerk user exists in the database
     * Useful for checking sync status without triggering lazy sync
     */
    checkSyncStatus: publicProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/auth/sync-status",
                tags: ["Auth"],
                summary: "Check sync status",
                description: "Checks if the current Clerk user exists in the database without triggering lazy sync",
            },
        })
        .input(z.void())
        .output(syncStatusOutputSchema)
        .query(async ({ ctx }) => {
            if (!ctx.clerkUserId) {
                return { synced: false as const, reason: "not_authenticated" };
            }

            const user = await getCurrentUser(ctx.clerkUserId);

            if (!user) {
                return { synced: false as const, reason: "user_not_in_database" };
            }

            return {
                synced: true as const,
                userId: user.id,
                role: user.role,
            };
        }),

    /**
     * Manually refresh user data from Clerk
     * Updates email, name, and avatar from Clerk's data
     */
    refreshProfile: protectedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: "/auth/refresh-profile",
                tags: ["Auth"],
                summary: "Refresh profile from Clerk",
                description: "Manually refreshes user data (email, name, avatar) from Clerk",
                protect: true,
            },
        })
        .input(z.void())
        .output(refreshProfileOutputSchema)
        .mutation(async ({ ctx }) => {
            const updatedUser = await refreshUserFromClerk(ctx.clerkUserId!);

            if (!updatedUser) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found in database",
                });
            }

            return {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                avatarUrl: updatedUser.avatarUrl,
            };
        }),
});
