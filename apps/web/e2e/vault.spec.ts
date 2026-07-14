// @ts-nocheck -- The test is executed with `bunx playwright`; the repo does not pin Playwright yet.
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { test, expect } from "@playwright/test";

const appDir = resolve(__dirname, "..");
const port = 3099;
const baseUrl = `http://localhost:${port}`;
const plaintextSecret = "sk-test-12345";

let server: ReturnType<typeof spawn> | undefined;

async function waitForVaultPage() {
  const deadline = Date.now() + 45_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/vault`);
      if (response.ok || response.status === 404) {
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }

  throw new Error(`Timed out waiting for web server. Last error: ${String(lastError)}`);
}

test.beforeAll(async () => {
  server = spawn("bun", ["run", "dev"], {
    cwd: appDir,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
      NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud",
      PORT: String(port),
    },
    stdio: "inherit",
  });

  await waitForVaultPage();
});

test.afterAll(async () => {
  if (server && !server.killed) {
    server.kill("SIGTERM");
  }
});

test("creates, locks, unlocks, and reveals a vault without sending plaintext", async ({
  page,
}) => {
  const requestBodies: string[] = [];
  page.on("request", (request) => {
    const body = request.postData();
    if (body) {
      requestBodies.push(body);
    }
  });

  await page.goto(`${baseUrl}/vault`);
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await expect(
    page.getByText(
      "If you lose both your passphrase and recovery code, your vault is gone. We cannot recover it.",
    ),
  ).toBeVisible();

  await page.getByLabel("Vault passphrase").fill("correct horse battery staple");
  await page.getByLabel("Confirm passphrase").fill("correct horse battery staple");
  await page.getByRole("button", { name: "Create vault" }).click();

  const recoveryCode = page.getByTestId("recovery-code");
  await expect(recoveryCode).toBeVisible();
  await expect(recoveryCode).toContainText(/TEMPO-[A-Z0-9-]+/);
  await expect(page.getByText("Authenticator enrollment", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "I've saved these codes" }).click();
  await expect(recoveryCode).toHaveCount(0);

  await page.reload();
  await expect(page.getByTestId("recovery-code")).toHaveCount(0);
  await page.getByLabel("Passphrase").fill("correct horse battery staple");
  await page.getByRole("button", { name: "Unlock vault" }).click();
  await expect(page.getByLabel("Secret label")).toBeVisible();

  await page.getByLabel("Secret label").fill("Test API key");
  await page.getByLabel("API key").fill(plaintextSecret);
  await page.getByLabel("Monthly budget").fill("25");
  await page.getByRole("button", { name: "Add secret" }).click();
  await expect(page.getByText("Test API key", { exact: true })).toBeVisible();
  await expect(page.getByText(plaintextSecret)).toHaveCount(0);

  mkdirSync(join(appDir, "e2e", "artifacts"), { recursive: true });
  await page.screenshot({
    path: join(appDir, "e2e", "artifacts", "vault-list.png"),
    fullPage: true,
  });

  await page.getByRole("button", { name: "Lock vault" }).click();
  await expect(page.getByText("Vault locked")).toBeVisible();

  await page.getByLabel("Passphrase").fill("wrong passphrase");
  await page.getByRole("button", { name: "Unlock vault" }).click();
  await expect(page.getByText("That passphrase did not unlock the vault.")).toBeVisible();
  await expect(page.getByText(plaintextSecret)).toHaveCount(0);

  await page.getByLabel("Passphrase").fill("correct horse battery staple");
  await page.getByRole("button", { name: "Unlock vault" }).click();
  await expect(page.getByText("Test API key", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Reveal Test API key" }).click();
  await expect(page.getByText(plaintextSecret)).toBeVisible();

  expect(requestBodies.filter((body) => body.includes(plaintextSecret))).toEqual([]);
});
