import { expect, test } from "@playwright/test";

test.describe("billing visible shell", () => {
  test("loads billing, shows tier/promo state, and survives reload", async ({ page }) => {
    await page.goto("/billing");

    await expect(page.getByRole("heading", { level: 1, name: "Trial & billing" })).toBeVisible();
    await expect(page.getByText("Current tier")).toBeVisible();
    await expect(page.getByText("Free beta")).toBeVisible();
    await expect(page.getByText("Promo/free access", { exact: true })).toBeVisible();
    await expect(page.getByText(/Approved beta testers can keep using the core app/i)).toBeVisible();
    await expect(page.getByText(/Payments are not live yet/i)).toBeVisible();

    await page.reload();

    await expect(page.getByRole("heading", { level: 1, name: "Trial & billing" })).toBeVisible();
    await expect(page.getByText("Current tier")).toBeVisible();
    await expect(page.getByText("Free beta")).toBeVisible();
  });
});
