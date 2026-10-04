import { describe, expect, test } from "bun:test";

/**
 * Route-render smoke for the Tempo mobile surfaces that already exist.
 *
 * #208 added a Hebrew product shell (`/home`, `/breathe`, `/move`, …) plus
 * Playwright + lockfile churn. That shell is a different app. bun:test also
 * cannot import `react-native` screens (Flow `typeof` in RN's entry). This
 * port keeps the coverage intent: every shipped (tempo) screen file must
 * exist and default-export a component so a missing route cannot silently
 * 404, and the stack must declare those siblings.
 */

const TEMPO_SCREENS = [
  ["today", "apps/mobile/app/(tempo)/(tabs)/today.tsx"],
  ["tasks", "apps/mobile/app/(tempo)/(tabs)/tasks.tsx"],
  ["notes", "apps/mobile/app/(tempo)/(tabs)/notes.tsx"],
  ["coach", "apps/mobile/app/(tempo)/(tabs)/coach.tsx"],
  ["calendar", "apps/mobile/app/(tempo)/calendar.tsx"],
  ["habits", "apps/mobile/app/(tempo)/habits.tsx"],
  ["journal", "apps/mobile/app/(tempo)/journal.tsx"],
  ["routines", "apps/mobile/app/(tempo)/routines.tsx"],
  ["movement", "apps/mobile/app/(tempo)/movement.tsx"],
  ["breathwork", "apps/mobile/app/(tempo)/breathwork.tsx"],
  ["session-player", "apps/mobile/app/(tempo)/session-player.tsx"],
  ["tracking", "apps/mobile/app/(tempo)/tracking.tsx"],
  ["settings", "apps/mobile/app/(tempo)/settings.tsx"],
  ["accessibility", "apps/mobile/app/(tempo)/accessibility.tsx"],
  ["templates", "apps/mobile/app/(tempo)/templates.tsx"],
  ["capture", "apps/mobile/app/(tempo)/capture.tsx"],
] as const;

describe("mobile tempo route smoke", () => {
  test.each([...TEMPO_SCREENS])("%s exists and default-exports a screen", async (_name, filePath) => {
    const source = await Bun.file(filePath).text();
    expect(source.length).toBeGreaterThan(0);
    expect(source).toMatch(/export default function \w+/);
  });

  test("tempo stack declares the sibling screens that already exist", async () => {
    const source = await Bun.file("apps/mobile/app/(tempo)/_layout.tsx").text();
    for (const name of [
      "(tabs)",
      "calendar",
      "habits",
      "journal",
      "routines",
      "movement",
      "breathwork",
      "session-player",
      "tracking",
      "settings",
      "accessibility",
      "templates",
      "capture",
    ]) {
      expect(source).toContain(`name="${name}"`);
    }
    expect(source).not.toContain('name="home"');
    expect(source).not.toContain('name="breathe"');
    expect(source).not.toContain('name="move"');
  });
});
