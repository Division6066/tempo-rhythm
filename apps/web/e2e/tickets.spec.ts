import { expect, test } from "@playwright/test";

test("detail pane shows dependsOn links and evidence exit codes", async ({
  page,
}) => {
  await page.goto("/tickets");

  const detailPane = page.getByRole("region", { name: "Ticket detail" });
  await expect(
    detailPane.getByRole("heading", {
      name: "AW-34 — Ticket board UI: kanban + evidence log",
    }),
  ).toBeVisible();

  const dependencies = detailPane.getByRole("list", {
    name: "Dependencies",
  });
  await expect(
    dependencies.getByRole("link", { name: "AW-01 — freeze schema" }),
  ).toHaveAttribute("href", "/tickets/AW-01");
  await expect(
    dependencies.getByRole("link", { name: "AW-12 — fixture loader" }),
  ).toHaveAttribute("href", "/tickets/AW-12");

  const evidence = detailPane.getByRole("list", { name: "Evidence" });
  await expect(
    evidence.getByRole("listitem").filter({ hasText: "bun install" }),
  ).toContainText("exit code 0");
  await expect(
    evidence
      .getByRole("listitem")
      .filter({ hasText: "bunx playwright test apps/web/e2e/tickets.spec.ts" }),
  ).toContainText("exit code 0");
});
