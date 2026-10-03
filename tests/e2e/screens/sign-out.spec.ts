import { expect, test } from "@playwright/test";

const storageStatePath = process.env.TEMPO_E2E_STORAGE_STATE;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

function url(path: string): string {
  return new URL(path, baseURL).toString();
}

test.describe("sign out", () => {
  test("sign-out button is visible", async ({ page }) => {
    test.skip(
      Boolean(process.env.PLAYWRIGHT_BASE_URL) && !storageStatePath,
      "needs TEMPO_E2E_STORAGE_STATE",
    );

    await page.goto(url("/today"));
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  });

  test.describe("signed in", () => {
    test.skip(!storageStatePath, "needs TEMPO_E2E_STORAGE_STATE");

    test.use({ storageState: storageStatePath });

    test("sign out lands on sign-in", async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") {
          consoleErrors.push(message.text());
        }
      });

      await page.goto(url("/today"));
      await page.getByRole("button", { name: "Sign out" }).click();
      await expect(page).toHaveURL(/\/sign-in/);

      await page.goto(url("/notes"));
      await expect(page).toHaveURL(/\/sign-in\?next=%2Fnotes/);

      expect(consoleErrors).toEqual([]);
    });
  });
});
