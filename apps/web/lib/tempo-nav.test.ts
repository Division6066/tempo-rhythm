import { describe, expect, test } from "bun:test";
import {
  CATEGORIES,
  commandPaletteScreens,
  findScreenByPathname,
  primaryMobileTabs,
  screenLabel,
  sidebarScreensByCategory,
} from "./tempo-nav";

describe("Tempo app shell navigation registry", () => {
  test("sidebar sections only expose shell routes", () => {
    const screens = CATEGORIES.flatMap((category) =>
      sidebarScreensByCategory(category),
    );

    expect(screens.map((screen) => screen.slug)).toContain("today");
    expect(screens.map((screen) => screen.slug)).toContain("library");
    expect(screens.map((screen) => screen.slug)).toContain("folders");
    expect(screens.map((screen) => screen.slug)).toContain("rewards");
    expect(screens.map((screen) => screen.slug)).not.toContain("landing");
    expect(screens.map((screen) => screen.slug)).not.toContain("sign-in");
    expect(screens.map((screen) => screen.slug)).not.toContain("command");
  });

  test("command palette includes navigation shells and skips marketing", () => {
    const slugs = commandPaletteScreens().map((screen) => screen.slug);

    expect(slugs).toContain("today");
    expect(slugs).toContain("command");
    expect(slugs).toContain("library-item");
    expect(slugs).toContain("settings-prefs");
    expect(slugs).not.toContain("landing");
    expect(slugs).not.toContain("onboarding");
  });

  test("path matching prefers nested routes", () => {
    expect(findScreenByPathname("/projects/demo/kanban")?.slug).toBe(
      "project-kanban",
    );
    expect(findScreenByPathname("/library/demo")?.slug).toBe("library-item");
    expect(findScreenByPathname("/settings/preferences")?.slug).toBe(
      "settings-prefs",
    );
    expect(findScreenByPathname(undefined)?.slug).toBe("today");
  });

  test("primary mobile tabs match the Tempo prototype order", () => {
    expect(primaryMobileTabs().map(screenLabel)).toEqual([
      "Today",
      "Tasks",
      "Coach",
      "Library",
      "Preferences",
    ]);
  });
});
