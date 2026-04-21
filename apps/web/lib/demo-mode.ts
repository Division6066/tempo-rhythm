/**
 * Demo-mode detection for Tempo Flow web.
 *
 * Demo mode is on when either:
 *  - NEXT_PUBLIC_DEMO_MODE === "1" | "true", or
 *  - NEXT_PUBLIC_CONVEX_URL is not set (backend not configured).
 *
 * In demo mode:
 *  - The Convex provider tree is NOT mounted, so there is no indefinite
 *    auth loading state.
 *  - Middleware never redirects to /sign-in.
 *  - The /sign-in route shows a friendly "Enter the demo" CTA.
 *  - Every tempo route is reachable without a Convex backend.
 *
 * @behavior: Pure env read; safe on server and client. Next inlines NEXT_PUBLIC_* at build time.
 * @source: docs/design/frontend-backend-handoff-stages.md (Stage 1)
 */

function readDemoFlag(): boolean {
  const flag = process.env.NEXT_PUBLIC_DEMO_MODE;
  if (flag === "1" || flag === "true") {
    return true;
  }
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  return !convexUrl || convexUrl.length === 0;
}

/** Resolved at module load; stable across a Next.js request lifecycle. */
export const IS_DEMO_MODE: boolean = readDemoFlag();

/** Minimal identity placeholder used by demo screens in lieu of a real user. */
export const DEMO_USER = {
  name: "Amit",
  email: "amit@tempo.local",
  tier: "pro" as const,
  coachDial: 6,
  timezone: "Asia/Jerusalem",
} as const;

/** Explicit cookie / storage key if future demo-session flags are needed. */
export const DEMO_STORAGE_KEY = "tempo-flow-demo-session" as const;
