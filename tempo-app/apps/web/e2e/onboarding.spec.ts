import { test, expect } from "@playwright/test";

test.describe("Onboarding (authenticated)", () => {
  test.skip(true, "Requires authenticated session with Convex Auth");

  test("onboarding first step renders welcome screen", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByText("Welcome to TEMPO")).toBeVisible();
    await expect(page.getByText(/calm, minimalist AI planner/)).toBeVisible();
    await expect(page.getByText(/get started/i)).toBeVisible();
  });

  test("onboarding progress bar is visible", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.locator("[class*='bg-primary'][class*='transition-all']").first()).toBeVisible();
  });

  test("onboarding step 2 shows ADHD mode choice", async ({ page }) => {
    await page.goto("/onboarding");
    await page.getByText(/get started/i).click();
    await expect(page.getByText("ADHD-Friendly?")).toBeVisible();
    await expect(page.getByText("Yes, turn it on")).toBeVisible();
    await expect(page.getByText("No thanks")).toBeVisible();
    await expect(page.getByText("Continue")).toBeVisible();
  });

  test("onboarding step 3 shows planning style", async ({ page }) => {
    await page.goto("/onboarding");
    await page.getByText(/get started/i).click();
    await page.getByText("Continue").click();
    await expect(page.getByText("Your Planning Style")).toBeVisible();
    await expect(page.getByText("Morning Planner")).toBeVisible();
    await expect(page.getByText("Evening Planner")).toBeVisible();
    await expect(page.getByText("Go With The Flow")).toBeVisible();
  });

  test("onboarding ADHD toggle works", async ({ page }) => {
    await page.goto("/onboarding");
    await page.getByText(/get started/i).click();
    await page.getByText("No thanks").click();
    await expect(page.locator("button:has-text('No thanks')")).toHaveClass(/bg-primary/);
    await page.getByText("Yes, turn it on").click();
    await expect(page.locator("button:has-text('Yes, turn it on')")).toHaveClass(/bg-primary/);
  });

  test("onboarding final step shows completion", async ({ page }) => {
    await page.goto("/onboarding");
    await page.getByText(/get started/i).click();
    await page.getByText("Continue").click();
    await page.getByText("Continue").click();
    await expect(page.getByText(/all set/i)).toBeVisible();
    await expect(page.getByText("Go to Dashboard")).toBeVisible();
  });
});
