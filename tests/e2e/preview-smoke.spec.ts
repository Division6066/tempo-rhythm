import { expect, test } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL;

function url(path: string): string {
  return new URL(path, baseURL ?? "http://localhost:3000").toString();
}

test.describe("preview smoke", () => {
  test.beforeEach(() => {
    test.skip(!baseURL, "preview-only: needs PLAYWRIGHT_BASE_URL");
  });

  test("sign-in shows magic link only", async ({ page }) => {
    await page.goto(url("/sign-in"));
    await expect(page.locator("#sign-in-email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send magic link" })).toBeVisible();
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });

  test("sign-up shows magic link only", async ({ page }) => {
    await page.goto(url("/sign-up"));
    await expect(page.locator("#sign-up-email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send magic link" })).toBeVisible();
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });

  test("signed-out /today redirects", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url("/today"));
    await expect(page).toHaveURL(/\/sign-in\?/);
    await context.close();
  });

  test("sign-in LCP", async ({ page }) => {
    await page.goto(url("/sign-in"), { waitUntil: "load" });

    const { lcp, cls } = await page.evaluate(
      () =>
        new Promise<{ lcp: number; cls: number }>((resolve) => {
          let lcpValue = 0;
          let clsValue = 0;

          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              lcpValue = entry.startTime;
            }
          }).observe({ type: "largest-contentful-paint", buffered: true });

          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as Array<
              PerformanceEntry & { value: number; hadRecentInput: boolean }
            >) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
          }).observe({ type: "layout-shift", buffered: true });

          setTimeout(() => resolve({ lcp: lcpValue, cls: clsValue }), 1000);
        }),
    );

    expect(lcp).toBeLessThan(2500);
    expect(cls).toBeLessThan(0.1);
  });
});
