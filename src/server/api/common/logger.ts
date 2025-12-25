/* eslint-disable no-console */
import { env } from "@/env";
import pc from "./pc";

/**
 * Log levels in order of severity
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Structured log entry for JSON output
 */
type LogEntry = {
    timestamp: string;
    level: LogLevel;
    context: string;
    requestId?: string;
    message: string;
    data?: Record<string, unknown>;
    durationMs?: number;
};

/**
 * Patterns for sensitive data that should be redacted
 */
const SENSITIVE_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
    // Email addresses
    { pattern: /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, replacement: "[EMAIL_REDACTED]" },
    // Clerk user IDs
    { pattern: /user_[a-zA-Z0-9]{20,}/g, replacement: "[CLERK_USER_ID]" },
    // Clerk session IDs
    { pattern: /sess_[a-zA-Z0-9]{20,}/g, replacement: "[CLERK_SESSION_ID]" },
    // JWT tokens (basic pattern)
    { pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g, replacement: "[JWT_REDACTED]" },
    // R2/S3 presigned URLs
    { pattern: /X-Amz-Signature=[a-zA-Z0-9]+/g, replacement: "X-Amz-Signature=[REDACTED]" },
    { pattern: /X-Amz-Credential=[^&]+/g, replacement: "X-Amz-Credential=[REDACTED]" },
    // Database connection strings
    { pattern: /postgres(ql)?:\/\/[^@]+@[^\s]+/g, replacement: "[DATABASE_URL_REDACTED]" },
    // Redis URLs
    { pattern: /redis:\/\/[^\s]+/g, replacement: "[REDIS_URL_REDACTED]" },
    // API keys (common patterns)
    { pattern: /sk_[a-zA-Z0-9_-]{20,}/g, replacement: "[SECRET_KEY_REDACTED]" },
    { pattern: /pk_[a-zA-Z0-9_-]{20,}/g, replacement: "[PUBLIC_KEY_REDACTED]" },
    // Phone numbers (basic pattern)
    { pattern: /\+\d{1,3}[\s-]?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/g, replacement: "[PHONE_REDACTED]" },
    // Manual placeholder IDs
    { pattern: /manual_\d+_[a-zA-Z0-9]+/g, replacement: "[MANUAL_ID]" },
];

/**
 * Sensitive field names that should have their values redacted
 */
const SENSITIVE_FIELDS = new Set([
    "password",
    "secret",
    "token",
    "apiKey",
    "api_key",
    "authorization",
    "cookie",
    "session",
    "accessToken",
    "access_token",
    "refreshToken",
    "refresh_token",
    "privateKey",
    "private_key",
    "creditCard",
    "credit_card",
    "ssn",
    "socialSecurity",
]);

/**
 * Redacts sensitive data from a string
 */
function redactString(value: string): string {
    let result = value;
    for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
        result = result.replace(pattern, replacement);
    }
    return result;
}

/**
 * Recursively redacts sensitive data from an object
 */
function redactObject(obj: unknown, depth = 0): unknown {
    // Prevent infinite recursion
    if (depth > 10) return "[MAX_DEPTH_EXCEEDED]";

    if (obj === null || obj === undefined) return obj;

    if (typeof obj === "string") {
        return redactString(obj);
    }

    if (typeof obj === "number" || typeof obj === "boolean") {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => redactObject(item, depth + 1));
    }

    if (typeof obj === "object") {
        const redacted: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
            if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
                redacted[key] = "[REDACTED]";
            } else {
                redacted[key] = redactObject(value, depth + 1);
            }
        }
        return redacted;
    }

    return obj;
}

/**
 * Safely stringify data for logging, with redaction
 */
function safeStringify(data: unknown): string {
    try {
        const redacted = redactObject(data);
        return JSON.stringify(redacted);
    } catch {
        return "[STRINGIFY_ERROR]";
    }
}

/**
 * Generate a short request ID
 */
export function generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `req_${timestamp}_${random}`;
}

/**
 * Format timestamp for pretty console output
 */
function formatTimestamp(): string {
    return new Date().toISOString();
}

/**
 * Format timestamp for pretty console (shorter)
 */
function formatPrettyTimestamp(): string {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

/**
 * Check if we're in production mode
 */
function isProduction(): boolean {
    return env.NODE_ENV === "production";
}

/**
 * Logger class for structured, secure logging
 *
 * Features:
 * - Dual output: Pretty console in dev, JSON in production
 * - Automatic sensitive data redaction
 * - Request ID tracking for tracing
 * - Performance timing support
 */
export class Logger {
    private context: string;
    private requestId?: string;

    constructor(context: string, requestId?: string) {
        this.context = context;
        this.requestId = requestId;
    }

    /**
     * Create a child logger with the same request ID but different context
     */
    child(context: string): Logger {
        return new Logger(context, this.requestId);
    }

    /**
     * Set request ID for this logger instance
     */
    setRequestId(requestId: string): void {
        this.requestId = requestId;
    }

    /**
     * Internal logging method
     */
    private log(
        level: LogLevel,
        message: string,
        data?: Record<string, unknown>,
        durationMs?: number
    ): void {
        // In production, only log warn and error
        if (isProduction() && level !== "warn" && level !== "error") {
            return;
        }

        const entry: LogEntry = {
            timestamp: formatTimestamp(),
            level,
            context: this.context,
            requestId: this.requestId,
            message: redactString(message),
            data: data ? (redactObject(data) as Record<string, unknown>) : undefined,
            durationMs,
        };

        // Remove undefined fields for cleaner output
        if (!entry.requestId) delete entry.requestId;
        if (!entry.data) delete entry.data;
        if (!entry.durationMs) delete entry.durationMs;

        if (isProduction()) {
            // JSON output for production (log aggregation friendly)
            console.log(JSON.stringify(entry));
        } else {
            // Pretty console output for development
            this.prettyLog(level, message, data, durationMs);
        }
    }

    /**
     * Pretty console output for development
     */
    private prettyLog(
        level: LogLevel,
        message: string,
        data?: Record<string, unknown>,
        durationMs?: number
    ): void {
        const colors: Record<LogLevel, (s: string) => string> = {
            debug: pc.gray,
            info: pc.cyan,
            warn: pc.yellow,
            error: pc.red,
        };

        const levelColors: Record<LogLevel, (s: string) => string> = {
            debug: pc.bgBlack,
            info: pc.bgCyan,
            warn: pc.bgYellow,
            error: pc.bgRed,
        };

        const colorFn = colors[level];
        const levelColorFn = levelColors[level];

        const timestamp = pc.gray(formatPrettyTimestamp());
        const levelTag = levelColorFn(pc.bold(` ${level.toUpperCase()} `));
        const contextTag = pc.yellow(`[${this.context}]`);
        const requestIdTag = this.requestId ? pc.gray(`(${this.requestId})`) : "";
        const durationTag = durationMs !== undefined ? pc.magenta(` +${durationMs}ms`) : "";

        const prefix = `${timestamp} ${levelTag} ${contextTag}${requestIdTag}`;
        const formattedMessage = colorFn(redactString(message));

        console.log(`${prefix} ${formattedMessage}${durationTag}`);

        if (data && Object.keys(data).length > 0) {
            const redactedData = redactObject(data);
            console.log(pc.gray(`  └─ ${safeStringify(redactedData)}`));
        }
    }

    /**
     * Debug level - detailed information for debugging
     * Only shown in development
     */
    debug(message: string, data?: Record<string, unknown>): void {
        this.log("debug", message, data);
    }

    /**
     * Info level - general operational information
     * Only shown in development (per user requirement)
     */
    info(message: string, data?: Record<string, unknown>): void {
        this.log("info", message, data);
    }

    /**
     * Warn level - warning conditions
     * Shown in both dev and production
     */
    warn(message: string, data?: Record<string, unknown>): void {
        this.log("warn", message, data);
    }

    /**
     * Error level - error conditions
     * Shown in both dev and production
     */
    error(message: string, data?: Record<string, unknown>): void {
        this.log("error", message, data);
    }

    /**
     * Log with duration - useful for timing operations
     */
    timed(
        level: LogLevel,
        message: string,
        startTime: number,
        data?: Record<string, unknown>
    ): void {
        const durationMs = Date.now() - startTime;
        this.log(level, message, data, durationMs);
    }

    /**
     * Create a timer that logs when stopped
     */
    startTimer(operation: string): () => void {
        const startTime = Date.now();
        return () => {
            this.timed("info", `${operation} completed`, startTime);
        };
    }

    // Static methods for one-off logging without creating an instance

    static debug(context: string, message: string, data?: Record<string, unknown>): void {
        new Logger(context).debug(message, data);
    }

    static info(context: string, message: string, data?: Record<string, unknown>): void {
        new Logger(context).info(message, data);
    }

    static warn(context: string, message: string, data?: Record<string, unknown>): void {
        new Logger(context).warn(message, data);
    }

    static error(context: string, message: string, data?: Record<string, unknown>): void {
        new Logger(context).error(message, data);
    }
}

/**
 * Pre-configured loggers for common contexts
 */
export const loggers = {
    trpc: new Logger("tRPC"),
    auth: new Logger("Auth"),
    db: new Logger("Database"),
    storage: new Logger("Storage"),
    redis: new Logger("Redis"),
};
