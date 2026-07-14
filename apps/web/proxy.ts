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
  const isCalendarE2EBypass =
    process.env.NODE_ENV !== "production" &&
    process.env.TEMPO_E2E_PUBLIC_CALENDAR === "1" &&
    request.nextUrl.pathname === "/calendar";
  let isAuthenticated = false;
  try {
    isAuthenticated = await convexAuth.isAuthenticated();
  } catch {
    isAuthenticated = false;
  }

  if (!(isPublicRoute(request) || isCalendarE2EBypass || isAuthenticated)) {
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
