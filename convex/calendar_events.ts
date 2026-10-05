import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";
import { isRestorable, undoUntil } from "./lib/softDelete";

const maxCalendarRangeMs = 32 * 24 * 60 * 60 * 1000;

const calendarEventValidator = v.object({
  _id: v.id("calendarEvents"),
  _creationTime: v.number(),
  userId: v.id("users"),
  title: v.string(),
  startsAtMs: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
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

export const update = mutation({
  args: {
    eventId: v.id("calendarEvents"),
    title: v.optional(v.string()),
    startsAtMs: v.optional(v.number()),
  },
  returns: v.id("calendarEvents"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event || event.userId !== user._id || event.deletedAt !== undefined) {
      throw new Error("Event not found");
    }
    const patch: { title?: string; startsAtMs?: number; updatedAt: number } = {
      updatedAt: Date.now(),
    };
    if (args.title !== undefined) {
      const title = args.title.trim();
      if (!title) {
        throw new Error("Give the event a gentle label first.");
      }
      patch.title = title;
    }
    if (args.startsAtMs !== undefined) patch.startsAtMs = args.startsAtMs;
    await ctx.db.patch(args.eventId, patch);
    return args.eventId;
  },
});

export const remove = mutation({
  args: { eventId: v.id("calendarEvents") },
  returns: v.object({ success: v.boolean(), undoUntilMs: v.number() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event || event.userId !== user._id || event.deletedAt !== undefined) {
      throw new Error("Event not found");
    }
    const now = Date.now();
    await ctx.db.patch(args.eventId, { deletedAt: now, updatedAt: now });
    return { success: true, undoUntilMs: undoUntil(now) };
  },
});

export const restore = mutation({
  args: { eventId: v.id("calendarEvents") },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event || event.userId !== user._id) {
      throw new Error("Event not found");
    }
    const now = Date.now();
    if (!isRestorable(event.deletedAt, now)) {
      return { success: false };
    }
    await ctx.db.patch(args.eventId, { deletedAt: undefined, updatedAt: now });
    return { success: true };
  },
});
