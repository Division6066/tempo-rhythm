import path from "node:path";
import type { NextConfig } from "next";

// Workspace root so Turbopack can resolve the shared convex/ backend
const workspaceRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  turbopack: {
    root: workspaceRoot,
  },
  webpack(config) {
    // Allow webpack to resolve files from the workspace root (shared convex/)
    config.resolve.roots = [workspaceRoot, ...(config.resolve.roots ?? [])];
    return config;
  },
};

export default nextConfig;
