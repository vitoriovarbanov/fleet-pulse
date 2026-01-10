import type { NextConfig } from 'next';

// Validate env vars at build time
import './src/env';

const nextConfig: NextConfig = {
    // Enable standalone output for Docker deployment
    output: 'standalone',

    // Prevent 307 redirects for webhooks (trailing slash issues)
    skipTrailingSlashRedirect: true,
};

export default nextConfig;
