// Extend swagger-ui-dist types
declare module "swagger-ui-dist/swagger-ui.css";

declare module "swagger-ui-dist/swagger-ui-bundle" {
    interface SwaggerUIBundleConfig {
        url?: string;
        spec?: object;
        domNode?: HTMLElement;
        presets?: unknown[];
        plugins?: unknown[];
        layout?: string;
        deepLinking?: boolean;
        showExtensions?: boolean;
        showCommonExtensions?: boolean;
        tryItOutEnabled?: boolean;
        supportedSubmitMethods?: string[];
        defaultModelsExpandDepth?: number;
        defaultModelExpandDepth?: number;
        displayRequestDuration?: boolean;
        requestInterceptor?: (request: unknown) => unknown;
    }

    interface SwaggerUIBundleType {
        (config: SwaggerUIBundleConfig): unknown;
        presets: {
            apis: unknown;
        };
        SwaggerUIStandalonePreset: unknown;
    }

    const SwaggerUIBundle: SwaggerUIBundleType;
    export default SwaggerUIBundle;
}
