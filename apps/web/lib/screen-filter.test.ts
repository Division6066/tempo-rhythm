/**
 * Pure tests for the Command Palette filter.
 *
 * The CommandPalette delegates to filterScreens; testing it directly
 * keeps the Convex/Radix dependencies out of the test path entirely.
 */
import { describe, expect, test } from "bun:test";
import { filterScreens } from "./screen-filter";
import { TEMPO_SCREENS, type TempoScreen } from "./tempo-nav";

const screens: readonly TempoScreen[] = TEMPO_SCREENS;

describe("filterScreens · empty query", () => {
  test("returns the input list unchanged for empty string", () => {
    expect(filterScreens(screens, "").length).toBe(screens.length);
  });
  test("returns the input list unchanged for whitespace-only query", () => {
    expect(filterScreens(screens, "   ").length).toBe(screens.length);
  });
});

describe("filterScreens · matching", () => {
  test("matches by title (case-insensitive)", () => {
    const result = filterScreens(screens, "today");
    expect(result.some((s) => s.slug === "today")).toBe(true);
    expect(result.every((s) => s.title.toLowerCase().includes("today") || s.slug.toLowerCase().includes("today") || s.category.toLowerCase().includes("today"))).toBe(true);
  });

  test("matches by slug", () => {
    const result = filterScreens(screens, "settings-prefs");
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((s) => s.slug === "settings-prefs")).toBe(true);
  });

  test("matches by category (e.g. 'Settings')", () => {
    const result = filterScreens(screens, "Settings");
    // Every Settings-category screen should appear, plus any title/slug that
    // contains 'Settings'.
    const settingsByCat = screens.filter((s) => s.category === "Settings");
    expect(result.length).toBeGreaterThanOrEqual(settingsByCat.length);
    for (const s of settingsByCat) {
      expect(result.includes(s), `missing settings screen: ${s.slug}`).toBe(true);
    }
  });

  test("returns empty array for a definite non-match", () => {
    expect(filterScreens(screens, "qzzz-nope")).toHaveLength(0);
  });
});

describe("filterScreens · order preservation", () => {
  test("preserves the original list ordering", () => {
    const original = TEMPO_SCREENS.map((s) => s.slug);
    const filtered = filterScreens(screens, "").map((s) => s.slug);
    expect(filtered).toEqual(original);
  });

  test("preserves relative ordering for narrowed result", () => {
    const filtered = filterScreens(screens, "settings");
    const originalIndices = filtered.map((s) => TEMPO_SCREENS.indexOf(s));
    const sorted = [...originalIndices].sort((a, b) => a - b);
    expect(originalIndices).toEqual(sorted);
  });
});

describe("filterScreens · sanity for required QA screens", () => {
  const required = ["today", "brain-dump", "coach", "plan", "billing", "onboarding", "settings"];
  for (const q of required) {
    test(`searching "${q}" returns at least one result`, () => {
      expect(filterScreens(screens, q).length).toBeGreaterThan(0);
    });
  }
});
