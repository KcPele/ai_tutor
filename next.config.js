/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    // Add support for PDF.js
    if (!isServer) {
      // Ensure proper fallbacks for node modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
  // Configure allowed image domains
  images: {
    domains: ["images.unsplash.com"],
  },
  // Add any other Next.js config options here
};

module.exports = nextConfig;
