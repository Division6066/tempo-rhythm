import { describe, expect, test } from "bun:test";
import {
  createSafeActionDispatcher,
  demoPageSpec,
  renderPageSpecToHtml,
  validatePageSpec,
} from "../../apps/web/components/page-spec/PageSpecRenderer";

describe("PageSpecRenderer", () => {
  test("renders task, calendar, and habit views from a valid JSON spec", () => {
    const result = validatePageSpec(demoPageSpec);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.message);
    }

    const html = renderPageSpecToHtml(result.spec);

    expect(html).toContain("JSON Renderer Prototype");
    expect(html).toContain("Task view");
    expect(html).toContain("Pay rent");
    expect(html).toContain("Calendar view");
    expect(html).toContain("Planning reset");
    expect(html).toContain("Habit view");
    expect(html).toContain("Drink water");
  });

  test("renders markdown as safe text without executing embedded HTML", () => {
    const result = validatePageSpec({
      version: 1,
      title: "Safe markdown",
      blocks: [
        {
          id: "intro",
          type: "markdown",
          markdown: "## Focus\n<script>alert('nope')</script>\n- **Small** step",
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.message);
    }

    const html = renderPageSpecToHtml(result.spec);

    expect(html).toContain("Focus");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(&#x27;nope&#x27;)&lt;/script&gt;");
  });

  test("invalid specs fail safely with a calm fallback instead of throwing", () => {
    const invalidSpec = {
      version: 1,
      title: "Unsafe",
      blocks: [{ id: "bad", type: "iframe", src: "https://example.com" }],
    };

    const result = validatePageSpec(invalidSpec);
    expect(result.ok).toBe(false);

    const html = renderPageSpecToHtml(invalidSpec);

    expect(html).toContain("We could not render this page spec safely.");
    expect(html).toContain("unsupported block type");
    expect(html).not.toContain("iframe");
  });

  test("safe action dispatcher only routes allowlisted Convex mutations", async () => {
    const calls: Array<{ mutation: string; args: unknown }> = [];
    const dispatch = createSafeActionDispatcher({
      "tasks.toggleCompletion": async (args) => {
        calls.push({ mutation: "tasks.toggleCompletion", args });
        return { ok: true };
      },
      "habits.completeToday": async (args) => {
        calls.push({ mutation: "habits.completeToday", args });
        return { ok: true };
      },
    });

    await dispatch({
      type: "convex.mutation",
      mutation: "tasks.toggleCompletion",
      args: { taskId: "task_123" },
    });

    expect(calls).toEqual([
      { mutation: "tasks.toggleCompletion", args: { taskId: "task_123" } },
    ]);

    await expect(
      dispatch({
        type: "convex.mutation",
        mutation: "window.alert",
        args: { message: "nope" },
      }),
    ).rejects.toThrow(/not allowlisted/i);
  });
});
