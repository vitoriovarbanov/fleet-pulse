import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/server/database";
import { UserRole, UserStatus } from "@/generated/prisma/client";
import type { DbUser } from "@/server/api/trpc";
import { Logger } from "@/server/api/common/logger";

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
 * @param logger - Optional logger instance for request tracing
 * @returns The database user with organization and profile relations
 * @throws Error if user creation fails or required data is missing
 */
export async function syncUserToDatabase(clerkUserId: string, logger?: Logger): Promise<DbUser> {
    const log = logger?.child("AuthService") ?? new Logger("AuthService");

    log.debug("syncUserToDatabase called");

    // First, try to find existing user by clerkId
    const existingUser = await db.user.findUnique({
        where: { clerkId: clerkUserId },
        include: {
            organization: true,
            driverProfile: true,
            dispatcherProfile: true,
        },
    });

    if (existingUser) {
        log.debug("Found existing user by clerkId", { userId: existingUser.id });
        return existingUser;
    }

    log.debug("No user found by clerkId, checking by email");

    // User not found by clerkId - fetch from Clerk to get email
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId);

    // Get primary email
    const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
    );

    if (!primaryEmail) {
        log.error("No primary email found for Clerk user");
        throw new Error("No primary email found for Clerk user");
    }

    log.debug("Looking for user by email");

    // Check if user exists by email (pre-created by admin/seed)
    const existingUserByEmail = await db.user.findUnique({
        where: { email: primaryEmail.emailAddress },
        include: {
            organization: true,
            driverProfile: true,
            dispatcherProfile: true,
        },
    });

    if (existingUserByEmail) {
        log.info("Linking existing user to Clerk account", {
            userId: existingUserByEmail.id,
        });

        // Link existing user to Clerk account by updating clerkId
        const linkedUser = await db.user.update({
            where: { id: existingUserByEmail.id },
            data: {
                clerkId: clerkUserId,
                avatarUrl: clerkUser.imageUrl ?? existingUserByEmail.avatarUrl,
            },
            include: {
                organization: true,
                driverProfile: true,
                dispatcherProfile: true,
            },
        });

        log.info("User linked successfully", { userId: linkedUser.id });
        return linkedUser;
    }

    // Get or create default organization
    let organization = await db.organization.findFirst({
        where: { slug: "default" },
    });

    if (!organization) {
        log.info("Creating default organization");

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

        log.info("Default organization created", { orgId: organization.id });
    }

    // Check if this is the first user - make them admin
    const existingUsersCount = await db.user.count({
        where: { organizationId: organization.id },
    });
    const isFirstUser = existingUsersCount === 0;

    log.info("Creating new user", {
        isFirstUser,
        role: isFirstUser ? "ADMIN" : "DRIVER",
    });

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

    log.info("User created successfully", {
        userId: newUser.id,
        role: newUser.role,
    });

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
 * @param logger - Optional logger instance for request tracing
 * @returns The updated database user
 */
export async function refreshUserFromClerk(
    clerkUserId: string,
    logger?: Logger
): Promise<DbUser | null> {
    const log = logger?.child("AuthService") ?? new Logger("AuthService");

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId);

    const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
    );

    if (!primaryEmail) {
        log.error("No primary email found for Clerk user");
        throw new Error("No primary email found for Clerk user");
    }

    log.info("Refreshing user from Clerk");

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

    log.info("User refreshed successfully", { userId: updatedUser.id });

    return updatedUser;
}
