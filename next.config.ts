import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images from GitHub avatars, etc.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
    ],
  },

  // Next.js 15+: moved out of experimental
  // Tells Next not to bundle these server-side Node packages
  serverExternalPackages: ["@babel/parser", "@babel/traverse"],
};

export default nextConfig;
