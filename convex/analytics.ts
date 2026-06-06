import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";
import { filterLive } from "./lib/softDelete";

/**
 * Aggregated counts for dashboard and analytics screens.
 *
 * HARD_RULES §10 / Convex rule `no-date-now-in-queries`:
 * the caller passes `todayStartMs` and `todayEndMs` derived from the user's
 * local calendar day. We never call `Date.now()` inside the query body —
 * that would break Convex caching + reactivity and make the result depend
 * on wall-clock time rather than data.
 *
 * If the caller omits both window args, `tasksDueToday` is reported as 0.
 * The web and mobile apps should compute the window from
 * `profiles.timezone` (see HARD_RULES §9) before calling.
 */
export const overview = query({
  args: {
    /** Epoch ms at the start of the user's local "today". Pair with `todayEndMs`. */
    todayStartMs: v.optional(v.number()),
    /** Epoch ms at the end of the user's local "today" (exclusive). Pair with `todayStartMs`. */
    todayEndMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
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

    const liveTasks = filterLive(tasks);
    const liveNotes = filterLive(notes);
    const liveHabits = filterLive(habits);
    const liveGoals = filterLive(goals);
    const liveMemories = filterLive(memories);
    const liveConversations = filterLive(conversations);

    const taskTodo = liveTasks.filter((t) => t.status === "todo" || t.status === "in_progress").length;
    const taskDone = liveTasks.filter((t) => t.status === "done").length;
    const notesPinned = liveNotes.filter((n) => n.pinned).length;
    const goalsActive = liveGoals.filter((g) => g.status === "active").length;

    let tasksDueToday = 0;
    if (args.todayStartMs !== undefined && args.todayEndMs !== undefined) {
      const startMs = args.todayStartMs;
      const endMs = args.todayEndMs;
      tasksDueToday = liveTasks.filter(
        (t) =>
          t.dueAt !== undefined &&
          t.dueAt >= startMs &&
          t.dueAt < endMs &&
          t.status !== "done" &&
          t.status !== "cancelled",
      ).length;
    }

    return {
      tasksTotal: liveTasks.length,
      taskTodo,
      taskDone,
      tasksDueToday,
      notesTotal: liveNotes.length,
      notesPinned,
      habitsTotal: liveHabits.length,
      goalsActive,
      goalsTotal: liveGoals.length,
      memoriesTotal: liveMemories.length,
      coachSessionsTotal: liveConversations.length,
    };
  },
});
