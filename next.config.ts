import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    basePath: '/admin',
    assetPrefix: '/admin',
    images: {
        // Sử dụng unoptimized để tránh vấn đề với Image Optimization API và basePath
        // Khi có basePath, Next.js Image loader có thể gặp lỗi 400
        unoptimized: true,
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

