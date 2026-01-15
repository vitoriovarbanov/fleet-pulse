import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Force dynamic rendering to avoid build-time execution
export const dynamic = "force-dynamic";

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Dynamic import to avoid build-time execution
        const { getOpenApiDocument } = await import("@/server/api/openapi");
        const document = getOpenApiDocument();

        // Log for debugging
        const pathCount = Object.keys(document.paths || {}).length;
        console.log(`[OpenAPI] Generated spec with ${pathCount} paths`);

        return NextResponse.json(document);
    } catch (error) {
        console.error("[OpenAPI] Failed to generate spec:", error);
        return NextResponse.json({
            error: "Failed to generate OpenAPI spec",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
