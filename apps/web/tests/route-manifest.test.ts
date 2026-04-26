/**
 * Route smoke + scaffold parity tests.
 *
 * For each scaffold-only route under (tempo) / (bare), this test:
 *   1. Imports the page module dynamically.
 *   2. Confirms the default export is a function (the page component).
 *   3. Renders it through `react-dom/server` and runs the structural a11y audit.
 *   4. Asserts the rendered HTML contains the screen title from TEMPO_SCREENS.
 *
 * Routes that depend on Convex (Today, anything that calls useQuery/useMutation
 * at the top level) are exercised through their own focused tests. This file is
 * the broad pass: every static scaffold should render and pass a11y baselines.
 */
import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import type * as React from "react";
import { audit, errorIssues, formatIssues, render, visibleText } from "./a11y";

type RouteCase = {
  name: string;
  importPath: string;
  expectedTitle?: string;
  /** Pass props for routes whose page accepts params. */
  props?: Record<string, unknown>;
  /** Routes that wrap an `async function Page({ params })`. */
  asyncProps?: () => Promise<Record<string, unknown>>;
};

/**
 * Scaffold-only routes (no Convex hooks at module load). These are the routes
 * the spec calls out: Coach, Planning, Settings, Onboarding, Billing.
 * Brain Dump's standalone page is also a scaffold; the wired Today screen has
 * its own test.
 */
const SCAFFOLD_ROUTES: RouteCase[] = [
  // Flow
  { name: "/brain-dump", importPath: "../app/(tempo)/brain-dump/page", expectedTitle: "Brain dump" },
  { name: "/coach", importPath: "../app/(tempo)/coach/page", expectedTitle: "Coach" },
  { name: "/plan", importPath: "../app/(tempo)/plan/page", expectedTitle: "Planning" },

  // Library
  { name: "/tasks", importPath: "../app/(tempo)/tasks/page", expectedTitle: "Tasks" },
  { name: "/notes", importPath: "../app/(tempo)/notes/page", expectedTitle: "Notes" },
  { name: "/journal", importPath: "../app/(tempo)/journal/page", expectedTitle: "Journal" },
  { name: "/calendar", importPath: "../app/(tempo)/calendar/page", expectedTitle: "Calendar" },
  { name: "/habits", importPath: "../app/(tempo)/habits/page", expectedTitle: "Habits" },
  { name: "/routines", importPath: "../app/(tempo)/routines/page", expectedTitle: "Routines" },
  { name: "/goals", importPath: "../app/(tempo)/goals/page", expectedTitle: "Goals" },
  { name: "/projects", importPath: "../app/(tempo)/projects/page", expectedTitle: "Projects" },

  // You
  { name: "/insights", importPath: "../app/(tempo)/insights/page", expectedTitle: "Insights" },
  { name: "/activity", importPath: "../app/(tempo)/activity/page", expectedTitle: "Recent activity" },
  { name: "/templates", importPath: "../app/(tempo)/templates/page", expectedTitle: "Templates" },
  { name: "/search", importPath: "../app/(tempo)/search/page", expectedTitle: "Search" },
  { name: "/command", importPath: "../app/(tempo)/command/page", expectedTitle: "Command bar" },
  { name: "/empty-states", importPath: "../app/(tempo)/empty-states/page", expectedTitle: "Empty states" },

  // Settings
  { name: "/settings/profile", importPath: "../app/(tempo)/settings/profile/page", expectedTitle: "Profile" },
  { name: "/settings/preferences", importPath: "../app/(tempo)/settings/preferences/page", expectedTitle: "Preferences" },
  { name: "/settings/integrations", importPath: "../app/(tempo)/settings/integrations/page", expectedTitle: "Integrations" },
  { name: "/billing", importPath: "../app/(tempo)/billing/page", expectedTitle: "Trial & billing" },
  { name: "/notifications", importPath: "../app/(tempo)/notifications/page", expectedTitle: "Notifications" },
  { name: "/ask-founder", importPath: "../app/(tempo)/ask-founder/page", expectedTitle: "Ask the founder" },

  // Bare
  { name: "/onboarding", importPath: "../app/(bare)/onboarding/page", expectedTitle: "Onboarding" },
  { name: "/templates/builder", importPath: "../app/(bare)/templates/builder/page", expectedTitle: "Template builder" },
  { name: "/templates/run", importPath: "../app/(bare)/templates/run/page", expectedTitle: "Template run" },
  { name: "/billing/trial-end", importPath: "../app/(bare)/billing/trial-end/page", expectedTitle: "Trial ended" },
  { name: "/daily-note", importPath: "../app/(bare)/daily-note/page" },
];

const DYNAMIC_ROUTES: RouteCase[] = [
  {
    name: "/templates/run/[id]",
    importPath: "../app/(bare)/templates/run/[id]/page",
    expectedTitle: "Template run",
    asyncProps: async () => ({ params: Promise.resolve({ id: "demo-template" }) }),
  },
];

describe("route manifest · scaffold pages render", () => {
  for (const route of SCAFFOLD_ROUTES) {
    test(`${route.name} renders`, async () => {
      const mod = await import(route.importPath);
      expect(typeof mod.default, `${route.name}: missing default export`).toBe("function");
      const PageComponent = mod.default;
      const element = createElement(PageComponent as () => React.ReactElement);
      const rendered = render(element);
      expect(rendered.html.length).toBeGreaterThan(0);
      if (route.expectedTitle) {
        const text = visibleText(rendered.html);
        expect(
          text.includes(route.expectedTitle),
          `${route.name}: expected visible text to contain "${route.expectedTitle}", got: ${text.slice(0, 200)}…`,
        ).toBe(true);
      }
    });
  }
});

describe("route manifest · dynamic pages render with params", () => {
  for (const route of DYNAMIC_ROUTES) {
    test(`${route.name} renders`, async () => {
      const mod = await import(route.importPath);
      expect(typeof mod.default).toBe("function");
      const props = route.asyncProps ? await route.asyncProps() : route.props;
      const PageComponent = mod.default;
      // Async server component: invoke and await the JSX promise.
      const result: unknown = (PageComponent as (p: typeof props) => unknown)(props);
      const element =
        result instanceof Promise ? ((await result) as React.ReactElement) : (result as React.ReactElement);
      const rendered = render(element);
      expect(rendered.html.length).toBeGreaterThan(0);
      if (route.expectedTitle) {
        const text = visibleText(rendered.html);
        expect(text.includes(route.expectedTitle)).toBe(true);
      }
    });
  }
});

describe("route manifest · accessibility audit", () => {
  for (const route of SCAFFOLD_ROUTES) {
    test(`${route.name} passes structural a11y audit`, async () => {
      const mod = await import(route.importPath);
      const PageComponent = mod.default as () => React.ReactElement;
      const rendered = render(createElement(PageComponent));
      const issues = audit(rendered);
      const errors = errorIssues(issues);
      expect(
        errors,
        `${route.name} a11y errors:\n${formatIssues(errors)}`,
      ).toEqual([]);
    });
  }
});

describe("route manifest · disk presence", () => {
  // Belt-and-braces: the import-based tests above do not cover apps that simply
  // forgot to author a page file — `import()` would throw long before render.
  // This tightens the loop by erroring with a friendly message instead.
  // Paths derived relative to this test file so the suite is portable across
  // CI runners and developer machines.
  const TESTS_DIR = import.meta.dir;
  const all = [...SCAFFOLD_ROUTES, ...DYNAMIC_ROUTES];
  for (const r of all) {
    test(`${r.name} module path resolves`, () => {
      // Strip leading "../" since the import path is already test-file-relative.
      const rel = r.importPath.replace(/^\.\.\//, "");
      const absTsx = join(TESTS_DIR, "..", `${rel}.tsx`);
      const absTs = join(TESTS_DIR, "..", `${rel}.ts`);
      expect(
        existsSync(absTsx) || existsSync(absTs),
        `expected page file at ${absTsx} or ${absTs}`,
      ).toBe(true);
    });
  }
});

describe("route manifest · scaffold pages use ScaffoldScreen", () => {
  /**
   * Many scaffold routes share a common emptier — when one regresses (e.g.
   * someone removes the heading), the others should still ship the same
   * structural promise. This tests one canonical screen for the contract.
   */
  test("Coach scaffold contains a heading and category pill", async () => {
    const mod = await import("../app/(tempo)/coach/page");
    const PageComponent = mod.default as () => React.ReactElement;
    const rendered = render(createElement(PageComponent));
    expect(rendered.tags.get("h1")?.[0]).toContain("Coach");
    expect(rendered.html).toContain("scaffold · not ported");
  });

  test("Planning scaffold contains a heading", async () => {
    const mod = await import("../app/(tempo)/plan/page");
    const PageComponent = mod.default as () => React.ReactElement;
    const rendered = render(createElement(PageComponent));
    expect(rendered.tags.get("h1")?.[0]).toContain("Planning");
  });

  test("Settings/Profile scaffold contains a heading", async () => {
    const mod = await import("../app/(tempo)/settings/profile/page");
    const PageComponent = mod.default as () => React.ReactElement;
    const rendered = render(createElement(PageComponent));
    expect(rendered.tags.get("h1")?.[0]).toContain("Profile");
  });

  test("Onboarding scaffold contains a heading", async () => {
    const mod = await import("../app/(bare)/onboarding/page");
    const PageComponent = mod.default as () => React.ReactElement;
    const rendered = render(createElement(PageComponent));
    expect(rendered.tags.get("h1")?.[0]).toContain("Onboarding");
  });

  test("Billing scaffold contains a heading", async () => {
    const mod = await import("../app/(tempo)/billing/page");
    const PageComponent = mod.default as () => React.ReactElement;
    const rendered = render(createElement(PageComponent));
    expect(rendered.tags.get("h1")?.[0]).toContain("Trial");
  });
});
