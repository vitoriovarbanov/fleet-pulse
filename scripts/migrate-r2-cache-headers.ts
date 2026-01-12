/**
 * Migration script to add Cache-Control headers to existing R2 objects.
 *
 * This uses CopyObject to copy each file to itself with the new metadata,
 * which is the standard way to update S3/R2 object metadata without re-uploading.
 *
 * Run with: npx tsx scripts/migrate-r2-cache-headers.ts
 */

import {
    S3Client,
    ListObjectsV2Command,
    CopyObjectCommand,
    HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { config } from "dotenv";

// Load environment variables from .env.development or .env.production
config({ path: ".env.development" });
config({ path: ".env.production" });

// Configuration
const CACHE_CONTROL = "public, max-age=31536000, immutable";
const DRY_RUN = process.argv.includes("--dry-run");

// Validate environment
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ACCOUNT_ID || !R2_BUCKET_NAME) {
    console.error("❌ Missing R2 environment variables. Required:");
    console.error("   - R2_ACCESS_KEY_ID");
    console.error("   - R2_SECRET_ACCESS_KEY");
    console.error("   - R2_ACCOUNT_ID");
    console.error("   - R2_BUCKET_NAME");
    process.exit(1);
}

// Create R2 client
const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

async function getObjectMetadata(key: string) {
    const command = new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });
    return r2Client.send(command);
}

async function updateObjectCacheControl(key: string, contentType: string) {
    const command = new CopyObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        CopySource: `${R2_BUCKET_NAME}/${encodeURIComponent(key)}`,
        ContentType: contentType,
        CacheControl: CACHE_CONTROL,
        MetadataDirective: "REPLACE", // Required to update metadata
    });
    return r2Client.send(command);
}

async function listAllObjects(): Promise<string[]> {
    const keys: string[] = [];
    let continuationToken: string | undefined;

    do {
        const command = new ListObjectsV2Command({
            Bucket: R2_BUCKET_NAME,
            ContinuationToken: continuationToken,
        });

        const response = await r2Client.send(command);

        if (response.Contents) {
            for (const obj of response.Contents) {
                if (obj.Key) {
                    keys.push(obj.Key);
                }
            }
        }

        continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return keys;
}

async function main() {
    console.log("🚀 R2 Cache-Control Migration Script");
    console.log(`   Bucket: ${R2_BUCKET_NAME}`);
    console.log(`   Cache-Control: ${CACHE_CONTROL}`);
    console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no changes)" : "LIVE"}`);
    console.log("");

    // List all objects
    console.log("📋 Listing objects...");
    const keys = await listAllObjects();
    console.log(`   Found ${keys.length} objects\n`);

    if (keys.length === 0) {
        console.log("✅ No objects to migrate.");
        return;
    }

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const key of keys) {
        try {
            // Get current metadata
            const metadata = await getObjectMetadata(key);
            const currentCacheControl = metadata.CacheControl;
            const contentType = metadata.ContentType ?? "application/octet-stream";

            // Check if already has correct Cache-Control
            if (currentCacheControl === CACHE_CONTROL) {
                console.log(`⏭️  Skip: ${key} (already has correct Cache-Control)`);
                skipped++;
                continue;
            }

            if (DRY_RUN) {
                console.log(`🔍 Would update: ${key}`);
                console.log(`   Current: ${currentCacheControl ?? "(none)"}`);
                console.log(`   New: ${CACHE_CONTROL}`);
                updated++;
            } else {
                // Update the object
                await updateObjectCacheControl(key, contentType);
                console.log(`✅ Updated: ${key}`);
                updated++;
            }
        } catch (error) {
            console.error(`❌ Failed: ${key}`, error);
            failed++;
        }
    }

    console.log("\n📊 Summary:");
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);

    if (DRY_RUN && updated > 0) {
        console.log("\n💡 Run without --dry-run to apply changes:");
        console.log("   npx tsx scripts/migrate-r2-cache-headers.ts");
    }
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
