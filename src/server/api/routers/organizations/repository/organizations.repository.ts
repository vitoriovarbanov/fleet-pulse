import { db } from "@/server/database";
import type { Prisma, UserRole, UserStatus } from "@/generated/prisma/client";
import {
    organizationCardSelect,
    organizationDetailSelect,
    type OrganizationCard,
    type OrganizationDetail,
} from "./organizations.repository.types";
import type { ListOrganizationsInput } from "../organizations.types";

/**
 * Organizations Repository
 * Data access layer for organization operations
 */

/**
 * Find organizations with filtering and pagination
 */
export async function findOrganizations(
    input: ListOrganizationsInput
): Promise<{ organizations: OrganizationCard[]; nextCursor: string | null }> {
    const { search, isActive, limit, cursor } = input;

    const where: Prisma.OrganizationWhereInput = {};

    // Search filter
    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
        ];
    }

    // Active filter
    if (isActive !== undefined) {
        where.isActive = isActive;
    }

    const organizations = await db.organization.findMany({
        where,
        select: organizationCardSelect,
        take: limit + 1, // Get one extra to check if there's more
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
    });

    let nextCursor: string | null = null;
    if (organizations.length > limit) {
        const nextItem = organizations.pop();
        nextCursor = nextItem?.id ?? null;
    }

    return { organizations, nextCursor };
}

/**
 * Find organization by ID with full details
 */
export async function findOrganizationById(
    organizationId: string
): Promise<OrganizationDetail | null> {
    return db.organization.findUnique({
        where: { id: organizationId },
        select: organizationDetailSelect,
    });
}

/**
 * Find organization by slug
 */
export async function findOrganizationBySlug(
    slug: string
): Promise<OrganizationDetail | null> {
    return db.organization.findUnique({
        where: { slug },
        select: organizationDetailSelect,
    });
}

/**
 * Check if slug exists
 */
export async function checkSlugExists(slug: string): Promise<boolean> {
    const org = await db.organization.findUnique({
        where: { slug },
        select: { id: true },
    });
    return org !== null;
}

/**
 * Check if email is already in use by another user
 */
export async function checkEmailExists(email: string): Promise<boolean> {
    const user = await db.user.findUnique({
        where: { email },
        select: { id: true },
    });
    return user !== null;
}

/**
 * Create organization
 */
export async function createOrganization(
    data: Prisma.OrganizationCreateInput
): Promise<OrganizationDetail> {
    return db.organization.create({
        data,
        select: organizationDetailSelect,
    });
}

/**
 * Update organization
 */
export async function updateOrganization(
    organizationId: string,
    data: Prisma.OrganizationUpdateInput
): Promise<OrganizationDetail | null> {
    return db.organization.update({
        where: { id: organizationId },
        data,
        select: organizationDetailSelect,
    });
}

/**
 * Create user (for admin representative)
 */
export async function createUser(
    data: Prisma.UserCreateInput
): Promise<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: UserRole;
    status: UserStatus;
}> {
    return db.user.create({
        data,
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
        },
    });
}

/**
 * Find user by ID
 */
export async function findUserById(
    userId: string
): Promise<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    status: UserStatus;
    organizationId: string;
} | null> {
    return db.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
            organizationId: true,
        },
    });
}
