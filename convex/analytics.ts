import { query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

/** Aggregated counts for dashboard and analytics screens. */
export const overview = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const [tasks, notes, habits, goals, memories, conversations] = await Promise.all([
      ctx.db
        .query("tasks")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("notes")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("habits")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("goals")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("memories")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("conversations")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect(),
    ]);

    const taskTodo = tasks.filter((t) => t.status === "todo" || t.status === "in_progress").length;
    const taskDone = tasks.filter((t) => t.status === "done").length;
    const notesPinned = notes.filter((n) => n.pinned).length;
    const goalsActive = goals.filter((g) => g.status === "active").length;

    const now = Date.now();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = startOfDay.getTime() + 24 * 60 * 60 * 1000;
    const tasksDueToday = tasks.filter(
      (t) =>
        t.dueAt !== undefined &&
        t.dueAt >= startOfDay.getTime() &&
        t.dueAt < endOfDay &&
        t.status !== "done" &&
        t.status !== "cancelled",
    ).length;

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
