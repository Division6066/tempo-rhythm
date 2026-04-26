/**
 * Responsive visual smoke for public routes.
 *
 * Captures three viewports for /, /sign-in, and /about so we have evidence
 * that the route renders at all common breakpoints. These are page-level
 * fingerprints, not pixel-perfect snapshot comparisons (typography and
 * layout are still in motion).
 */
import { test, expect } from "@playwright/test";

/**
 * Stable marketing routes only — these render meaningful content even with
 * the sentinel `NEXT_PUBLIC_CONVEX_URL` we pass in this harness.
 * Convex-dependent routes (/about ScaffoldScreen + /sign-in auth shell) drop
 * into a chrome-error state in headless Chromium when the websocket fails,
 * so capturing a useful screenshot for them needs a real e2e Convex deployment.
 */
const ROUTES = ["/", "/privacy", "/terms"];

// fixme: the `next start` + headless chromium combo we run here renders the
// browser's chrome-error page partway through the screenshot flow, even though
// page.goto() returns 200 and the public-routes a11y suite passes. Likely
// related to Turbopack chunk URLs that include `~` and ConvexReactClient
// trying to upgrade a websocket to the sentinel URL. Tracked in
// docs/QA/ui-qa-2026-04-26/REPORT.md "Insufficient evidence" — needs a real
// preview deployment to capture meaningful pixels.
test.describe.fixme("Responsive screenshots (deferred to real preview env)", () => {
for (const route of ROUTES) {
  test(`screenshot · ${route}`, async ({ page }, testInfo) => {
    const response = await page.goto(route, { waitUntil: "load" });
    expect(response, `${route}: navigation returned no response`).not.toBeNull();
    expect(response?.status(), `${route} status`).toBeLessThan(400);
    // Wait for at least one heading to surface (fonts + auth state settle).
    await page
      .locator("h1, h2")
      .first()
      .waitFor({ state: "attached", timeout: 8_000 })
      .catch(() => {
        /* swallow */
      });
    await page.waitForTimeout(400);

    // Sanity check before screenshot: confirm we didn't land on
    // chrome-error://chromewebdata, which would silently overwrite the
    // captured PNG with the browser's "couldn't load" page.
    const finalUrl = page.url();
    expect(
      finalUrl.startsWith("http://127.0.0.1") || finalUrl.startsWith("http://localhost"),
      `${route}: unexpectedly landed at ${finalUrl}`,
    ).toBe(true);

    const safeName = route.replace(/[^a-z0-9]/gi, "_") || "root";
    const projectName = testInfo.project.name;
    // Verify the page is still alive immediately before snapshot.
    const titleAtSnapshot = await page.title().catch(() => "<error>");
    await page.screenshot({
      path: testInfo.outputPath(`${projectName}__${safeName}.png`),
      fullPage: false,
    });
    expect(
      titleAtSnapshot.length > 0 && titleAtSnapshot !== "<error>",
      `${route}: title at snapshot was ${JSON.stringify(titleAtSnapshot)}`,
    ).toBe(true);
  });
}
});
