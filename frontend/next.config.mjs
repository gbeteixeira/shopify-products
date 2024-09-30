/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // domains: ["cdn.shopify.com"],
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'cdn.shopify.com',
            pathname: '/s/files/**',
          },
        ],
    },
};

export default nextConfig;
