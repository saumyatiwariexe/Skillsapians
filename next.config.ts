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

  // API body size: allow larger payloads for code snippets + answers
  experimental: {
    serverComponentsExternalPackages: ["@babel/parser", "@babel/traverse"],
  },
};

export default nextConfig;
