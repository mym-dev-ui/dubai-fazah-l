import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  ...(process.env.REPLIT_DEV_DOMAIN
    ? {
        allowedDevOrigins: [
          "localhost:5000",
          "127.0.0.1:5000",
          "*.replit.dev",
          "*.sisko.replit.dev",
          "*.repl.co",
          "*.replit.app",
          process.env.REPLIT_DEV_DOMAIN,
        ],
      }
    : {}),
};

export default nextConfig;
