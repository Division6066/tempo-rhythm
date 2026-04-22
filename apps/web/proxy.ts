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

export default convexAuthNextjsMiddleware(async (request: NextRequest, ctx) => {
  const { convexAuth } = ctx;
  let isAuthenticated = false;
  try {
    isAuthenticated = await convexAuth.isAuthenticated();
  } catch {
    isAuthenticated = false;
  }

  if (!(isPublicRoute(request) || isAuthenticated)) {
    return nextjsMiddlewareRedirect(request, "/sign-in");
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
