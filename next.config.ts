import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.greedyadventures.com",
      },
      {
        protocol: "https",
        hostname: "greedyadventures.com",
      },
      {
        protocol: "https",
        hostname: "pub-89f493a2b50b4e43b99552a737bef138.r2.dev",
      },
    ],
  },
};

export default nextConfig;
