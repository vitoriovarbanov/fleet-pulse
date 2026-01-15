"use client";

import { useEffect, useRef, useState } from "react";
import "swagger-ui-dist/swagger-ui.css";

export default function DocsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initSwagger = async () => {
            try {
                // Dynamically import swagger-ui-dist
                const SwaggerUIBundle = (await import("swagger-ui-dist/swagger-ui-bundle")).default;

                if (!mounted || !containerRef.current) return;

                // Initialize Swagger UI
                SwaggerUIBundle({
                    url: "/api/docs/spec",
                    domNode: containerRef.current,
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIBundle.SwaggerUIStandalonePreset,
                    ],
                    layout: "BaseLayout",
                    deepLinking: true,
                    showExtensions: true,
                    showCommonExtensions: true,
                    tryItOutEnabled: true, // Enable "Try it out" by default
                    supportedSubmitMethods: ["get", "post", "put", "delete", "patch"], // Enable all methods
                    displayRequestDuration: true, // Show request duration
                    defaultModelsExpandDepth: 1, // Expand models by default
                    defaultModelExpandDepth: 2, // Expand model properties
                });

                setIsLoading(false);
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : "Failed to load Swagger UI");
                    setIsLoading(false);
                }
            }
        };

        initSwagger();

        return () => {
            mounted = false;
        };
    }, []);

    if (error) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Error</h1>
                    <p className="mt-2 text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="swagger-wrapper">
            {isLoading && (
                <div className="flex h-full items-center justify-center py-20">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading API documentation...</p>
                    </div>
                </div>
            )}
            <div ref={containerRef} />
            <style jsx global>{`
                .swagger-wrapper {
                    background: white;
                    min-height: 100vh;
                }
                .swagger-ui .topbar {
                    display: none;
                }
                .swagger-ui .info {
                    margin: 20px 0;
                }
                /* Hide authorize button - users are already authenticated */
                .swagger-ui .auth-wrapper,
                .swagger-ui .authorize {
                    display: none !important;
                }
                /* Better styling for request body */
                .swagger-ui .body-param textarea {
                    min-height: 150px;
                }
            `}</style>
        </div>
    );
}
