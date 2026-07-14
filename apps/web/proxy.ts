import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import type { NextRequest } from "next/server";

const isPlaywrightAuthBypass = process.env.PLAYWRIGHT_BYPASS_AUTH === "1";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in",
  "/sign-up",
  "/terms",
  "/privacy",
  "/contact",
  "/success",
]);

const authMiddleware = convexAuthNextjsMiddleware(
  async (request: NextRequest, ctx) => {
    const { convexAuth } = ctx;
    let isAuthenticated = false;
    try {
      isAuthenticated = await convexAuth.isAuthenticated();
    } catch {
      isAuthenticated = false;
    }

    if (!(isPublicRoute(request) || isAuthenticated)) {
      const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
      const params = new URLSearchParams({ next: nextPath });
      return nextjsMiddlewareRedirect(request, `/sign-in?${params.toString()}`);
    }

    if (isPublicRoute(request) && isAuthenticated) {
      // Optional: redirect signed-in users away from marketing/auth-only routes.
    }
  },
);

function playwrightBypassMiddleware() {
  return undefined;
}

export default isPlaywrightAuthBypass ? playwrightBypassMiddleware : authMiddleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
