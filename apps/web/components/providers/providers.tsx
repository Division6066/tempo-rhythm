"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import type React from "react";

const fallbackConvexUrl = "http://127.0.0.1:3210";
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? fallbackConvexUrl;
const convex = new ConvexReactClient(convexUrl);

interface ProvidersProps {
  children: React.ReactNode;
}

// רכיב ספקים (Providers) העוטף את האפליקציה
// מספק את הקונטקסט של Convex Auth לכל הרכיבים בתוך האפליקציה
export function Providers({ children }: ProvidersProps) {
  return <ConvexAuthNextjsProvider client={convex}>{children}</ConvexAuthNextjsProvider>;
}
