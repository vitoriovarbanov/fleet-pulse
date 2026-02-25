import { createTRPCRouter, superAdminProcedure, superAdminRateLimitedProcedure } from "@/server/api/trpc";
import { RateLimits } from "@/server/api/common/middlewares/rate-limit.middleware";
import * as service from "./service/organizations.service";
import {
    listOrganizationsInputSchema,
    getOrganizationInputSchema,
    createOrganizationInputSchema,
    updateOrganizationInputSchema,
    resendInvitationInputSchema,
    listOrganizationsOutputSchema,
    organizationDetailOutputSchema,
    createOrganizationOutputSchema,
    updateOrganizationOutputSchema,
    resendInvitationOutputSchema,
} from "./organizations.types";

/**
 * Organizations Router
 * All procedures require ADMIN role (super admin only)
 */
export const organizationsRouter = createTRPCRouter({
    /**
     * List organizations with filtering and pagination
     */
    list: superAdminProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/organizations",
                tags: ["Organizations"],
                summary: "List organizations",
                description: "Returns a paginated list of organizations with optional filtering. Super admin only.",
                protect: true,
            },
        })
        .input(listOrganizationsInputSchema)
        .output(listOrganizationsOutputSchema)
        .query(async ({ ctx, input }) => {
            return service.listOrganizations(input, ctx.logger);
        }),

    /**
     * Get a single organization by ID with full details
     */
    getById: superAdminProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/organizations/{organizationId}",
                tags: ["Organizations"],
                summary: "Get organization by ID",
                description: "Returns a single organization with full details including admin users",
                protect: true,
            },
        })
        .input(getOrganizationInputSchema)
        .output(organizationDetailOutputSchema)
        .query(async ({ ctx, input }) => {
            return service.getOrganization(input.organizationId, ctx.logger);
        }),

    /**
     * Create a new organization with admin representative
     * Rate limited: 5 per hour
     */
    create: superAdminRateLimitedProcedure(RateLimits.ORGANIZATION_CREATE)
        .meta({
            openapi: {
                method: "POST",
                path: "/organizations",
                tags: ["Organizations"],
                summary: "Create organization",
                description: "Creates a new organization with an admin representative. Sends Clerk invitation. Rate limited to 5 per hour.",
                protect: true,
            },
        })
        .input(createOrganizationInputSchema)
        .output(createOrganizationOutputSchema)
        .mutation(async ({ ctx, input }) => {
            return service.createOrganization(input, ctx.logger);
        }),

    /**
     * Update an existing organization
     */
    update: superAdminProcedure
        .meta({
            openapi: {
                method: "PATCH",
                path: "/organizations/{organizationId}",
                tags: ["Organizations"],
                summary: "Update organization",
                description: "Updates an existing organization's information. Supports partial updates.",
                protect: true,
            },
        })
        .input(updateOrganizationInputSchema)
        .output(updateOrganizationOutputSchema)
        .mutation(async ({ ctx, input }) => {
            const { organizationId, ...updateData } = input;
            return service.updateOrganization(organizationId, updateData, ctx.logger);
        }),

    /**
     * Resend invitation to a pending user
     */
    resendInvitation: superAdminRateLimitedProcedure(RateLimits.INVITATION)
        .meta({
            openapi: {
                method: "POST",
                path: "/organizations/resend-invitation",
                tags: ["Organizations"],
                summary: "Resend invitation",
                description: "Resends the Clerk invitation email to a pending user. Rate limited to 10 per hour.",
                protect: true,
            },
        })
        .input(resendInvitationInputSchema)
        .output(resendInvitationOutputSchema)
        .mutation(async ({ ctx, input }) => {
            return service.resendInvitation(input.userId, ctx.logger);
        }),
});
