import { expect, test, type Page } from "@playwright/test";

const modules = [
  { key: "home", label: "Home", path: "/home" },
  { key: "breathe", label: "Breathe", path: "/breathe" },
  { key: "move", label: "Move", path: "/move" },
  { key: "condition", label: "Condition", path: "/condition" },
  { key: "progress", label: "Progress", path: "/progress" },
  { key: "settings", label: "Settings", path: "/settings" },
] as const;

if (typeof Bun === "undefined") {
  test.describe("module shell navigation", () => {
    for (const direction of ["ltr", "rtl"] as const) {
      test(`renders every module route with styled empty states in ${direction.toUpperCase()}`, async ({
        page,
      }) => {
        await setDirection(page, direction);

        for (const module of modules) {
          await page.goto(module.path);
          await assertModuleScreen(page, module.label);
        }
      });

      test(`tab navigation works in ${direction.toUpperCase()}`, async ({
        page,
      }) => {
        await setDirection(page, direction);
        await page.goto("/home");

        for (const module of modules) {
          await page.getByTestId(`module-nav-${module.key}`).click();
          await expect(page).toHaveURL(new RegExp(`${module.path}$`));
          await assertModuleScreen(page, module.label);
        }
      });
    }

    test("RTL mode keeps module navigation reachable by keyboard focus", async ({
      page,
    }) => {
      await setDirection(page, "rtl");
      await page.goto("/home");

      const focusedLabels: string[] = [];
      for (let index = 0; index < modules.length; index += 1) {
        await page.keyboard.press("Tab");
        focusedLabels.push(
          await page.evaluate(() => {
            const active = document.activeElement;
            return active?.textContent?.trim() ?? "";
          }),
        );
      }

      for (const module of modules) {
        expect(
          focusedLabels.some((label) => label.includes(module.label)),
        ).toBeTruthy();
      }
    });
  });
}

async function assertModuleScreen(
  page: Page,
  label: string,
) {
  await expect(page.getByRole("heading", { name: label })).toBeVisible();
  await expect(page.getByTestId("module-empty-state")).toBeVisible();
  await expect(page.getByTestId("module-empty-state-title")).toContainText(
    label,
  );
  await expect(page.getByTestId("module-empty-state-copy")).toBeVisible();
  await expect(page.getByText(/error boundary/i)).toHaveCount(0);

  const emptyStateStyles = await page
    .getByTestId("module-empty-state")
    .evaluate((element) => {
      const style = window.getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius,
        minHeight: element.getBoundingClientRect().height,
        paddingTop: style.paddingTop,
      };
    });

  expect(emptyStateStyles.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(Number.parseFloat(emptyStateStyles.borderRadius)).toBeGreaterThan(0);
  expect(Number.parseFloat(emptyStateStyles.paddingTop)).toBeGreaterThan(0);
  expect(emptyStateStyles.minHeight).toBeGreaterThan(120);
}

async function setDirection(
  page: Page,
  direction: "ltr" | "rtl",
) {
  await page.addInitScript((dir) => {
    document.documentElement.setAttribute("dir", dir);
  }, direction);
}
