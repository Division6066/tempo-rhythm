import { expect, test } from "@playwright/test";
import { createSessionLogStore, type SessionLogEntry } from "../lib/sessionPlayer";

test.describe("session player", () => {
  test("completion-log writes exactly one session-log entry", async ({ page }) => {
    const routineId = "routine-morning-reset";
    const completedAt = Date.parse("2026-07-14T15:17:00.000Z");
    const entries: SessionLogEntry[] = [];
    const store = createSessionLogStore({
      read: () => entries,
      write: (nextEntries) => {
        entries.splice(0, entries.length, ...nextEntries);
      },
    });

    await page.exposeFunction("completeRoutine", async () => {
      return store.completeRoutine({ completedAt, routineId });
    });

    await page.setContent(`
      <main>
        <button type="button" aria-label="Complete routine">Complete routine</button>
        <table aria-label="Session log">
          <tbody data-testid="session-log"></tbody>
        </table>
      </main>
      <script>
        const button = document.querySelector("button");
        const tableBody = document.querySelector("[data-testid='session-log']");

        function render(entries) {
          tableBody.replaceChildren();
          for (const entry of entries) {
            const row = document.createElement("tr");
            row.dataset.testid = "session-log-row";

            const routineCell = document.createElement("td");
            routineCell.dataset.testid = "routine-id";
            routineCell.textContent = entry.routineId;

            const timestampCell = document.createElement("td");
            timestampCell.dataset.testid = "completion-timestamp";
            timestampCell.textContent = new Date(entry.completedAt).toISOString();

            row.append(routineCell, timestampCell);
            tableBody.append(row);
          }
        }

        button.addEventListener("click", async () => {
          render(await window.completeRoutine());
        });
      </script>
    `);

    await page.getByRole("button", { name: "Complete routine" }).click();
    await page.getByRole("button", { name: "Complete routine" }).click();

    const logRows = page.getByTestId("session-log-row");
    await expect(logRows).toHaveCount(1);
    await expect(logRows.first().getByTestId("routine-id")).toHaveText(routineId);
    await expect(logRows.first().getByTestId("completion-timestamp")).toHaveText(
      "2026-07-14T15:17:00.000Z",
    );
  });
});
