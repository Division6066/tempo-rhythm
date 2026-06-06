/**
 * TodayTaskList accessibility tests.
 *
 * Renders a list of three sample tasks (typical Today payload) and asserts:
 *   - the section has a labelled heading id (`aria-labelledby`).
 *   - each toggle button has an aria-label containing the task title.
 *   - the empty state is announced as text content, not just a graphic.
 *   - "show 3 of N" overflow link goes to /tasks.
 */
import { describe, expect, mock, test } from "bun:test";
import { createElement } from "react";
import { audit, attr, errorIssues, formatIssues, render, visibleText } from "./a11y";

mock.module("convex/react", () => ({
  useMutation: () => async () => undefined,
  useAction: () => async () => undefined,
  useQuery: () => undefined,
  useConvexAuth: () => ({ isAuthenticated: false, isLoading: false }),
}));

mock.module("@/convex/_generated/api", () => ({
  api: { tasks: { toggleCompletion: "mockToggle" } },
}));

const { TodayTaskList } = await import("@/components/today/TodayTaskList");

const sampleTasks = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    _id: `task-${i + 1}` as never,
    title: `Sample task ${i + 1}`,
    description: i === 0 ? "first task description" : undefined,
    status: "todo" as const,
    priority: (["low", "medium", "high"] as const)[i % 3],
  }));

describe("TodayTaskList · empty state", () => {
  test("announces 'Nothing on the plan yet' when tasks=[]", () => {
    const rendered = render(createElement(TodayTaskList, { tasks: [] }));
    const text = visibleText(rendered.html);
    expect(text).toContain("Nothing on the plan yet");
  });

  test("structural a11y audit passes (empty)", () => {
    const rendered = render(createElement(TodayTaskList, { tasks: [] }));
    const errors = errorIssues(audit(rendered));
    expect(errors, formatIssues(errors)).toEqual([]);
  });
});

describe("TodayTaskList · with tasks", () => {
  test("renders an h2 heading and section", () => {
    const rendered = render(createElement(TodayTaskList, { tasks: sampleTasks(3) }));
    const sections = rendered.tags.get("section") ?? [];
    const h2s = rendered.tags.get("h2") ?? [];
    expect(sections.length).toBeGreaterThanOrEqual(1);
    expect(h2s.length).toBeGreaterThanOrEqual(1);
    expect(visibleText(h2s[0])).toContain("Today");
  });

  test("section has aria-labelledby pointing at the heading", () => {
    const rendered = render(createElement(TodayTaskList, { tasks: sampleTasks(3) }));
    const sections = rendered.tags.get("section") ?? [];
    const labelledBy = attr(sections[0] ?? "", "aria-labelledby");
    expect(labelledBy, "section must have aria-labelledby").toBeTruthy();
    const h2s = rendered.tags.get("h2") ?? [];
    const headingId = attr(h2s[0] ?? "", "id");
    expect(headingId).toBe(labelledBy ?? "");
  });

  test("each task toggle button has an aria-label with the task title", () => {
    const tasks = sampleTasks(3);
    const rendered = render(createElement(TodayTaskList, { tasks }));
    const buttons = rendered.tags.get("button") ?? [];
    expect(buttons.length).toBe(3);
    for (let i = 0; i < tasks.length; i++) {
      const labels = buttons.map((b) => attr(b, "aria-label"));
      const expected = `Mark ${tasks[i].title} complete`;
      expect(
        labels.some((l) => l === expected),
        `expected aria-label "${expected}" on a button`,
      ).toBe(true);
    }
  });

  test("structural a11y audit passes (with tasks)", () => {
    const rendered = render(createElement(TodayTaskList, { tasks: sampleTasks(3) }));
    const errors = errorIssues(audit(rendered));
    expect(errors, formatIssues(errors)).toEqual([]);
  });

  test("overflow link goes to /tasks when more than 3 tasks open", () => {
    const rendered = render(createElement(TodayTaskList, { tasks: sampleTasks(7) }));
    const links = rendered.tags.get("a") ?? [];
    const tasksLink = links.find((l) => attr(l, "href") === "/tasks");
    expect(tasksLink, "expected an overflow link to /tasks").toBeTruthy();
  });

  test("'all done' state announced when every task is done", () => {
    const tasks = sampleTasks(3).map((t) => ({ ...t, status: "done" as const }));
    const rendered = render(createElement(TodayTaskList, { tasks }));
    expect(visibleText(rendered.html)).toContain("All open tasks for today are done.");
  });

  test("priority labels are rendered as text (screen reader friendly)", () => {
    const tasks = [
      { _id: "a" as never, title: "High thing", status: "todo" as const, priority: "high" as const },
      { _id: "b" as never, title: "Med thing", status: "todo" as const, priority: "medium" as const },
      { _id: "c" as never, title: "Low thing", status: "todo" as const, priority: "low" as const },
    ];
    const rendered = render(createElement(TodayTaskList, { tasks }));
    const text = visibleText(rendered.html);
    expect(text).toContain("High");
    expect(text).toContain("Medium");
    expect(text).toContain("Low");
  });
});
