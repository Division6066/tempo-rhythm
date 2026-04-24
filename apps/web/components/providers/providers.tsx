"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import type React from "react";

function requireConvexDeploymentUrl(): string {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_CONVEX_URL. Add your deployment URL from the Convex dashboard to apps/web/.env.local.",
    );
  }
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    throw new Error(`NEXT_PUBLIC_CONVEX_URL is not a valid URL: ${url}`);
  }
  const labels = host.split(".");
  // Regional deployments look like: <name>.<region>.convex.cloud
  // Legacy hosts omit <region> and can make /api/action return an empty 404 body, which surfaces as blank auth errors.
  if (labels.at(-2) === "convex" && labels.at(-1) === "cloud" && labels.length < 4) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL uses a legacy Convex hostname (missing the region label before .convex.cloud). " +
        "Copy the full deployment URL from the Convex dashboard (Settings → URL & Deploy Key), update apps/web/.env.local, then restart `next dev`.",
    );
  }
  return url;
}

// אתחול לקוח Convex עם כתובת השרת
const convex = new ConvexReactClient(requireConvexDeploymentUrl());

interface ProvidersProps {
  children: React.ReactNode;
}

// רכיב ספקים (Providers) העוטף את האפליקציה
// מספק את הקונטקסט של Convex Auth לכל הרכיבים בתוך האפליקציה
export function Providers({ children }: ProvidersProps) {
  return <ConvexAuthNextjsProvider client={convex}>{children}</ConvexAuthNextjsProvider>;
}
