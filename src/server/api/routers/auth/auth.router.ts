import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { getCurrentUser, refreshUserFromClerk } from "./service/auth.service";
import { TRPCError } from "@trpc/server";

/**
 * Auth Router
 * Handles authentication-related procedures
 */
export const authRouter = createTRPCRouter({
    /**
     * Get the current authenticated user
     * Returns null if user is not found in database
     */
    me: protectedProcedure.query(async ({ ctx }) => {
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
    checkSyncStatus: publicProcedure.query(async ({ ctx }) => {
        if (!ctx.clerkUserId) {
            return { synced: false, reason: "not_authenticated" };
        }

        const user = await getCurrentUser(ctx.clerkUserId);

        if (!user) {
            return { synced: false, reason: "user_not_in_database" };
        }

        return {
            synced: true,
            userId: user.id,
            role: user.role,
        };
    }),

    /**
     * Manually refresh user data from Clerk
     * Updates email, name, and avatar from Clerk's data
     */
    refreshProfile: protectedProcedure.mutation(async ({ ctx }) => {
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
