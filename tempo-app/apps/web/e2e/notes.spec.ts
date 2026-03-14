import { test, expect } from "@playwright/test";

test.describe("Notes (authenticated)", () => {
  test.skip(true, "Requires authenticated session with Convex Auth");

  test("notes list page renders", async ({ page }) => {
    await page.goto("/notes");
    await expect(page.locator("h1")).toContainText("Notes");
    await expect(page.getByText("New Note")).toBeVisible();
  });

  test("notes page has period note links", async ({ page }) => {
    await page.goto("/notes");
    await expect(page.getByText("Weekly Notes")).toBeVisible();
    await expect(page.getByText("Monthly Notes")).toBeVisible();
    await expect(page.getByText("Yearly Notes")).toBeVisible();
  });

  test("new note editor opens", async ({ page }) => {
    await page.goto("/notes/new");
    await expect(page.getByPlaceholder("Note Title")).toBeVisible();
    await expect(page.getByText("Edit")).toBeVisible();
    await expect(page.getByText("Preview")).toBeVisible();
    await expect(page.getByText("Voice Note")).toBeVisible();
  });

  test("note editor supports markdown preview", async ({ page }) => {
    await page.goto("/notes/new");
    await page.getByPlaceholder(/Start typing/).fill("# Hello World\n\nThis is a test.");
    await page.getByText("Preview").click();
    await expect(page.getByText("Hello World")).toBeVisible();
    await expect(page.getByText("This is a test.")).toBeVisible();
  });

  test("note editor has pin and publish buttons", async ({ page }) => {
    await page.goto("/notes/new");
    await expect(page.locator("[title='Publish'], [title='Unpublish']")).not.toBeVisible();
  });

  test("weekly period notes page renders", async ({ page }) => {
    await page.goto("/notes/period/weekly");
    await expect(page.getByText(/Week of/)).toBeVisible();
    await expect(page.getByText("Edit")).toBeVisible();
    await expect(page.getByText("Preview")).toBeVisible();
  });

  test("period notes navigation works", async ({ page }) => {
    await page.goto("/notes/period/monthly");
    const header = page.locator("h2").first();
    const initialText = await header.textContent();
    await page.locator("button").filter({ has: page.locator("svg") }).nth(2).click();
    await page.waitForTimeout(500);
    const newText = await header.textContent();
    expect(newText).not.toBe(initialText);
  });
});
