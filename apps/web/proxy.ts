import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in",
  "/sign-up",
  "/terms",
  "/privacy",
  "/contact",
  "/success",
]);

const isE2ePlaceholderRoute = createRouteMatcher([
  "/brain-dump",
  "/coach",
  "/plan",
  "/tasks",
  "/notes",
  "/journal",
  "/calendar",
  "/habits",
  "/routines",
  "/templates",
  "/settings/profile",
  "/onboarding",
]);

export default convexAuthNextjsMiddleware(async (request: NextRequest, ctx) => {
  const { convexAuth } = ctx;
  const isPlaywrightE2e = process.env.PLAYWRIGHT_E2E === "1";
  let isAuthenticated = false;
  try {
    isAuthenticated = await convexAuth.isAuthenticated();
  } catch {
    isAuthenticated = false;
  }

  if (
    !(
      isPublicRoute(request) ||
      isAuthenticated ||
      (isPlaywrightE2e && isE2ePlaceholderRoute(request))
    )
  ) {
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    const params = new URLSearchParams({ next: nextPath });
    return nextjsMiddlewareRedirect(request, `/sign-in?${params.toString()}`);
  }

  if (isPublicRoute(request) && isAuthenticated) {
    // Optional: redirect signed-in users away from marketing/auth-only routes.
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
