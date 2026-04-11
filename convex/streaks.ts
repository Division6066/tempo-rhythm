import { query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

/**
 * Current streak summary derived from habits (max `currentStreak` across the user's habits).
 */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
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
