import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
    generateFileKey,
    getUploadUrl,
    getDownloadUrl,
    deleteFile,
    isStorageConfigured,
    validateFile,
    allowedMimeTypes,
    maxFileSizes,
    type FileCategory,
} from "@/server/storage";
import { db } from "@/server/database";

const fileCategorySchema = z.enum(["avatars", "vehicles", "documents", "certifications"]);

export const filesRouter = createTRPCRouter({
    /**
     * Get a presigned URL for uploading a file
     */
    getUploadUrl: protectedProcedure
        .input(
            z.object({
                category: fileCategorySchema,
                entityId: z.string().min(1),
                filename: z.string().min(1),
                contentType: z.string().min(1),
                size: z.number().positive(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (!isStorageConfigured()) {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "File storage is not configured",
                });
            }

            const { category, entityId, filename, contentType, size } = input;

            // Validate file type and size
            const validation = validateFile(category as FileCategory, contentType, size);
            if (!validation.valid) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: validation.error,
                });
            }

            // For avatars, entityId should be the user's own ID
            if (category === "avatars" && entityId !== ctx.user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You can only upload your own avatar",
                });
            }

            // Generate the file key
            const key = generateFileKey(ctx.organizationId, category as FileCategory, entityId, filename);

            // Get presigned upload URL
            const uploadUrl = await getUploadUrl(key, contentType);

            return {
                uploadUrl,
                key,
                expiresIn: 3600,
            };
        }),

    /**
     * Get a presigned URL for downloading/viewing a file
     */
    getDownloadUrl: protectedProcedure
        .input(
            z.object({
                key: z.string().min(1),
            })
        )
        .query(async ({ ctx, input }) => {
            if (!isStorageConfigured()) {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "File storage is not configured",
                });
            }

            const { key } = input;

            // Validate the key belongs to user's organization
            if (!key.startsWith(ctx.organizationId + "/")) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Access denied",
                });
            }

            const downloadUrl = await getDownloadUrl(key);

            return {
                downloadUrl,
                expiresIn: 3600,
            };
        }),

    /**
     * Confirm upload and update database record
     * Called after successful browser upload to presigned URL
     */
    confirmAvatarUpload: protectedProcedure
        .input(
            z.object({
                key: z.string().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { key } = input;

            // Validate the key belongs to user's organization and is an avatar
            if (!key.startsWith(`${ctx.organizationId}/avatars/${ctx.user.id}/`)) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Invalid avatar key",
                });
            }

            // Delete old avatar if exists and is stored in R2
            const currentAvatarUrl = ctx.user.avatarUrl;
            if (currentAvatarUrl && currentAvatarUrl.startsWith(`${ctx.organizationId}/`)) {
                try {
                    await deleteFile(currentAvatarUrl);
                } catch {
                    // Ignore errors deleting old file
                }
            }

            // Update user's avatar URL in database (store the key, not the full URL)
            const updatedUser = await db.user.update({
                where: { id: ctx.user.id },
                data: { avatarUrl: key },
            });

            return {
                success: true,
                avatarKey: key,
                user: {
                    id: updatedUser.id,
                    avatarUrl: updatedUser.avatarUrl,
                },
            };
        }),

    /**
     * Delete a file
     */
    delete: protectedProcedure
        .input(
            z.object({
                key: z.string().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (!isStorageConfigured()) {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "File storage is not configured",
                });
            }

            const { key } = input;

            // Validate the key belongs to user's organization
            if (!key.startsWith(ctx.organizationId + "/")) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Access denied",
                });
            }

            await deleteFile(key);

            return { success: true };
        }),

    /**
     * Get storage configuration status and limits
     */
    getConfig: protectedProcedure.query(() => {
        return {
            configured: isStorageConfigured(),
            limits: {
                avatars: {
                    maxSize: maxFileSizes.avatars,
                    allowedTypes: allowedMimeTypes.avatars,
                },
                vehicles: {
                    maxSize: maxFileSizes.vehicles,
                    allowedTypes: allowedMimeTypes.vehicles,
                },
                documents: {
                    maxSize: maxFileSizes.documents,
                    allowedTypes: allowedMimeTypes.documents,
                },
                certifications: {
                    maxSize: maxFileSizes.certifications,
                    allowedTypes: allowedMimeTypes.certifications,
                },
            },
        };
    }),
});
