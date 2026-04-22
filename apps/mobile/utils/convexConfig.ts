// ============================================================================
// קונפיגורציית CONVEX
// ============================================================================
// ניהול כתובת Convex

/**
 * קבלת כתובת Convex
 * הכתובת נלקחת ממשתנה הסביבה EXPO_PUBLIC_CONVEX_URL
 *
 * הפרדה בין Dev ל-Production מתבצעת ברמת ה-Deployment:
 * - פיתוח מקומי: `bunx convex dev` (משתמש ב-dev deployment)
 * - ייצור: `bunx convex deploy` (משתמש ב-prod deployment)
 */
export function getConvexUrl(): string {
  const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error(
      [
        'Missing Convex URL for mobile.',
        'Set EXPO_PUBLIC_CONVEX_URL in apps/mobile/.env.',
        'Copy apps/mobile/.env.example to apps/mobile/.env and fill the Convex value.',
        'Metro can start without this variable, but the app cannot talk to the shared Convex backend until it is set.',
      ].join(' '),
    );
  }

  return convexUrl;
}
