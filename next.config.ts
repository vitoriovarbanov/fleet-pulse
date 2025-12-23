import type { NextConfig } from 'next';

// Validate env vars at build time
import './src/env';

const nextConfig: NextConfig = {
    // Removed output: 'export' to enable API routes for tRPC

    // Prevent 307 redirects for webhooks (trailing slash issues)
    skipTrailingSlashRedirect: true,
};

export default nextConfig;
