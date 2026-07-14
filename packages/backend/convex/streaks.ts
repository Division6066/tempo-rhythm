import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";
import { liveOnly } from "./lib/soft_delete";

/**
 * Current streak summary derived from habits (max `currentStreak` across the user's habits).
 */
export const getCurrent = query({
  args: {},
  returns: v.object({
    streakCount: v.number(),
    longestAmongHabits: v.number(),
    habitCount: v.number(),
  }),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const habits = liveOnly(
      await ctx.db
        .query("habits")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect(),
    );
    const streakCount =
      habits.length === 0 ? 0 : Math.max(...habits.map((h) => h.currentStreak));
    const longestAmongHabits =
      habits.length === 0 ? 0 : Math.max(...habits.map((h) => h.longestStreak));
    return {
      streakCount,
      longestAmongHabits,
      habitCount: habits.length,
    };
  },
});
