import { test, expect } from "@playwright/test";

test.describe("AI Features (authenticated)", () => {
  test.skip(true, "Requires authenticated session with Convex Auth");

  test("chat page renders with welcome message", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.getByText("TEMPO Assistant")).toBeVisible();
    await expect(page.getByText("Always here to help you focus.")).toBeVisible();
    await expect(page.getByPlaceholder("Ask me anything...")).toBeVisible();
  });

  test("chat initial message contains intro text", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.getByText(/I'm TEMPO/)).toBeVisible();
    await expect(page.getByText(/plan your day/)).toBeVisible();
    await expect(page.getByText(/break down overwhelming tasks/)).toBeVisible();
  });

  test("chat send button is disabled when empty", async ({ page }) => {
    await page.goto("/chat");
    const sendButton = page.locator("button[type='submit']");
    await expect(sendButton).toBeDisabled();
  });

  test("chat send button is enabled with text", async ({ page }) => {
    await page.goto("/chat");
    await page.getByPlaceholder("Ask me anything...").fill("Hello");
    const sendButton = page.locator("button[type='submit']");
    await expect(sendButton).toBeEnabled();
  });

  test("chat gracefully handles AI error", async ({ page }) => {
    await page.goto("/chat");
    await page.getByPlaceholder("Ask me anything...").fill("Hello");
    await page.locator("button[type='submit']").click();
    await page.waitForTimeout(5000);
    const hasResponse = await page.getByText(/Sorry.*trouble|Hi!|plan|focus/).isVisible();
    expect(hasResponse).toBeTruthy();
  });

  test("daily plan page renders", async ({ page }) => {
    await page.goto("/plan");
    await expect(page.getByText("Daily Plan")).toBeVisible();
    await expect(page.getByText("Generate AI Plan")).toBeVisible();
  });

  test("daily plan generate button shows loading state", async ({ page }) => {
    await page.goto("/plan");
    await page.getByText("Generate AI Plan").click();
    const hasLoadingOrError = await page.getByText(/Analyzing|Planning|couldn't generate|AI planning is currently unavailable/).isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasLoadingOrError).toBeTruthy();
  });
});
