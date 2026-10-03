// ============================================================================
// קונפיגורציית CONVEX
// ============================================================================
// ניהול כתובת Convex

export type PublicEnv = {
  readonly [key: string]: string | undefined;
};

/**
 * Read the public Convex URL without throwing.
 * Expo web export and CI builds often have no `.env`; callers should render
 * a missing-config state instead of crashing at module load.
 */
export function readPublicConvexUrl(
  env: PublicEnv = process.env,
): string | null {
  const convexUrl = env.EXPO_PUBLIC_CONVEX_URL;
  if (typeof convexUrl !== 'string') {
    return null;
  }
  const trimmed = convexUrl.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * קבלת כתובת Convex
 * הכתובת נלקחת ממשתנה הסביבה EXPO_PUBLIC_CONVEX_URL
 *
 * הפרדה בין Dev ל-Production מתבצעת ברמת ה-Deployment:
 * - פיתוח מקומי: `bunx convex dev` (משתמש ב-dev deployment)
 * - ייצור: `bunx convex deploy` (משתמש ב-prod deployment)
 */
export function getConvexUrl(env: PublicEnv = process.env): string {
  const convexUrl = readPublicConvexUrl(env);

  if (!convexUrl) {
    throw new Error('חסרה כתובת Convex. הגדר EXPO_PUBLIC_CONVEX_URL ב-.env');
  }

  return convexUrl;
}
