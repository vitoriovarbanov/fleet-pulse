import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";
import { redis } from "@/server/redis";

/**
 * Cloudflare R2 Storage Client
 * S3-compatible object storage for file uploads
 *
 * Cost optimization:
 * - Class A operations (PUT, DELETE): $4.50/million
 * - Class B operations (GET): $0.36/million
 * - We cache presigned URLs in Redis to reduce repeated URL generation
 * - Browser caching (via TanStack Query staleTime) reduces actual R2 GET operations
 */

const isR2Configured = !!(
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_ACCOUNT_ID &&
    env.R2_BUCKET_NAME
);

const r2Client = isR2Configured
    ? new S3Client({
          region: "auto",
          endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: {
              accessKeyId: env.R2_ACCESS_KEY_ID!,
              secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
          },
      })
    : null;

/**
 * Cache key prefix for presigned URLs
 */
const DOWNLOAD_URL_CACHE_PREFIX = "r2:download:";
const CACHE_TTL_SECONDS = 3300; // 55 minutes (URL valid for 1 hour, cache slightly less)

/**
 * File categories for organizing uploads
 */
export type FileCategory = "avatars" | "vehicles" | "documents" | "certifications";

/**
 * Generates the storage key (path) for a file
 */
export function generateFileKey(
    organizationId: string,
    category: FileCategory,
    entityId: string,
    filename: string
): string {
    // Sanitize filename
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${sanitizedFilename}`;

    return `${organizationId}/${category}/${entityId}/${uniqueFilename}`;
}

/**
 * Generates a presigned URL for uploading a file directly from the browser
 * Upload URLs are NOT cached (each upload needs a fresh URL)
 */
export async function getUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600 // 1 hour default
): Promise<string> {
    if (!r2Client) {
        throw new Error("R2 storage is not configured");
    }

    const command = new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Generates a presigned URL for downloading/viewing a file
 * Uses Redis cache to avoid regenerating URLs for the same file
 */
export async function getDownloadUrl(
    key: string,
    expiresIn: number = 3600 // 1 hour default
): Promise<string> {
    if (!r2Client) {
        throw new Error("R2 storage is not configured");
    }

    const cacheKey = `${DOWNLOAD_URL_CACHE_PREFIX}${key}`;

    // Try to get cached URL
    try {
        const cachedUrl = await redis.get(cacheKey);
        if (cachedUrl) {
            return cachedUrl;
        }
    } catch (error) {
        // If Redis fails, continue to generate URL
        console.warn("[Storage] Redis cache read failed:", error);
    }

    // Generate new presigned URL
    const command = new GetObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
    });

    const url = await getSignedUrl(r2Client, command, { expiresIn });

    // Cache the URL (fire and forget, don't block on cache write)
    redis.setex(cacheKey, CACHE_TTL_SECONDS, url).catch((error) => {
        console.warn("[Storage] Redis cache write failed:", error);
    });

    return url;
}

/**
 * Deletes a file from storage and invalidates its cached URL
 */
export async function deleteFile(key: string): Promise<void> {
    if (!r2Client) {
        throw new Error("R2 storage is not configured");
    }

    const command = new DeleteObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
    });

    await r2Client.send(command);

    // Invalidate cached URL
    const cacheKey = `${DOWNLOAD_URL_CACHE_PREFIX}${key}`;
    redis.del(cacheKey).catch((error) => {
        console.warn("[Storage] Redis cache invalidation failed:", error);
    });
}

/**
 * Invalidate cached download URL (call when file is updated/replaced)
 */
export async function invalidateDownloadUrlCache(key: string): Promise<void> {
    const cacheKey = `${DOWNLOAD_URL_CACHE_PREFIX}${key}`;
    await redis.del(cacheKey);
}

/**
 * Check if R2 storage is configured
 */
export function isStorageConfigured(): boolean {
    return isR2Configured;
}

/**
 * Allowed MIME types for different categories
 */
export const allowedMimeTypes: Record<FileCategory, string[]> = {
    avatars: ["image/jpeg", "image/png", "image/webp"],
    vehicles: ["image/jpeg", "image/png", "image/webp"],
    documents: ["application/pdf", "image/jpeg", "image/png"],
    certifications: ["application/pdf", "image/jpeg", "image/png"],
};

/**
 * Max file sizes in bytes for different categories
 */
export const maxFileSizes: Record<FileCategory, number> = {
    avatars: 5 * 1024 * 1024, // 5 MB
    vehicles: 10 * 1024 * 1024, // 10 MB
    documents: 20 * 1024 * 1024, // 20 MB
    certifications: 20 * 1024 * 1024, // 20 MB
};

/**
 * Validates file type and size for a category
 */
export function validateFile(
    category: FileCategory,
    contentType: string,
    size: number
): { valid: boolean; error?: string } {
    const allowedTypes = allowedMimeTypes[category];
    const maxSize = maxFileSizes[category];

    if (!allowedTypes.includes(contentType)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}`,
        };
    }

    if (size > maxSize) {
        return {
            valid: false,
            error: `File too large. Maximum size: ${maxSize / 1024 / 1024} MB`,
        };
    }

    return { valid: true };
}
