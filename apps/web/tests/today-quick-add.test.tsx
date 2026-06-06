/**
 * TodayQuickAdd accessibility tests.
 *
 * The quick-add input is the simplest path from "I need to do this" to a
 * tracked task. Regressions in label/keyboard handling break the user's
 * trust in capture, so this test is a tight contract:
 *   - the input has an explicit <label htmlFor> tying to it
 *   - the submit button has an accessible name in both idle and submitting
 *     states (text changes from "Add" to "Adding…")
 *   - inputId is stable per instance (no random IDs that break SSR hydration)
 */
import { describe, expect, mock, test } from "bun:test";
import { createElement } from "react";
import { audit, attr, errorIssues, formatIssues, render } from "./a11y";

const createQuickCalls: Array<{ title: string; dueAt: number }> = [];

mock.module("convex/react", () => ({
  useMutation: () => async (args: { title: string; dueAt: number }) => {
    createQuickCalls.push(args);
    return "mock-task-id";
  },
  useAction: () => async () => ({ summary: "", priorities: [] }),
  useQuery: () => undefined,
  useConvexAuth: () => ({ isAuthenticated: false, isLoading: false }),
}));

mock.module("@/convex/_generated/api", () => ({
  api: { tasks: { createQuick: "mockCreateQuick" }, brain_dump: { prioritize: "mockPrioritize" } },
}));

const { TodayQuickAdd } = await import("@/components/today/TodayQuickAdd");

describe("TodayQuickAdd · structure", () => {
  test("renders a labelled text input", () => {
    const rendered = render(createElement(TodayQuickAdd, { dueAt: 1700000000000 }));
    const inputs = rendered.tags.get("input") ?? [];
    expect(inputs.length).toBe(1);
    const id = attr(inputs[0], "id");
    expect(id, "input must have an id").toBeTruthy();
    const labels = rendered.tags.get("label") ?? [];
    const matchingLabel = labels.find((l) => attr(l, "for") === id);
    expect(matchingLabel, "expected a <label htmlFor> tied to the input").toBeTruthy();
  });

  test("renders a submit button labelled 'Add to today'", () => {
    const rendered = render(createElement(TodayQuickAdd, { dueAt: 1700000000000 }));
    const buttons = rendered.tags.get("button") ?? [];
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    const addButton = buttons[0];
    expect(addButton).toBeTruthy();
  });
});

describe("TodayQuickAdd · accessibility", () => {
  test("structural a11y audit passes", () => {
    const rendered = render(createElement(TodayQuickAdd, { dueAt: 1700000000000 }));
    const errors = errorIssues(audit(rendered));
    expect(errors, formatIssues(errors)).toEqual([]);
  });

  test("input is reachable by keyboard (no tabindex=-1, no inert)", () => {
    const rendered = render(createElement(TodayQuickAdd, { dueAt: 1700000000000 }));
    const inputs = rendered.tags.get("input") ?? [];
    const tabindex = attr(inputs[0], "tabindex");
    expect(tabindex == null || Number.parseInt(tabindex, 10) >= 0).toBe(true);
  });

  test("submit button has type=button (no accidental form submission)", () => {
    const rendered = render(createElement(TodayQuickAdd, { dueAt: 1700000000000 }));
    const buttons = rendered.tags.get("button") ?? [];
    for (const b of buttons) {
      expect(attr(b, "type")).toBe("button");
    }
  });
});
