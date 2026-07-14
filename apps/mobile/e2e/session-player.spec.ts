import { expect, test } from "@playwright/test";

import { getSessionSnapshot, routineForBackgroundResumeTest } from "../lib/session-player";

test.describe("session player", () => {
  test("background-resume keeps elapsed time and current phase", async ({ page }) => {
    const routine = routineForBackgroundResumeTest;
    const startedAt = 1_000;
    let now = startedAt + 4_000;

    await page.exposeFunction("getSessionSnapshotForTest", () =>
      getSessionSnapshot({
        now,
        routine,
        startedAt,
      })
    );

    await page.setContent(`
      <main>
        <output data-testid="elapsed"></output>
        <output data-testid="phase"></output>
      </main>
      <script>
        async function render() {
          const snapshot = await window.getSessionSnapshotForTest();
          document.querySelector('[data-testid="elapsed"]').textContent =
            String(snapshot.elapsedMs);
          document.querySelector('[data-testid="phase"]').textContent =
            snapshot.currentPhase.title;
        }

        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            void render();
          }
        });

        void render();
      </script>
    `);

    await expect(page.getByTestId("elapsed")).toHaveText("4000");
    await expect(page.getByTestId("phase")).toHaveText("Warm up");

    now = startedAt + 13_000;
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "hidden",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await page.waitForTimeout(50);

    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await expect(page.getByTestId("elapsed")).toHaveText("13000");
    await expect(page.getByTestId("phase")).toHaveText("Breathe");
  });
});
