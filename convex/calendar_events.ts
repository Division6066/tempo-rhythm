import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

const calendarEventReturn = v.object({
  _id: v.id("calendarEvents"),
  _creationTime: v.number(),
  userId: v.id("users"),
  taskId: v.optional(v.id("tasks")),
  title: v.string(),
  notes: v.optional(v.string()),
  source: v.union(
    v.literal("manual"),
    v.literal("task"),
    v.literal("auto_schedule_proposal"),
  ),
  status: v.union(
    v.literal("confirmed"),
    v.literal("proposed"),
    v.literal("cancelled"),
  ),
  startAt: v.number(),
  endAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

const proposalReturn = v.object({
  title: v.string(),
  startAt: v.number(),
  endAt: v.number(),
  reason: v.string(),
});

type TaskScheduleState = {
  userId: string;
  status: string;
  deletedAt?: number;
};

type CalendarVisibilityState = {
  endAt: number;
  status: string;
};

export function assertValidRange(startAt: number, endAt: number) {
  if (endAt <= startAt) {
    throw new Error("Calendar block must end after it starts.");
  }
}

export function isVisibleInRange(
  event: CalendarVisibilityState,
  rangeStartMs: number,
): boolean {
  return event.endAt > rangeStartMs && event.status !== "cancelled";
}

export function isSchedulableTaskForUser(
  task: TaskScheduleState | null,
  userId: string,
): boolean {
  return (
    task !== null &&
    task.userId === userId &&
    task.deletedAt === undefined &&
    task.status !== "cancelled"
  );
}

export function isActiveTodoTask(task: { status: string; deletedAt?: number }): boolean {
  return task.status === "todo" && task.deletedAt === undefined;
}

export function assertPositiveDurationMinutes(durationMinutes: number) {
  if (durationMinutes <= 0) {
    throw new Error("Proposal duration must be positive.");
  }
}

export const list = query({
  args: {
    startMs: v.number(),
    endMs: v.number(),
  },
  returns: v.array(calendarEventReturn),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await ctx.db
      .query("calendarEvents")
      .withIndex("by_userId_deletedAt_startAt", (q) =>
        q
          .eq("userId", user._id)
          .eq("deletedAt", undefined)
          .lt("startAt", args.endMs),
      )
      .collect()
      .then((rows) =>
        rows
          .filter((event) => isVisibleInRange(event, args.startMs))
          .sort((a, b) => a.startAt - b.startAt),
      );
  },
});

export const createBlock = mutation({
  args: {
    title: v.string(),
    notes: v.optional(v.string()),
    startAt: v.number(),
    endAt: v.number(),
  },
  returns: v.id("calendarEvents"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const title = args.title.trim();
    if (!title) {
      throw new Error("Calendar block needs a title.");
    }
    assertValidRange(args.startAt, args.endAt);

    const now = Date.now();
    return await ctx.db.insert("calendarEvents", {
      userId: user._id,
      title,
      notes: args.notes?.trim(),
      source: "manual",
      status: "confirmed",
      startAt: args.startAt,
      endAt: args.endAt,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const scheduleTask = mutation({
  args: {
    taskId: v.id("tasks"),
    startAt: v.number(),
    endAt: v.number(),
  },
  returns: v.id("calendarEvents"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || !isSchedulableTaskForUser(task, user._id)) {
      throw new Error("Task not found");
    }
    assertValidRange(args.startAt, args.endAt);

    const now = Date.now();
    const eventId = await ctx.db.insert("calendarEvents", {
      userId: user._id,
      taskId: task._id,
      title: task.title,
      notes: task.description,
      source: "task",
      status: "confirmed",
      startAt: args.startAt,
      endAt: args.endAt,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(task._id, { dueAt: args.startAt, updatedAt: now });
    return eventId;
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
      throw new Error("Calendar block not found");
    }
    assertValidRange(args.startAt, args.endAt);

    const now = Date.now();
    await ctx.db.patch(args.eventId, {
      startAt: args.startAt,
      endAt: args.endAt,
      updatedAt: now,
    });
    if (event.taskId) {
      const task = await ctx.db.get(event.taskId);
      if (task && isSchedulableTaskForUser(task, user._id)) {
        await ctx.db.patch(task._id, { dueAt: args.startAt, updatedAt: now });
      }
    }
    return args.eventId;
  },
});

export const previewAutoSchedule = query({
  args: {
    startAt: v.number(),
    durationMinutes: v.number(),
  },
  returns: v.array(proposalReturn),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    assertPositiveDurationMinutes(args.durationMinutes);
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId_status", (q) => q.eq("userId", user._id).eq("status", "todo"))
      .collect();

    return tasks
      .filter(isActiveTodoTask)
      .slice(0, 3)
      .map((task, index) => {
        const startAt = args.startAt + index * args.durationMinutes * 60 * 1000;
        return {
          title: task.title,
          startAt,
          endAt: startAt + args.durationMinutes * 60 * 1000,
          reason: "Proposal only. Nothing changes until you accept it.",
        };
      });
  },
});
