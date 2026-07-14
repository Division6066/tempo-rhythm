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
const DEFAULT_CONVEX_URL = 'https://precious-wildcat-890.eu-west-1.convex.cloud';

export function getConvexUrl(): string {
  const convexUrl =
    process.env.EXPO_PUBLIC_CONVEX_URL ||
    process.env.NEXT_PUBLIC_CONVEX_URL ||
    DEFAULT_CONVEX_URL;

  return convexUrl;
}
