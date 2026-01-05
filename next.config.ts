import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    basePath: '/admin',
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

