import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import type { NextRequest } from "next/server";

// הגדרת נתיבים ציבוריים (שלא דורשים אימות)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in",
  "/sign-up",
  "/terms",
  "/privacy",
  "/contact",
  "/success",
]);

// Middleware לבדיקת אימות והפניות
export default convexAuthNextjsMiddleware(async (request: NextRequest, ctx) => {
  const { convexAuth } = ctx;
  const isAuthenticated = await (async () => {
    try {
      return await convexAuth.isAuthenticated();
    } catch {
      return Boolean(await convexAuth.getToken());
    }
  })();

  // אם הנתיב אינו ציבורי והמשתמש לא מחובר -> הפניה לדף התחברות
  if (!(isPublicRoute(request) || isAuthenticated)) {
    return nextjsMiddlewareRedirect(request, "/sign-in");
  }

  // אופציונלי: הפניה של משתמשים מחוברים מדפי אימות
  if (isPublicRoute(request) && isAuthenticated) {
    // return nextjsMiddlewareRedirect(request, "/");
  }
});

export const config = {
  // הגדרת ה-Matcher כדי שה-Middleware ירוץ על כל הנתיבים הרלוונטיים
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
