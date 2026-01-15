import { z } from "zod";
import { createTRPCRouter, protectedProcedure, protectedRateLimitedProcedure } from "@/server/api/trpc";
import { RateLimits } from "@/server/api/common/middlewares/rate-limit.middleware";
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

// Input schemas
const fileCategorySchema = z.enum(["avatars", "vehicles", "documents", "certifications"]);

const getUploadUrlInputSchema = z.object({
    category: fileCategorySchema,
    entityId: z.string().min(1),
    filename: z.string().min(1),
    contentType: z.string().min(1),
    size: z.number().positive(),
});

const fileKeyInputSchema = z.object({
    key: z.string().min(1),
});

// Output schemas
const getUploadUrlOutputSchema = z.object({
    uploadUrl: z.string(),
    key: z.string(),
    expiresIn: z.number(),
});

const getDownloadUrlOutputSchema = z.object({
    downloadUrl: z.string(),
    expiresIn: z.number(),
});

const confirmAvatarUploadOutputSchema = z.object({
    success: z.boolean(),
    avatarKey: z.string(),
    user: z.object({
        id: z.string(),
        avatarUrl: z.string().nullable(),
    }),
});

const deleteFileOutputSchema = z.object({
    success: z.boolean(),
});

const fileLimitsSchema = z.object({
    maxSize: z.number(),
    allowedTypes: z.array(z.string()),
});

const getConfigOutputSchema = z.object({
    configured: z.boolean(),
    limits: z.object({
        avatars: fileLimitsSchema,
        vehicles: fileLimitsSchema,
        documents: fileLimitsSchema,
        certifications: fileLimitsSchema,
    }),
});

export const filesRouter = createTRPCRouter({
    /**
     * Get a presigned URL for uploading a file
     * Rate limited: 20 per hour
     */
    getUploadUrl: protectedRateLimitedProcedure(RateLimits.FILE_UPLOAD)
        .meta({
            openapi: {
                method: "POST",
                path: "/files/upload-url",
                tags: ["Files"],
                summary: "Get upload URL",
                description: "Returns a presigned URL for uploading a file. Rate limited to 20 per hour.",
                protect: true,
            },
        })
        .input(getUploadUrlInputSchema)
        .output(getUploadUrlOutputSchema)
        .mutation(async ({ ctx, input }) => {
            const log = ctx.logger.child("FilesRouter");

            if (!isStorageConfigured()) {
                log.warn("Storage not configured");
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "File storage is not configured",
                });
            }

            const { category, entityId, filename, contentType, size } = input;

            // Validate file type and size
            const validation = validateFile(category as FileCategory, contentType, size);
            if (!validation.valid) {
                log.warn("File validation failed", { category, contentType, size });
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: validation.error,
                });
            }

            // For avatars, entityId should be the user's own ID
            if (category === "avatars" && entityId !== ctx.user.id) {
                log.warn("Avatar upload forbidden - wrong user");
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You can only upload your own avatar",
                });
            }

            // Generate the file key
            const key = generateFileKey(ctx.organizationId, category as FileCategory, entityId, filename);

            // Get presigned upload URL
            const uploadUrl = await getUploadUrl(key, contentType);

            log.info("Upload URL generated", { category, entityId });

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
        .meta({
            openapi: {
                method: "GET",
                path: "/files/download-url",
                tags: ["Files"],
                summary: "Get download URL",
                description: "Returns a presigned URL for downloading/viewing a file",
                protect: true,
            },
        })
        .input(fileKeyInputSchema)
        .output(getDownloadUrlOutputSchema)
        .query(async ({ ctx, input }) => {
            const log = ctx.logger.child("FilesRouter");

            if (!isStorageConfigured()) {
                log.warn("Storage not configured");
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "File storage is not configured",
                });
            }

            const { key } = input;

            // Validate the key belongs to user's organization
            if (!key.startsWith(ctx.organizationId + "/")) {
                log.warn("Download access denied - wrong organization");
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Access denied",
                });
            }

            const downloadUrl = await getDownloadUrl(key);

            log.debug("Download URL generated");

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
        .meta({
            openapi: {
                method: "POST",
                path: "/files/confirm-avatar",
                tags: ["Files"],
                summary: "Confirm avatar upload",
                description: "Confirms avatar upload and updates the user's avatar URL in the database",
                protect: true,
            },
        })
        .input(fileKeyInputSchema)
        .output(confirmAvatarUploadOutputSchema)
        .mutation(async ({ ctx, input }) => {
            const log = ctx.logger.child("FilesRouter");
            const { key } = input;

            // Validate the key belongs to user's organization and is an avatar
            if (!key.startsWith(`${ctx.organizationId}/avatars/${ctx.user.id}/`)) {
                log.warn("Avatar confirmation forbidden - invalid key");
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
                    log.info("Old avatar deleted");
                } catch {
                    log.warn("Failed to delete old avatar");
                }
            }

            // Update user's avatar URL in database (store the key, not the full URL)
            const updatedUser = await db.user.update({
                where: { id: ctx.user.id },
                data: { avatarUrl: key },
            });

            log.info("Avatar updated", { userId: updatedUser.id });

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
        .meta({
            openapi: {
                method: "DELETE",
                path: "/files",
                tags: ["Files"],
                summary: "Delete file",
                description: "Deletes a file from storage by its key",
                protect: true,
            },
        })
        .input(fileKeyInputSchema)
        .output(deleteFileOutputSchema)
        .mutation(async ({ ctx, input }) => {
            const log = ctx.logger.child("FilesRouter");

            if (!isStorageConfigured()) {
                log.warn("Storage not configured");
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "File storage is not configured",
                });
            }

            const { key } = input;

            // Validate the key belongs to user's organization
            if (!key.startsWith(ctx.organizationId + "/")) {
                log.warn("Delete access denied - wrong organization");
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Access denied",
                });
            }

            await deleteFile(key);

            log.info("File deleted");

            return { success: true };
        }),

    /**
     * Get storage configuration status and limits
     */
    getConfig: protectedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/files/config",
                tags: ["Files"],
                summary: "Get storage config",
                description: "Returns storage configuration status and file size/type limits",
                protect: true,
            },
        })
        .input(z.void())
        .output(getConfigOutputSchema)
        .query(({ ctx }) => {
            ctx.logger.child("FilesRouter").debug("Config requested");

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
