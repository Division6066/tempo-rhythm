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

  // Fail-open for frontend-only demos when env vars aren't configured.
  // This mirrors the web preview fallback and keeps UI navigation usable.
  return convexUrl ?? 'http://127.0.0.1:3210';
}
