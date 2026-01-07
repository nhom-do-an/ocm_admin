import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    basePath: '/admin',
    assetPrefix: '/admin', // Add this to ensure all assets use /admin prefix
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*',
            },
        ],
    },

};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

