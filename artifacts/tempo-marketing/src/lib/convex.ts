import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string;

if (!convexUrl) {
  console.warn("VITE_CONVEX_URL is not set — Convex Auth will be unavailable");
}

export const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;
