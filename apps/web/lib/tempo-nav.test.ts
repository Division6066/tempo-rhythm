/**
 * Validates the single source of truth in `tempo-nav.ts`.
 *
 * The Sidebar and Command Palette both consume TEMPO_SCREENS, so a typo
 * in either route or category here ripples into broken navigation
 * throughout the app. We catch those at unit-test time.
 */
import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  CATEGORIES,
  findScreen,
  screensByCategory,
  TEMPO_SCREENS,
  type TempoScreen,
} from "./tempo-nav";

const APP_ROOT = join(import.meta.dir, "..", "app");

/** Map a public route to the directory it lives in on disk. */
function routeDirCandidates(route: string): string[] {
  // Drop dynamic segments like /goals/[id] -> /goals
  const cleaned = route.replace(/\/\[[^\]]+\]/g, "");
  const segments = cleaned.split("/").filter(Boolean);
  const candidates: string[] = [];
  // Try (tempo)/<segments>, (bare)/<segments>, (auth)/<segments>, (app)/<segments>, top-level
  for (const group of ["(tempo)", "(bare)", "(auth)", "(app)", ""]) {
    candidates.push(join(APP_ROOT, group, ...segments));
  }
  return candidates;
}

function pageFileExists(route: string): boolean {
  if (route === "/") {
    return (
      existsSync(join(APP_ROOT, "page.tsx")) || existsSync(join(APP_ROOT, "page.ts"))
    );
  }
  for (const dir of routeDirCandidates(route)) {
    for (const ext of ["tsx", "ts"]) {
      if (existsSync(join(dir, `page.${ext}`))) return true;
    }
  }
  return false;
}

describe("tempo-nav · TEMPO_SCREENS shape", () => {
  test("every screen has slug, title, route, category", () => {
    for (const s of TEMPO_SCREENS) {
      expect(s.slug, `screen missing slug: ${JSON.stringify(s)}`).toBeTruthy();
      expect(s.title, `screen missing title: ${s.slug}`).toBeTruthy();
      expect(s.route.startsWith("/"), `route must start with /: ${s.slug}`).toBe(true);
      expect(CATEGORIES.includes(s.category as never) || s.category === "Marketing" || s.category === "Onboarding" || s.category === "Mobile", `bad category: ${s.category}`).toBe(true);
    }
  });

  test("slugs are unique", () => {
    const slugs = TEMPO_SCREENS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("routes are unique", () => {
    const routes = TEMPO_SCREENS.map((s) => s.route);
    expect(new Set(routes).size).toBe(routes.length);
  });
});

describe("tempo-nav · helper functions", () => {
  test("screensByCategory excludes bare screens", () => {
    for (const cat of CATEGORIES) {
      const list = screensByCategory(cat);
      expect(list.every((s) => !s.bare), `bare screen leaked into ${cat}`).toBe(true);
      expect(list.every((s) => s.category === cat)).toBe(true);
    }
  });

  test("screensByCategory returns at least one screen per primary category", () => {
    for (const cat of CATEGORIES) {
      const list = screensByCategory(cat);
      expect(list.length, `category ${cat} has no screens`).toBeGreaterThan(0);
    }
  });

  test("findScreen by slug returns the same object", () => {
    const today = findScreen("today");
    expect(today?.route).toBe("/today");
    expect(findScreen("does-not-exist")).toBeUndefined();
  });
});

describe("tempo-nav · required UI QA screens are wired", () => {
  // Mission-critical screens for the UI QA scope.
  const required: Array<{ slug: string; route: string }> = [
    { slug: "today", route: "/today" },
    { slug: "brain-dump", route: "/brain-dump" },
    { slug: "coach", route: "/coach" },
    { slug: "plan", route: "/plan" },
    { slug: "settings", route: "/settings/profile" },
    { slug: "onboarding", route: "/onboarding" },
    { slug: "billing", route: "/billing" },
  ];
  for (const r of required) {
    test(`${r.slug} → ${r.route} is in TEMPO_SCREENS`, () => {
      const screen = findScreen(r.slug);
      expect(screen, `expected slug ${r.slug} in TEMPO_SCREENS`).toBeTruthy();
      expect(screen?.route).toBe(r.route);
    });
  }
});

describe("tempo-nav · file system mapping", () => {
  // Skip the `mobile` category: those routes live in apps/mobile, not apps/web.
  const webScreens: TempoScreen[] = TEMPO_SCREENS.filter((s) => s.category !== "Mobile");

  for (const screen of webScreens) {
    test(`${screen.route} has a page file`, () => {
      const ok = pageFileExists(screen.route);
      expect(
        ok,
        `expected a page.tsx for "${screen.route}" under app/, app/(tempo), or app/(bare). Add or remove the screen from TEMPO_SCREENS.`,
      ).toBe(true);
    });
  }
});

describe("tempo-nav · sidebar shape parity with category pages", () => {
  test("Sidebar Settings group contains Profile, Preferences, Integrations, Billing, Notifications", () => {
    const settings = screensByCategory("Settings").map((s) => s.slug);
    expect(settings).toContain("settings"); // Profile
    expect(settings).toContain("settings-prefs");
    expect(settings).toContain("settings-integrations");
    expect(settings).toContain("billing");
    expect(settings).toContain("notifications");
  });

  test("Sidebar Flow group contains Today, Brain dump, Coach, Plan", () => {
    const flow = screensByCategory("Flow").map((s) => s.slug);
    expect(flow).toContain("today");
    expect(flow).toContain("brain-dump");
    expect(flow).toContain("coach");
    expect(flow).toContain("plan");
  });
});

describe("tempo-nav · all TEMPO_SCREENS resolve to a real directory under app/", () => {
  // Sanity scan: there should be no orphan route directories that exist on disk
  // but are missing from TEMPO_SCREENS, and vice versa. Soft-check (warn-only)
  // for marketing/auth that intentionally live outside the navmap.
  test("no slug points at a non-existent file (web only)", () => {
    const missing: string[] = [];
    for (const s of TEMPO_SCREENS) {
      if (s.category === "Mobile") continue;
      if (!pageFileExists(s.route)) missing.push(`${s.slug} → ${s.route}`);
    }
    expect(missing, `missing files:\n${missing.join("\n")}`).toEqual([]);
  });

  test("no orphan (tempo)/* directory is missing from TEMPO_SCREENS", () => {
    const tempoDir = join(APP_ROOT, "(tempo)");
    if (!existsSync(tempoDir)) return; // nothing to check
    const slugDirs = readdirSync(tempoDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    const knownRoutes = new Set(TEMPO_SCREENS.map((s) => s.route));
    const orphans: string[] = [];
    for (const dir of slugDirs) {
      const route = `/${dir}`;
      // Pages with [id] params are referenced by their parent route in nav.
      if (knownRoutes.has(route)) continue;
      // Settings is rendered through child routes; tolerate that container.
      if (dir === "settings") continue;
      orphans.push(route);
    }
    expect(
      orphans,
      `(tempo)/* routes not declared in TEMPO_SCREENS:\n${orphans.join("\n")}`,
    ).toEqual([]);
  });
});
