import { expect, test } from "@playwright/test";

test.describe("JSON renderer prototype", () => {
  test("renders task, calendar, and habit variants in the browser", async ({ page }) => {
    await page.goto("/renderer-prototype");

    await expect(page.getByRole("heading", { name: "JSON Renderer Prototype" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Task view" })).toBeVisible();
    await expect(page.getByTestId("demo-task-1-title")).toHaveText("Pay rent");
    await expect(page.getByRole("heading", { name: "Calendar view" })).toBeVisible();
    await expect(page.getByText("Planning reset")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Habit view" })).toBeVisible();
    await expect(page.getByTestId("demo-habit-1-title")).toHaveText("Drink water");
  });

  test("invalid specs fail safely", async ({ page }) => {
    await page.goto("/renderer-prototype");

    await page.getByRole("button", { name: "Load invalid spec" }).click();

    await expect(page.getByText("We could not render this page spec safely.")).toBeVisible();
    await expect(page.getByText(/unsupported block type/i)).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
  });

  test("safe stateful actions persist across reload", async ({ page }) => {
    await page.goto("/renderer-prototype");

    await page.getByRole("button", { name: "Mark Pay rent complete" }).click();

    await expect(page.getByText("Safe action recorded: tasks.toggleCompletion")).toBeVisible();
    await expect(page.getByTestId("demo-task-1-title")).toHaveClass(/line-through/);

    await page.reload();

    await expect(page.getByTestId("demo-task-1-title")).toHaveClass(/line-through/);
    await expect(page.getByText("Reload proof: 1 local action restored.")).toBeVisible();
  });
});
