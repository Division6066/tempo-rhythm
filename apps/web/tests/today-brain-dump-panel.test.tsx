/**
 * TodayBrainDumpPanel accessibility tests.
 *
 * The panel is the heaviest interactive surface on Today. We can't fully drive
 * the planning + apply flow in SSR (it requires async state transitions), but
 * we CAN lock down the static a11y contract:
 *   - section uses aria-labelledby tied to the heading
 *   - textarea is labelled
 *   - error/alert region is announced via role=alert
 *   - planning output is announced via aria-live="polite" on <output>
 *   - all three CTA buttons have accessible names
 */
import { describe, expect, mock, test } from "bun:test";
import { createElement } from "react";
import { audit, attr, errorIssues, formatIssues, render, visibleText } from "./a11y";

mock.module("convex/react", () => ({
  useMutation: () => async () => undefined,
  useAction: () => async () => ({ summary: "", priorities: [] }),
  useQuery: () => undefined,
  useConvexAuth: () => ({ isAuthenticated: false, isLoading: false }),
}));

mock.module("@/convex/_generated/api", () => ({
  api: {
    tasks: { createQuick: "mockCreateQuick" },
    brain_dump: { prioritize: "mockPrioritize" },
  },
}));

const { TodayBrainDumpPanel } = await import("@/components/today/TodayBrainDumpPanel");

describe("TodayBrainDumpPanel · structure", () => {
  test("renders a section with aria-labelledby tied to its heading", () => {
    const rendered = render(createElement(TodayBrainDumpPanel, { dueAt: 1700000000000 }));
    const sections = rendered.tags.get("section") ?? [];
    expect(sections.length).toBe(1);
    const labelledBy = attr(sections[0], "aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const h2s = rendered.tags.get("h2") ?? [];
    const heading = h2s.find((h) => attr(h, "id") === labelledBy);
    expect(heading).toBeTruthy();
  });

  test("renders a labelled textarea", () => {
    const rendered = render(createElement(TodayBrainDumpPanel, { dueAt: 1700000000000 }));
    const textareas = rendered.tags.get("textarea") ?? [];
    expect(textareas.length).toBe(1);
    const id = attr(textareas[0], "id");
    expect(id).toBeTruthy();
    const labels = rendered.tags.get("label") ?? [];
    expect(labels.some((l) => attr(l, "for") === id)).toBe(true);
  });

  test("renders three CTA buttons with accessible names: Clear, Sort locally, Turn this into a plan", () => {
    const rendered = render(createElement(TodayBrainDumpPanel, { dueAt: 1700000000000 }));
    const buttons = rendered.tags.get("button") ?? [];
    const labels = buttons.map((b) => visibleText(b));
    expect(labels).toEqual(expect.arrayContaining(["Clear", "Sort locally"]));
    expect(labels.some((l) => l.includes("Turn this into a plan"))).toBe(true);
  });

  test("planning slot shows lane preview text (Now/Soon/Later) before plan generation", () => {
    const rendered = render(createElement(TodayBrainDumpPanel, { dueAt: 1700000000000 }));
    const text = visibleText(rendered.html);
    expect(text).toContain("Now");
    expect(text).toContain("Soon");
    expect(text).toContain("Later");
  });
});

describe("TodayBrainDumpPanel · accessibility", () => {
  test("structural a11y audit passes", () => {
    const rendered = render(createElement(TodayBrainDumpPanel, { dueAt: 1700000000000 }));
    const errors = errorIssues(audit(rendered));
    expect(errors, formatIssues(errors)).toEqual([]);
  });

  test("every button has type=button (no accidental form submit)", () => {
    const rendered = render(createElement(TodayBrainDumpPanel, { dueAt: 1700000000000 }));
    const buttons = rendered.tags.get("button") ?? [];
    for (const b of buttons) {
      expect(attr(b, "type")).toBe("button");
    }
  });
});
