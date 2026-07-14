import { expect, test } from "@playwright/test";

type TempoTerminalWindow = Window & {
  __tempoTerminal?: {
    readBuffer: () => string;
  };
};

if (process.env.TEMPO_PLAYWRIGHT === "1") {
  test(
    "creates a terminal session and renders echo output in the xterm buffer",
    async ({ page }) => {
      await page.goto("/terminal");

      await page.getByRole("button", { name: "Create session" }).click();
      await expect(page.getByTestId("terminal-session-state")).toHaveText(
        "Session ready"
      );
      await expect
        .poll(async () =>
          page.evaluate(() => {
            const tempoWindow = window as TempoTerminalWindow;
            return Boolean(tempoWindow.__tempoTerminal);
          })
        )
        .toBe(true);

      await page.keyboard.type("echo hi");
      await page.keyboard.press("Enter");

      await expect
        .poll(async () =>
          page.evaluate(() => {
            const tempoWindow = window as TempoTerminalWindow;
            return tempoWindow.__tempoTerminal?.readBuffer() ?? "";
          })
        )
        .toContain("hi");
    }
  );
}
