import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  confirmAutoScheduleProposal,
  createAutoScheduleProposalOnly,
  rejectAutoScheduleProposal,
} from "./lib/autoScheduleGate";
import { requireUser } from "./lib/requireUser";

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

const autoScheduleProposalStatusValidator = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("rejected"),
);

const autoScheduleProposalReturnValidator = v.object({
  _id: v.id("autoScheduleProposals"),
  _creationTime: v.number(),
  userId: v.id("users"),
  taskId: v.id("tasks"),
  status: autoScheduleProposalStatusValidator,
  title: v.string(),
  description: v.optional(v.string()),
  proposedStartAt: v.number(),
  proposedEndAt: v.number(),
  durationMinutes: v.number(),
  reason: v.string(),
  calendarEventId: v.optional(v.id("calendarEvents")),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

export const listAutoScheduleProposals = query({
  args: {
    status: v.optional(autoScheduleProposalStatusValidator),
  },
  returns: v.array(autoScheduleProposalReturnValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const status = args.status;
    if (status !== undefined) {
      return await ctx.db
        .query("autoScheduleProposals")
        .withIndex("by_userId_status_deletedAt", (q) =>
          q.eq("userId", user._id).eq("status", status).eq("deletedAt", undefined),
        )
        .collect();
    }

    return await ctx.db
      .query("autoScheduleProposals")
      .withIndex("by_userId_deletedAt", (q) => q.eq("userId", user._id).eq("deletedAt", undefined))
      .collect();
  },
});

export const proposeAutoSchedule = mutation({
  args: {
    taskId: v.id("tasks"),
    preferredStartAt: v.optional(v.number()),
    dayStartAt: v.optional(v.number()),
    durationMinutes: v.optional(v.number()),
  },
  returns: v.id("autoScheduleProposals"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    return await createAutoScheduleProposalOnly(
      ctx.db,
      task,
      user._id,
      {
        preferredStartAt: args.preferredStartAt,
        dayStartAt: args.dayStartAt,
        durationMinutes: args.durationMinutes,
      },
      Date.now(),
    );
  },
});

export const confirmAutoSchedule = mutation({
  args: {
    proposalId: v.id("autoScheduleProposals"),
  },
  returns: v.id("calendarEvents"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      throw new Error("Auto-schedule proposal not found");
    }

    const task = await ctx.db.get(proposal.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    return await confirmAutoScheduleProposal(ctx.db, proposal, task, user._id, Date.now());
  },
});

export const rejectAutoSchedule = mutation({
  args: {
    proposalId: v.id("autoScheduleProposals"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      throw new Error("Auto-schedule proposal not found");
    }

    await rejectAutoScheduleProposal(ctx.db, proposal, user._id, Date.now());
    return null;
  },
});
