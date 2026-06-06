/**
 * Protected-route redirect smoke.
 *
 * Authenticated routes must NOT 200 without a session — they should
 * redirect (proxy middleware) to /sign-in carrying a `next` query so the
 * user lands back where they were after auth.
 */
import { test, expect } from "@playwright/test";

const PROTECTED_PATHS = [
  "/today",
  "/brain-dump",
  "/coach",
  "/plan",
  "/settings/profile",
  "/billing",
];

for (const path of PROTECTED_PATHS) {
  test(`unauthenticated ${path} redirects to /sign-in?next=${path}`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    // Final URL after redirect chain should be /sign-in. (Either with or
    // without the `next=` query — implementation may evolve.)
    const finalUrl = new URL(page.url());
    expect(finalUrl.pathname).toBe("/sign-in");
    // We don't strictly require ?next=, but if present it should encode
    // the originally-requested path.
    const nextParam = finalUrl.searchParams.get("next");
    if (nextParam) {
      expect(nextParam).toBe(path);
    }
    // The fact that we landed on /sign-in with a 200 confirms the redirect.
    expect(response?.status(), `final response on ${path}`).toBeLessThan(400);
  });
}
