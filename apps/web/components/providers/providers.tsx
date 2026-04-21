"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import type React from "react";
import { IS_DEMO_MODE } from "@/lib/demo-mode";

const fallbackConvexUrl = "http://127.0.0.1:3210";
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? fallbackConvexUrl;

/**
 * @behavior: In demo mode, skip mounting the Convex provider so the app does
 * not try to connect to a backend that isn't running (which otherwise produces
 * an indefinite auth-loading state). In non-demo mode, mount the real Convex
 * Auth Next.js provider.
 * @source: apps/web/lib/demo-mode.ts
 */
const convex: ConvexReactClient | null = IS_DEMO_MODE
  ? null
  : new ConvexReactClient(convexUrl);

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  if (IS_DEMO_MODE || !convex) {
    return <>{children}</>;
  }
  return <ConvexAuthNextjsProvider client={convex}>{children}</ConvexAuthNextjsProvider>;
}
