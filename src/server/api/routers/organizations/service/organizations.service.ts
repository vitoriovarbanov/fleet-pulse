import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { UserRole, UserStatus } from "@/generated/prisma/client";
import type { Logger } from "@/server/api/common/logger";
import * as repo from "../repository/organizations.repository";
import type {
    ListOrganizationsInput,
    CreateOrganizationInput,
    UpdateOrganizationInput,
} from "../organizations.types";
import type { OrganizationDetail } from "../repository/organizations.repository.types";

/**
 * Organizations Service
 * Business logic layer for organization operations
 */

/**
 * List organizations with filtering and pagination
 */
export async function listOrganizations(
    input: ListOrganizationsInput,
    logger?: Logger
) {
    const log = logger?.child("OrganizationsService");
    log?.debug("Listing organizations", { input });

    return repo.findOrganizations(input);
}

/**
 * Get organization by ID
 */
export async function getOrganization(
    organizationId: string,
    logger?: Logger
): Promise<OrganizationDetail | null> {
    const log = logger?.child("OrganizationsService");
    log?.debug("Getting organization", { organizationId });

    const organization = await repo.findOrganizationById(organizationId);

    if (!organization) {
        log?.warn("Organization not found", { organizationId });
        return null;
    }

    return organization;
}

/**
 * Create organization with admin representative
 */
export async function createOrganization(
    input: CreateOrganizationInput,
    logger?: Logger
): Promise<{
    organization: OrganizationDetail;
    admin: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: UserRole;
        status: UserStatus;
    };
    invitationSent: boolean;
}> {
    const log = logger?.child("OrganizationsService");
    log?.info("Creating organization", { name: input.name, slug: input.slug });

    // Validate slug uniqueness
    const slugExists = await repo.checkSlugExists(input.slug);
    if (slugExists) {
        log?.warn("Slug already exists", { slug: input.slug });
        throw new TRPCError({
            code: "CONFLICT",
            message: `Organization with slug "${input.slug}" already exists`,
        });
    }

    // Check admin email not already in use
    const emailExists = await repo.checkEmailExists(input.adminEmail);
    if (emailExists) {
        log?.warn("Admin email already in use", { email: input.adminEmail });
        throw new TRPCError({
            code: "CONFLICT",
            message: `Email "${input.adminEmail}" is already in use`,
        });
    }

    // Create organization
    const organization = await repo.createOrganization({
        name: input.name,
        slug: input.slug,
        registrationNumber: input.registrationNumber,
        email: input.email,
        phone: input.phone,
        address: input.address,
        city: input.city,
        postalCode: input.postalCode,
        country: input.country,
        locale: input.locale,
        currency: input.currency,
        planType: input.planType,
        isActive: true,
    });

    log?.info("Organization created", { organizationId: organization.id });

    // Create admin user with PENDING status
    const admin = await repo.createUser({
        email: input.adminEmail,
        firstName: input.adminFirstName,
        lastName: input.adminLastName,
        clerkId: `pending_${Date.now()}`, // Temporary placeholder until Clerk invitation is accepted
        role: UserRole.FLEET_MANAGER,
        status: UserStatus.PENDING,
        organization: {
            connect: { id: organization.id },
        },
    });

    log?.info("Admin user created", { userId: admin.id, status: "PENDING" });

    // Send Clerk invitation to fleet manager
    let invitationSent = false;
    try {
        const clerk = await clerkClient();
        await clerk.invitations.createInvitation({
            emailAddress: input.adminEmail,
            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/sign-in`,
            publicMetadata: {
                organizationId: organization.id,
                role: "FLEET_MANAGER",
            },
        });
        invitationSent = true;
        log?.info("Clerk invitation sent", { email: input.adminEmail });
    } catch (error) {
        log?.error("Failed to send Clerk invitation", {
            email: input.adminEmail,
            error: error instanceof Error ? error.message : "Unknown error",
        });
        // Don't throw - organization and user were created, invitation just failed
    }

    // Re-fetch organization to include the new user
    const updatedOrganization = await repo.findOrganizationById(organization.id);

    return {
        organization: updatedOrganization!,
        admin,
        invitationSent,
    };
}

/**
 * Update organization
 */
export async function updateOrganization(
    organizationId: string,
    input: Omit<UpdateOrganizationInput, "organizationId">,
    logger?: Logger
): Promise<OrganizationDetail | null> {
    const log = logger?.child("OrganizationsService");
    log?.info("Updating organization", { organizationId });

    // Check organization exists
    const existing = await repo.findOrganizationById(organizationId);
    if (!existing) {
        log?.warn("Organization not found", { organizationId });
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
        });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.registrationNumber !== undefined) updateData.registrationNumber = input.registrationNumber;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.postalCode !== undefined) updateData.postalCode = input.postalCode;
    if (input.country !== undefined) updateData.country = input.country;
    if (input.locale !== undefined) updateData.locale = input.locale;
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.planType !== undefined) updateData.planType = input.planType;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const updated = await repo.updateOrganization(organizationId, updateData);

    log?.info("Organization updated", { organizationId });

    return updated;
}

/**
 * Resend invitation to a pending user
 */
export async function resendInvitation(
    userId: string,
    logger?: Logger
): Promise<{ success: boolean; message: string }> {
    const log = logger?.child("OrganizationsService");
    log?.info("Resending invitation", { userId });

    // Find user
    const user = await repo.findUserById(userId);
    if (!user) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
        });
    }

    if (user.status !== "PENDING") {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User is not in PENDING status",
        });
    }

    try {
        const clerk = await clerkClient();
        await clerk.invitations.createInvitation({
            emailAddress: user.email,
            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/sign-in`,
            publicMetadata: {
                organizationId: user.organizationId,
                role: "FLEET_MANAGER",
            },
        });

        log?.info("Invitation resent", { email: user.email });

        return {
            success: true,
            message: `Invitation sent to ${user.email}`,
        };
    } catch (error) {
        log?.error("Failed to resend invitation", {
            email: user.email,
            error: error instanceof Error ? error.message : "Unknown error",
        });

        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send invitation. Please try again.",
        });
    }
}
