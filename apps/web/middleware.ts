import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";
import { IS_DEMO_MODE } from "@/lib/demo-mode";

// Public routes (never require auth, even when the backend is wired).
const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/changelog",
  "/sign-in",
  "/sign-up",
  "/onboarding",
  "/terms",
  "/privacy",
  "/contact",
  "/success",
]);

/**
 * @behavior: In demo mode, short-circuit and let every request through so the
 * frontend is fully clickable without a Convex backend. Otherwise fall back to
 * the Convex Auth middleware redirecting private routes to /sign-in.
 * @source: apps/web/lib/demo-mode.ts
 */
const convexMiddleware = convexAuthNextjsMiddleware(
  async (request: NextRequest, ctx) => {
    const { convexAuth } = ctx;

    if (!(isPublicRoute(request) || (await convexAuth.isAuthenticated()))) {
      return nextjsMiddlewareRedirect(request, "/sign-in");
    }
  },
);

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (IS_DEMO_MODE) {
    return NextResponse.next();
  }
  return convexMiddleware(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
