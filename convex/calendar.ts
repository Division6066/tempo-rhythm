import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

const calendarEventValidator = v.object({
  _id: v.id("calendarEvents"),
  _creationTime: v.number(),
  userId: v.id("users"),
  taskId: v.optional(v.id("tasks")),
  title: v.string(),
  startAt: v.number(),
  endAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
  isOwnedByCurrentUser: v.boolean(),
});

export const listRange = query({
  args: {
    startMs: v.number(),
    endMs: v.number(),
  },
  returns: v.array(calendarEventValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const rows = await ctx.db
      .query("calendarEvents")
      .withIndex("by_userId_startAt", (q) =>
        q.eq("userId", user._id).gte("startAt", args.startMs).lt("startAt", args.endMs),
      )
      .collect();

    return rows
      .filter((event) => event.deletedAt === undefined)
      .sort((a, b) => a.startAt - b.startAt)
      .map((event) => ({
        ...event,
        isOwnedByCurrentUser: event.userId === user._id,
      }));
  },
});

export const createFromTask = mutation({
  args: {
    taskId: v.id("tasks"),
    startAt: v.number(),
    durationMinutes: v.optional(v.number()),
  },
  returns: v.id("calendarEvents"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id || task.deletedAt !== undefined) {
      throw new Error("Task not found");
    }

    const durationMinutes = args.durationMinutes ?? 30;
    if (durationMinutes <= 0) {
      throw new Error("Calendar block duration must be positive.");
    }

    const now = Date.now();
    return await ctx.db.insert("calendarEvents", {
      userId: user._id,
      taskId: task._id,
      title: task.title,
      startAt: args.startAt,
      endAt: args.startAt + durationMinutes * 60_000,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const reschedule = mutation({
  args: {
    eventId: v.id("calendarEvents"),
    startAt: v.number(),
    endAt: v.number(),
  },
  returns: v.id("calendarEvents"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event || event.userId !== user._id || event.deletedAt !== undefined) {
      throw new Error("Calendar event not found");
    }
    if (args.endAt <= args.startAt) {
      throw new Error("Calendar block must end after it starts.");
    }

    await ctx.db.patch(args.eventId, {
      startAt: args.startAt,
      endAt: args.endAt,
      updatedAt: Date.now(),
    });
    return args.eventId;
  },
});
