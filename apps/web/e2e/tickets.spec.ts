import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";

const screenshotPath = path.join(
  process.cwd(),
  "apps/web/e2e/artifacts/aw-34-empty-project-board.png"
);

test("AW-34 empty project renders the empty board state and screenshot", async ({ page }) => {
  await page.goto("/projects/empty-project/kanban");

  await expect(
    page.getByRole("heading", { name: "A quiet board, ready when you are." })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nothing is missing." })).toBeVisible();
  await expect(page.getByText("This project does not have tickets yet.")).toBeVisible();

  const board = page.getByRole("region", { name: "Ticket board columns" });
  await expect(board).toBeVisible();

  for (const column of ["Backlog", "This week", "In progress", "Shipped"]) {
    await expect(board.getByRole("heading", { name: column })).toBeVisible();
  }

  await mkdir(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path: screenshotPath, fullPage: true });
});
