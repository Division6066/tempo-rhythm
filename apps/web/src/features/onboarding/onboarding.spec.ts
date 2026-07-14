import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import type { OnboardingFunnelEvent } from "./track";

declare global {
  interface Window {
    __tempoOnboardingTrack?: (event: OnboardingFunnelEvent) => void;
    __tempoOnboardingTrackEvents: OnboardingFunnelEvent[];
  }
}

const host = "127.0.0.1";
const port = 3310;
const baseUrl = `http://${host}:${port}`;
const webRoot = path.resolve(process.cwd(), "apps/web");

let server: ChildProcessWithoutNullStreams | undefined;
let ready: Promise<void> | undefined;

function startWebServer() {
  if (ready) {
    return ready;
  }

  server = spawn("bun", ["run", "dev", "--", "--hostname", host, "--port", String(port)], {
    cwd: webRoot,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
      NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL ?? "http://127.0.0.1:3210",
    },
  });

  ready = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timed out waiting for onboarding dev server"));
    }, 30_000);

    const handleOutput = (chunk: Buffer) => {
      const text = chunk.toString();
      if (text.includes(`http://${host}:${port}`) || text.includes("Ready in")) {
        clearTimeout(timeout);
        resolve();
      }
    };

    server?.stdout.on("data", handleOutput);
    server?.stderr.on("data", handleOutput);
    server?.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    server?.once("exit", (code) => {
      if (code !== null && code !== 0) {
        clearTimeout(timeout);
        reject(new Error(`Onboarding dev server exited with code ${code}`));
      }
    });
  });

  return ready;
}

async function installTrackSpy(page: Page) {
  await page.addInitScript(() => {
    window.__tempoOnboardingTrackEvents = [];
    window.__tempoOnboardingTrack = (event) => {
      window.__tempoOnboardingTrackEvents.push(event);
    };
  });
}

async function clickForward(page: Page, label: RegExp | string) {
  const action = page.getByRole("button", { name: label });
  await expect(action).toBeEnabled();
  await action.click();
}

test.beforeAll(async () => {
  await startWebServer();
});

test.afterAll(async () => {
  if (server?.pid) {
    server.kill();
  }
});

test.describe("onboarding funnel", () => {
  test("scripted new user reaches interactive first chat in under 60s wall-clock", async ({ page }) => {
    const startedAt = Date.now();
    await installTrackSpy(page);

    await page.goto(`${baseUrl}/onboarding`);
    await expect(page.getByTestId("onboarding-step")).toContainText("You made it here");

    await clickForward(page, /i am 18 or older/i);
    await clickForward(page, /use this preset/i);
    await clickForward(page, /start first chat/i);
    await clickForward(page, /send starter/i);

    await expect(page.getByTestId("first-chat-input")).toBeEnabled();
    await expect(page.getByTestId("first-chat-send")).toBeEnabled();
    await expect(page.getByTestId("first-chat-thread")).toContainText("AIRI");
    expect(Date.now() - startedAt).toBeLessThan(60_000);
  });

  test("every onboarding screen has at least one enabled forward action", async ({ page }) => {
    await installTrackSpy(page);

    await page.goto(`${baseUrl}/onboarding`);
    const expectedSteps = [
      { heading: /you made it here/i, action: /i am 18 or older/i },
      { heading: /choose a starting shape/i, action: /use this preset/i },
      { heading: /your first chat is ready/i, action: /start first chat/i },
      { heading: /pick a gentle opener/i, action: /send starter/i },
      { heading: /first chat/i, action: /send/i },
    ];

    for (const [index, step] of expectedSteps.entries()) {
      await expect(page.getByTestId("onboarding-step")).toContainText(step.heading);
      const enabledForwardActions = await page
        .getByTestId("onboarding-forward-actions")
        .getByRole("button")
        .evaluateAll((buttons) => buttons.filter((button) => !button.hasAttribute("disabled")).length);
      expect(enabledForwardActions, `step ${index + 1} enabled forward actions`).toBeGreaterThanOrEqual(1);

      if (index < expectedSteps.length - 1) {
        await clickForward(page, step.action);
      }
    }
  });

  test("each step calls track() exactly once with a distinct event name", async ({ page }) => {
    await installTrackSpy(page);

    await page.goto(`${baseUrl}/onboarding`);
    await clickForward(page, /i am 18 or older/i);
    await clickForward(page, /use this preset/i);
    await clickForward(page, /start first chat/i);
    await clickForward(page, /send starter/i);

    const events = await page.evaluate(() => window.__tempoOnboardingTrackEvents.map((event) => event.name));
    expect(events).toEqual([
      "onboarding_age_gate_viewed",
      "onboarding_preset_viewed",
      "onboarding_chat_preview_viewed",
      "onboarding_starter_viewed",
      "onboarding_first_chat_viewed",
    ]);
    expect(new Set(events).size).toBe(events.length);
  });
});
