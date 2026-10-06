import { expect, test } from "@playwright/test";

const storageStatePath = process.env.TEMPO_E2E_STORAGE_STATE;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

function url(path: string): string {
  return new URL(path, baseURL).toString();
}

test.describe("goals screens", () => {
  test.skip(!storageStatePath, "needs TEMPO_E2E_STORAGE_STATE");
  test.use({ storageState: storageStatePath });

  test("create, open, edit, mark a milestone and delete a goal; survives reload", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    const goalTitle = `Ship the first chapter ${Date.now()}`;
    const goalDescription = "A small, concrete finish line.";

    await page.goto(url("/goals"));
    await expect(page.getByRole("main").getByRole("heading", { name: "Goals" })).toBeVisible();
    await page.getByRole("button", { name: "New goal" }).click();
    await expect(page).toHaveURL(/\/goals\/[^/]+$/);

    await page.getByLabel("Goal title").fill(goalTitle);
    await page.getByLabel("Goal description").fill(goalDescription);
    await page.getByLabel("Target date").fill("2027-03-15");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toHaveText("Saved");

    await page.getByRole("button", { name: "Mark milestone" }).click();
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "10");

    await page.reload();
    await expect(page.getByLabel("Goal title")).toHaveValue(goalTitle);
    await expect(page.getByLabel("Goal description")).toHaveValue(goalDescription);
    await expect(page.getByLabel("Target date")).toHaveValue("2027-03-15");
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "10");

    await page.getByRole("link", { name: "← Back to goals" }).click();
    const row = page.getByRole("listitem").filter({ hasText: goalTitle });
    await expect(row).toBeVisible();
    await page.reload();
    await expect(page.getByRole("listitem").filter({ hasText: goalTitle })).toBeVisible();

    await row.getByRole("button", { name: `Delete ${goalTitle}` }).click();
    await row.getByRole("button", { name: `Confirm delete ${goalTitle}` }).click();
    await expect(page.getByText(goalTitle)).toHaveCount(0);
    await page.reload();
    await expect(page.getByText(goalTitle)).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });
});
