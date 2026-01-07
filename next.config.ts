import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    basePath: '/admin',
    assetPrefix: '/admin',
    images: {
        remotePatterns: [
            // Cho phép HTTP (local development và Docker)
            {
                protocol: 'http',
                hostname: '**',
            },
            // Cho phép HTTPS (production)
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

