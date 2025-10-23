import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.backblazeb2.com',
            },
        ],
    },

};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

