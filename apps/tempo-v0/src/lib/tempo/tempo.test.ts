import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeCoachNudge } from "./coach.ts";
import { computeInsightsSummary } from "./insights.ts";
import { filterTasksDueInRange } from "./filters.ts";
import { buildSeed } from "./seed.ts";

const DAY = 24 * 60 * 60 * 1000;
const todayStart = 10 * DAY;
const todayEnd = 11 * DAY;
const weekStart = 6 * DAY;

describe("computeInsightsSummary", () => {
  it("empty inputs produce an all-zero summary", () => {
    const s = computeInsightsSummary({
      tasks: [],
      habits: [],
      goals: [],
      todayStartMs: todayStart,
      todayEndMs: todayEnd,
      weekStartMs: weekStart,
    });
    assert.equal(s.tasksOpen, 0);
    assert.equal(s.tasksOverdue, 0);
    assert.equal(s.goalsAverageProgressPercent, 0);
  });

  it("due-today vs overdue boundaries match convex", () => {
    const s = computeInsightsSummary({
      tasks: [
        { status: "todo", priority: "medium", dueAt: todayStart - 1, updatedAt: todayStart },
        { status: "todo", priority: "medium", dueAt: todayStart, updatedAt: todayStart },
        { status: "todo", priority: "medium", dueAt: todayEnd - 1, updatedAt: todayStart },
        { status: "todo", priority: "medium", dueAt: todayEnd, updatedAt: todayStart },
        { status: "todo", priority: "medium", updatedAt: todayStart },
      ],
      habits: [],
      goals: [],
      todayStartMs: todayStart,
      todayEndMs: todayEnd,
      weekStartMs: weekStart,
    });
    assert.equal(s.tasksOpen, 5);
    assert.equal(s.tasksDueToday, 2);
    assert.equal(s.tasksOverdue, 1);
  });
});

describe("filterTasksDueInRange", () => {
  it("uses a half-open window", () => {
    const rows = [
      { dueAt: 10, status: "todo" },
      { dueAt: 20, status: "todo" },
      { dueAt: 15, status: "cancelled" },
    ];
    const result = filterTasksDueInRange(rows, 10, 20);
    assert.equal(result.length, 1);
    assert.equal(result[0]?.dueAt, 10);
  });
});

describe("computeCoachNudge", () => {
  it("surfaces an avoided task without being asked", () => {
    const nudge = computeCoachNudge({
      tasks: [
        {
          _id: "t1",
          userId: "u",
          title: "Email the lecturer",
          status: "todo",
          priority: "high",
          createdAt: 0,
          updatedAt: 0,
          avoidCount: 5,
          dueAt: todayStart - DAY,
        },
      ],
      memories: [],
      habits: [],
      dismissedNudgeIds: [],
      now: todayStart,
    });
    assert.ok(nudge);
    assert.equal(nudge?.kind, "avoided");
    assert.equal(nudge?.relatedTaskId, "t1");
  });
});

describe("seed", () => {
  it("builds a day with overdue and today work", () => {
    const seed = buildSeed(todayStart + 12 * 60 * 60 * 1000);
    assert.ok(seed.tasks.length > 8);
    assert.ok(seed.memories.some((m) => m.metadata?.kind === "avoidance"));
    assert.ok(seed.memories.some((m) => m.metadata?.kind === "commitment"));
  });
});
