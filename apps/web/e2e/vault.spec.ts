import { expect, test } from "@playwright/test";

test.describe("Vault reveal", () => {
  test("runs the create, unlock, and reveal round trip without storing plaintext", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear());
    await page.goto("/vault");

    await page.getByLabel("Vault passphrase").fill("steady tiny lantern");
    await page.getByRole("button", { name: "Create vault" }).click();

    await expect(page.getByTestId("vault-status")).toHaveText("Vault unlocked");

    await page.getByLabel("Secret label").fill("Recovery note");
    await page.getByLabel("Secret value").fill("the-blue-mug-is-safe");
    await page.getByRole("button", { name: "Add secret" }).click();

    const localStorageDump = await page.evaluate(() =>
      JSON.stringify(Object.fromEntries(Object.entries(window.localStorage)))
    );
    expect(localStorageDump).not.toContain("the-blue-mug-is-safe");

    await page.getByRole("button", { name: "Lock vault" }).click();
    await expect(page.getByTestId("vault-status")).toHaveText("Vault locked");

    await page.getByLabel("Unlock passphrase").fill("steady tiny lantern");
    await page.getByRole("button", { name: "Unlock vault" }).click();
    await page.getByRole("button", { name: "Reveal Recovery note" }).click();

    await expect(page.getByText("the-blue-mug-is-safe")).toBeVisible();
  });
});
