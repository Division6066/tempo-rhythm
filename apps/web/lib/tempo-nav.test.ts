import { describe, expect, test } from "bun:test";
import {
  CATEGORIES,
  findScreen,
  paletteScreens,
  screensByCategory,
  TEMPO_SCREENS,
} from "./tempo-nav";

describe("tempo-nav", () => {
  test("every screen has a unique slug", () => {
    const slugs = TEMPO_SCREENS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("every screen has a non-empty title and route", () => {
    for (const s of TEMPO_SCREENS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.route.length).toBeGreaterThan(0);
    }
  });

  test("every category in CATEGORIES has at least one non-bare screen", () => {
    for (const cat of CATEGORIES) {
      const list = screensByCategory(cat);
      expect(list.length).toBeGreaterThan(0);
    }
  });

  test("screensByCategory excludes bare, dynamic, and deprecated screens", () => {
    for (const cat of CATEGORIES) {
      for (const s of screensByCategory(cat)) {
        expect(s.bare ?? false).toBe(false);
        expect(s.dynamic ?? false).toBe(false);
        expect(s.deprecated ?? false).toBe(false);
      }
    }
  });

  test("findScreen returns matching entry or undefined", () => {
    expect(findScreen("today")?.title).toBe("Today");
    expect(findScreen("not-a-real-slug")).toBeUndefined();
  });

  test("paletteScreens excludes dynamic and deprecated", () => {
    const list = paletteScreens();
    for (const s of list) {
      expect(s.dynamic ?? false).toBe(false);
      expect(s.deprecated ?? false).toBe(false);
    }
  });

  test("dynamic detail routes are registered for every parent listing", () => {
    const expectations: Array<[string, string]> = [
      ["notes", "note-detail"],
      ["habits", "habit-detail"],
      ["routines", "routine-detail"],
      ["goals", "goal-detail"],
      ["projects", "project-detail"],
    ];
    for (const [parent, detail] of expectations) {
      expect(findScreen(parent)).toBeDefined();
      const d = findScreen(detail);
      expect(d).toBeDefined();
      expect(d?.dynamic).toBe(true);
      expect(d?.route).toContain("[id]");
    }
  });

  test("bare routes are flagged bare", () => {
    for (const slug of [
      "daily-note",
      "sign-in",
      "onboarding",
      "template-builder",
      "template-run",
      "trial-end",
      "landing",
      "about",
      "changelog",
    ]) {
      const s = findScreen(slug);
      expect(s?.bare).toBe(true);
    }
  });

  test("legacy template-editor is flagged deprecated", () => {
    const s = findScreen("template-editor");
    expect(s?.deprecated).toBe(true);
  });
});
