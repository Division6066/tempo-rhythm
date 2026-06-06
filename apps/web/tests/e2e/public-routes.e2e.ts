/**
 * Public-route smoke tests.
 *
 * These hit pages that should render without authentication and verify:
 *   - HTTP 200 on the canonical URL
 *   - heading is present (h1)
 *   - no console errors during load
 *   - basic accessibility: every <button> has an accessible name,
 *     every <input> has an accessible name, no positive tabindex.
 */
import { test, expect, type Page } from "@playwright/test";

/**
 * Static marketing routes that render server-side and don't depend on Convex
 * connectivity to display useful content. These are stable in headless
 * Chromium even with a fake NEXT_PUBLIC_CONVEX_URL.
 */
const PUBLIC_PATHS = ["/", "/privacy", "/terms"];

/**
 * Routes that only render after the Convex client resolves auth state.
 * In this harness we point Convex at a sentinel URL, so they may stay on a
 * loading shell or, in some headless Chromium builds, fail to render at all.
 * Treated as `test.fixme` so the regression remains visible without blocking
 * the suite — see docs/QA/ui-qa-2026-04-26/REPORT.md "Insufficient evidence".
 */
const FIXME_PATHS = ["/about", "/sign-in"];

async function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
  });
  return errors;
}

for (const path of PUBLIC_PATHS) {
  test.describe(`public route ${path}`, () => {
    test("renders a heading with no console errors", async ({ page }) => {
      const errors = await collectConsoleErrors(page);
      const response = await page.goto(path, { waitUntil: "load" });
      expect(response?.status(), `${path}: expected 200`).toBeLessThan(400);
      // Sanity: confirm we actually rendered the Tempo app, not the browser's
      // chrome-error page. The chrome-error page also contains an h1, so the
      // heading-count check below would falsely pass without this guard.
      const title = await page.title();
      expect(
        title,
        `${path}: expected non-empty <title>; got ${JSON.stringify(title)}`,
      ).not.toBe("");
      expect(
        title.toLowerCase().includes("tempo") || title.toLowerCase().includes("flow"),
        `${path}: expected Tempo title, got ${JSON.stringify(title)}`,
      ).toBe(true);
      // Wait for at least one h1 or h2 to appear. Auth pages render a loading
      // spinner first, then swap in the h1 once Convex auth resolves to
      // "not authenticated" — give them a moment.
      await page
        .locator("h1, h2")
        .first()
        .waitFor({ state: "attached", timeout: 8_000 })
        .catch(() => {
          /* swallow; assert below for nicer message */
        });
      const headings = await page.locator("h1, h2").count();
      expect(headings, `${path}: expected at least one heading`).toBeGreaterThan(0);
      // Filter out hydration/dev noise and Convex websocket failures (we
      // intentionally point at a fake URL).
      const meaningful = errors.filter(
        (e) =>
          !/Hydration failed because/i.test(e) &&
          !/An error occurred during hydration/i.test(e) &&
          !/WebSocket connection.*failed/i.test(e) &&
          !/convex/i.test(e),
      );
      expect(meaningful, `${path} console:\n${meaningful.join("\n")}`).toEqual([]);
    });

    test("has no <button> without an accessible name", async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const offending = await page.evaluate(() => {
        const out: string[] = [];
        for (const b of Array.from(document.querySelectorAll("button"))) {
          const name =
            b.getAttribute("aria-label")?.trim() ||
            b.getAttribute("aria-labelledby")?.trim() ||
            (b.textContent ?? "").trim();
          if (!name) out.push(b.outerHTML.slice(0, 200));
        }
        return out;
      });
      expect(offending, `unlabelled buttons:\n${offending.join("\n")}`).toEqual([]);
    });

    test("has no <input> without an accessible name", async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const offending = await page.evaluate(() => {
        const out: string[] = [];
        for (const i of Array.from(document.querySelectorAll("input"))) {
          const type = (i.getAttribute("type") ?? "text").toLowerCase();
          if (["hidden", "submit", "reset", "button", "image"].includes(type)) continue;
          const id = i.getAttribute("id");
          const labelFor = id ? document.querySelector(`label[for="${id}"]`) : null;
          const insideLabel = i.closest("label");
          const ariaLabel = i.getAttribute("aria-label");
          const ariaLabelledBy = i.getAttribute("aria-labelledby");
          if (!labelFor && !insideLabel && !ariaLabel && !ariaLabelledBy) {
            out.push(i.outerHTML.slice(0, 200));
          }
        }
        return out;
      });
      expect(offending, `unlabelled inputs:\n${offending.join("\n")}`).toEqual([]);
    });

    test("has no positive tabindex (breaks tab order)", async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const positives = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of Array.from(document.querySelectorAll("[tabindex]"))) {
          const ti = el.getAttribute("tabindex");
          if (ti && Number.parseInt(ti, 10) > 0) out.push(el.outerHTML.slice(0, 200));
        }
        return out;
      });
      expect(positives, `positive tabindex:\n${positives.join("\n")}`).toEqual([]);
    });
  });
}

for (const path of FIXME_PATHS) {
  test.fixme(`fixme · public route ${path} (Convex-dependent loading shell)`, async ({ page }) => {
    // Tracked: chrome-error during fullPage screenshot when NEXT_PUBLIC_CONVEX_URL
    // is unreachable. Add real e2e env wiring before un-fixing.
    await page.goto(path);
  });
}
