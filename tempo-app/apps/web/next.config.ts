import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL || "https://precious-wildcat-890.eu-west-1.convex.cloud",
  },
};

export default nextConfig;
