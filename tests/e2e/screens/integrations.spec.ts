import { expect, test, type Page } from "@playwright/test";

const storageStatePath = process.env.TEMPO_E2E_STORAGE_STATE;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

function url(path: string): string {
  return new URL(path, baseURL).toString();
}

function collectConsoleErrors(page: Page): string[] {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  return consoleErrors;
}

test.describe("integrations screen", () => {
  test.skip(!storageStatePath, "needs TEMPO_E2E_STORAGE_STATE");

  test.use({ storageState: storageStatePath });

  test("shows planned integrations without fake connect controls", async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    await page.goto(url("/settings/integrations"));

    await expect(page.getByRole("heading", { name: "Integrations" })).toBeVisible();
    await expect(page.getByText("Google Calendar")).toBeVisible();
    await expect(page.getByText("Apple Calendar")).toBeVisible();
    await expect(page.getByText("Coming soon")).toHaveCount(2);
    await expect(page.getByRole("button", { name: /^Connect/i })).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });

  test("opens Ask the founder from the request link", async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    await page.goto(url("/settings/integrations"));
    const founderLink = page.getByRole("link", { name: "Ask the founder" });

    await expect(founderLink).toHaveAttribute("href", "/ask-founder");
    await founderLink.click();
    await expect(page).toHaveURL(url("/ask-founder"));
    expect(consoleErrors).toEqual([]);
  });
});
