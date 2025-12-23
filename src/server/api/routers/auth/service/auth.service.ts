import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/server/database";
import { UserRole, UserStatus } from "@/generated/prisma/client";
import type { DbUser } from "@/server/api/trpc";

/**
 * Auth Service
 * Handles user synchronization between Clerk and the database
 * No repository needed - communicates with Clerk API and Prisma directly
 */

/**
 * Syncs a Clerk user to the database (lazy sync)
 * Creates the user if they don't exist, returns existing user if they do
 *
 * @param clerkUserId - The Clerk user ID to sync
 * @returns The database user with organization and profile relations
 * @throws Error if user creation fails or required data is missing
 */
export async function syncUserToDatabase(clerkUserId: string): Promise<DbUser> {
    // First, try to find existing user
    const existingUser = await db.user.findUnique({
        where: { clerkId: clerkUserId },
        include: {
            organization: true,
            driverProfile: true,
            dispatcherProfile: true,
        },
    });

    if (existingUser) {
        return existingUser;
    }

    // User doesn't exist - fetch from Clerk and create in database
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId);

    // Get primary email
    const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
    );

    if (!primaryEmail) {
        throw new Error("No primary email found for Clerk user");
    }

    // Get or create default organization
    let organization = await db.organization.findFirst({
        where: { slug: "default" },
    });

    if (!organization) {
        // Auto-create default organization if it doesn't exist
        organization = await db.organization.create({
            data: {
                name: "Default Organization",
                slug: "default",
                email: "admin@example.com",
                country: "DE",
                locale: "en-US",
                currency: "EUR",
                planType: "free",
                isActive: true,
            },
        });
        console.log(`[Auth Service] Created default organization: ${organization.id}`);
    }

    // Check if this is the first user - make them admin
    const existingUsersCount = await db.user.count({
        where: { organizationId: organization.id },
    });
    const isFirstUser = existingUsersCount === 0;

    // Create user in database
    const newUser = await db.user.create({
        data: {
            clerkId: clerkUserId,
            email: primaryEmail.emailAddress,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            avatarUrl: clerkUser.imageUrl,
            organizationId: organization.id,
            role: isFirstUser ? UserRole.ADMIN : UserRole.DRIVER,
            status: UserStatus.ACTIVE,
        },
        include: {
            organization: true,
            driverProfile: true,
            dispatcherProfile: true,
        },
    });

    console.log(`[Auth Service] Created user: ${newUser.email} with role ${newUser.role} (first user: ${isFirstUser})`);
    return newUser;
}

/**
 * Gets the current user from the database
 * Does NOT create the user if they don't exist
 *
 * @param clerkUserId - The Clerk user ID
 * @returns The database user or null if not found
 */
export async function getCurrentUser(clerkUserId: string): Promise<DbUser | null> {
    return db.user.findUnique({
        where: { clerkId: clerkUserId },
        include: {
            organization: true,
            driverProfile: true,
            dispatcherProfile: true,
        },
    });
}

/**
 * Updates user profile data from Clerk
 * Used when Clerk data changes (via webhook or manual refresh)
 *
 * @param clerkUserId - The Clerk user ID
 * @returns The updated database user
 */
export async function refreshUserFromClerk(clerkUserId: string): Promise<DbUser | null> {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId);

    const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
    );

    if (!primaryEmail) {
        throw new Error("No primary email found for Clerk user");
    }

    const updatedUser = await db.user.update({
        where: { clerkId: clerkUserId },
        data: {
            email: primaryEmail.emailAddress,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            avatarUrl: clerkUser.imageUrl,
        },
        include: {
            organization: true,
            driverProfile: true,
            dispatcherProfile: true,
        },
    });

    return updatedUser;
}
