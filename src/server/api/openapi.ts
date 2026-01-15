import { generateOpenApiDocument } from "trpc-to-openapi";
import { appRouter } from "./root";

// Cache the document - only generate once per process to avoid Zod v4 registry conflicts
let cachedDocument: ReturnType<typeof generateOpenApiDocument> | null = null;
let generationAttempted = false;

export const getOpenApiDocument = () => {
    // Return cached document if available
    if (cachedDocument) {
        return cachedDocument;
    }

    // If we already tried and failed, don't retry (avoids repeated registry errors)
    if (generationAttempted) {
        throw new Error("OpenAPI document generation previously failed");
    }

    generationAttempted = true;
    console.log("[OpenAPI] Generating OpenAPI document...");

    // Generate OpenAPI document
    // Note: With Zod v4, this can only be called once per process due to global registry
    cachedDocument = generateOpenApiDocument(appRouter, {
        title: "Fleet Pulse API",
        version: "1.0.0",
        baseUrl: "/api/openapi",
        description: "Fleet management API documentation for Fleet Pulse",
        tags: ["Health", "Auth", "Drivers", "Files", "Vehicles"],
    });

    console.log("[OpenAPI] Document generated, paths:", Object.keys(cachedDocument.paths || {}));

    return cachedDocument;
};
