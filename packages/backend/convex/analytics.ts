import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";
import { liveOnly } from "./lib/soft_delete";

/**
 * Aggregated counts for dashboard and analytics screens.
 *
 * HARD_RULES §10 / Convex rule `no-date-now-in-queries`:
 * the caller passes `todayStartMs` and `todayEndMs` derived from the user's
 * local calendar day. We never call `Date.now()` inside the query body.
 */
export const overview = query({
  args: {
    todayStartMs: v.optional(v.number()),
    todayEndMs: v.optional(v.number()),
  },
  returns: v.object({
    tasksTotal: v.number(),
    taskTodo: v.number(),
    taskDone: v.number(),
    tasksDueToday: v.number(),
    notesTotal: v.number(),
    notesPinned: v.number(),
    habitsTotal: v.number(),
    goalsActive: v.number(),
    goalsTotal: v.number(),
    memoriesTotal: v.number(),
    coachSessionsTotal: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const [tasks, notes, habits, goals, memories, conversations] = await Promise.all([
      ctx.db
        .query("tasks")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect()
        .then(liveOnly),
      ctx.db
        .query("notes")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect()
        .then(liveOnly),
      ctx.db
        .query("habits")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect()
        .then(liveOnly),
      ctx.db
        .query("goals")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect()
        .then(liveOnly),
      ctx.db
        .query("memories")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect()
        .then(liveOnly),
      ctx.db
        .query("conversations")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect()
        .then(liveOnly),
    ]);

    const taskTodo = tasks.filter((t) => t.status === "todo" || t.status === "in_progress").length;
    const taskDone = tasks.filter((t) => t.status === "done").length;
    const notesPinned = notes.filter((n) => n.pinned).length;
    const goalsActive = goals.filter((g) => g.status === "active").length;

    let tasksDueToday = 0;
    if (args.todayStartMs !== undefined && args.todayEndMs !== undefined) {
      const startMs = args.todayStartMs;
      const endMs = args.todayEndMs;
      tasksDueToday = tasks.filter(
        (t) =>
          t.dueAt !== undefined &&
          t.dueAt >= startMs &&
          t.dueAt < endMs &&
          t.status !== "done" &&
          t.status !== "cancelled",
      ).length;
    }

    return {
      tasksTotal: tasks.length,
      taskTodo,
      taskDone,
      tasksDueToday,
      notesTotal: notes.length,
      notesPinned,
      habitsTotal: habits.length,
      goalsActive,
      goalsTotal: goals.length,
      memoriesTotal: memories.length,
      coachSessionsTotal: conversations.length,
    };
  },
});
