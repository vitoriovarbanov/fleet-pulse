import type { Prisma } from "@/generated/prisma/client";

/**
 * Prisma select for card view (minimal data for list display)
 */
export const organizationCardSelect = {
    id: true,
    name: true,
    slug: true,
    email: true,
    country: true,
    planType: true,
    isActive: true,
    createdAt: true,
    _count: {
        select: {
            users: true,
            vehicles: true,
        },
    },
} satisfies Prisma.OrganizationSelect;

/**
 * Prisma select for detail view (full data for editing)
 */
export const organizationDetailSelect = {
    id: true,
    name: true,
    slug: true,
    registrationNumber: true,
    email: true,
    phone: true,
    address: true,
    city: true,
    postalCode: true,
    country: true,
    locale: true,
    currency: true,
    planType: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    users: {
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
        },
        where: {
            role: "FLEET_MANAGER",
        },
        take: 10,
        orderBy: {
            createdAt: "desc",
        },
    },
    _count: {
        select: {
            users: true,
            vehicles: true,
        },
    },
} satisfies Prisma.OrganizationSelect;

/**
 * Inferred type for organization card (list view)
 */
export type OrganizationCard = Prisma.OrganizationGetPayload<{
    select: typeof organizationCardSelect;
}>;

/**
 * Inferred type for organization detail (full view)
 */
export type OrganizationDetail = Prisma.OrganizationGetPayload<{
    select: typeof organizationDetailSelect;
}>;
