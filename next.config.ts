import type { NextConfig } from 'next';

// Validate env vars at build time
import './src/env';

/**
 * Security headers for all routes
 * @see https://nextjs.org/docs/pages/api-reference/next-config-js/headers
 */
const securityHeaders = [
    {
        key: 'X-Frame-Options',
        value: 'DENY',
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
    },
    {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
    },
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
    },
    {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
    },
    {
        key: 'Content-Security-Policy',
        value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://clerk.fleetpulse.space https://accounts.fleetpulse.space https://challenges.cloudflare.com", // Required for Next.js + Clerk + Turnstile
            "style-src 'self' 'unsafe-inline'", // Required for Tailwind
            "img-src 'self' blob: data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://api.clerk.dev https://*.clerk.accounts.dev https://clerk.fleetpulse.space https://accounts.fleetpulse.space https://api.clerk.com https://api.maptiler.com",
            "worker-src 'self' blob:", // Required for Clerk
            "frame-src 'self' https://challenges.cloudflare.com", // Required for Turnstile
            "frame-ancestors 'none'",
            "form-action 'self'",
            "base-uri 'self'",
        ].join('; '),
    },
];

const nextConfig: NextConfig = {
    // Enable standalone output for Docker deployment
    output: 'standalone',

    // Prevent 307 redirects for webhooks (trailing slash issues)
    skipTrailingSlashRedirect: true,

    // Security headers for all routes
    async headers() {
        return [
            {
                source: '/:path*',
                headers: securityHeaders,
            },
        ];
    },
};

export default nextConfig;
