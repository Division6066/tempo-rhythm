import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

const maxCalendarRangeMs = 32 * 24 * 60 * 60 * 1000;

const calendarEventValidator = v.object({
  _id: v.id("calendarEvents"),
  _creationTime: v.number(),
  title: v.string(),
  startsAtMs: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const listInRange = query({
  args: {
    startMs: v.number(),
    endMs: v.number(),
  },
  returns: v.array(calendarEventValidator),
  handler: async (ctx, args) => {
    if (args.endMs <= args.startMs) {
      throw new Error("Calendar range must end after it starts.");
    }
    if (args.endMs - args.startMs > maxCalendarRangeMs) {
      throw new Error("Calendar range is too large.");
    }

    const user = await requireUser(ctx);
    return await ctx.db
      .query("calendarEvents")
      .withIndex("by_userId_deletedAt_startsAtMs", (q) =>
        q
          .eq("userId", user._id)
          .eq("deletedAt", undefined)
          .gte("startsAtMs", args.startMs)
          .lt("startsAtMs", args.endMs),
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    startsAtMs: v.number(),
  },
  returns: v.id("calendarEvents"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const title = args.title.trim();
    if (!title) {
      throw new Error("Give the event a gentle label first.");
    }

    const now = Date.now();
    return await ctx.db.insert("calendarEvents", {
      userId: user._id,
      title,
      startsAtMs: args.startsAtMs,
      createdAt: now,
      updatedAt: now,
    });
  },
});
