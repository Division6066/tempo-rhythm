import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import {
  groupTasksByKanbanStatus,
  nextKanbanStatus,
  projectIdFromSlug,
  tasksForProject,
} from "./taskKanban";

describe("task kanban leftover", () => {
  test("advances status one column without wrapping past set-aside", () => {
    expect(nextKanbanStatus("todo")).toBe("in_progress");
    expect(nextKanbanStatus("in_progress")).toBe("done");
    expect(nextKanbanStatus("done")).toBe("cancelled");
    expect(nextKanbanStatus("cancelled")).toBe("cancelled");
  });

  test("groups live tasks into the four board columns", () => {
    const groups = groupTasksByKanbanStatus([
      { id: "a", status: "todo" as const },
      { id: "b", status: "done" as const },
      { id: "c", status: "todo" as const },
    ]);
    expect(groups.todo.map((task) => task.id)).toEqual(["a", "c"]);
    expect(groups.done.map((task) => task.id)).toEqual(["b"]);
    expect(groups.in_progress).toEqual([]);
    expect(groups.cancelled).toEqual([]);
  });

  test("reuses the landed project slug id, including irregular names", () => {
    expect(projectIdFromSlug("Home Reset")).toBe("home-reset");
    expect(projectIdFromSlug("  Café / Desk!! ")).toBe("caf-desk");
    expect(
      tasksForProject(
        [
          { id: "keep", projectId: "home-reset" },
          { id: "other", projectId: "elsewhere" },
        ],
        "home-reset",
      ).map((task) => task.id),
    ).toEqual(["keep"]);
  });
});

describe("TaskKanbanBoard leftover wiring", () => {
  test("moves cards with tasks.update and filters by project slug", () => {
    const source = readFileSync(
      join(import.meta.dir, "../components/tasks/TaskKanbanBoard.tsx"),
      "utf8",
    );
    expect(source).toContain("api.tasks.list");
    expect(source).toContain("api.tasks.update");
    expect(source).toContain("tasksForProject");
    expect(source).not.toContain("api.tasks.moveStatus");
    expect(source).not.toContain("recurrence");
  });

  test("project list links to the kanban board", () => {
    const source = readFileSync(
      join(import.meta.dir, "../components/tasks/TaskViewsScreen.tsx"),
      "utf8",
    );
    expect(source).toContain("/kanban");
    expect(source).toContain("projectSlug");
  });
});
