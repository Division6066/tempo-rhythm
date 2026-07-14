import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

const DEFAULT_AUTO_SCHEDULE_DURATION_MINUTES = 30;
const MAX_AUTO_SCHEDULE_DURATION_MINUTES = 12 * 60;
const MS_PER_MINUTE = 60_000;

const autoScheduleProposalStatusValidator = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("rejected"),
);

const calendarEventReturnValidator = v.object({
  _id: v.id("calendarEvents"),
  _creationTime: v.number(),
  userId: v.id("users"),
  taskId: v.optional(v.id("tasks")),
  title: v.string(),
  description: v.optional(v.string()),
  startAt: v.number(),
  endAt: v.number(),
  source: v.union(v.literal("manual"), v.literal("auto_schedule")),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

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

export type AutoScheduleProposalInsert = {
  userId: Id<"users">;
  taskId: Id<"tasks">;
  status: "pending";
  title: string;
  description?: string;
  proposedStartAt: number;
  proposedEndAt: number;
  durationMinutes: number;
  reason: string;
  createdAt: number;
  updatedAt: number;
};

export type CalendarEventInsert = {
  userId: Id<"users">;
  taskId: Id<"tasks">;
  title: string;
  description?: string;
  startAt: number;
  endAt: number;
  source: "auto_schedule";
  createdAt: number;
  updatedAt: number;
};

export type AutoScheduleProposalPatch = {
  status: "accepted";
  calendarEventId: Id<"calendarEvents">;
  updatedAt: number;
};

export type AutoScheduleGateDb = {
  insert(
    table: "autoScheduleProposals",
    doc: AutoScheduleProposalInsert,
  ): Promise<Id<"autoScheduleProposals">>;
  insert(table: "calendarEvents", doc: CalendarEventInsert): Promise<Id<"calendarEvents">>;
  patch(id: Id<"autoScheduleProposals">, patch: AutoScheduleProposalPatch): Promise<void>;
};

export type AutoSchedulePlacementArgs = {
  preferredStartAt?: number;
  dayStartAt?: number;
  durationMinutes?: number;
};

function assertPositiveTimestamp(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a valid future time.`);
  }
}

function normalizeDurationMinutes(durationMinutes: number | undefined) {
  const duration = durationMinutes ?? DEFAULT_AUTO_SCHEDULE_DURATION_MINUTES;
  if (
    !Number.isFinite(duration) ||
    !Number.isInteger(duration) ||
    duration <= 0 ||
    duration > MAX_AUTO_SCHEDULE_DURATION_MINUTES
  ) {
    throw new Error("Duration must be between 1 minute and 12 hours.");
  }
  return duration;
}

export function buildAutoScheduleProposalInsert(
  task: Doc<"tasks">,
  userId: Id<"users">,
  args: AutoSchedulePlacementArgs,
  now: number,
): AutoScheduleProposalInsert {
  if (task.userId !== userId || task.deletedAt !== undefined) {
    throw new Error("Task not found");
  }
  if (task.status === "cancelled") {
    throw new Error("Cancelled tasks cannot be auto-scheduled.");
  }

  const durationMinutes = normalizeDurationMinutes(args.durationMinutes);
  const proposedStartAt = args.preferredStartAt ?? task.dueAt ?? args.dayStartAt ?? now;
  assertPositiveTimestamp(proposedStartAt, "Proposed start");
  const proposedEndAt = proposedStartAt + durationMinutes * MS_PER_MINUTE;

  return {
    userId,
    taskId: task._id,
    status: "pending",
    title: task.title,
    description: task.description,
    proposedStartAt,
    proposedEndAt,
    durationMinutes,
    reason: task.dueAt === proposedStartAt
      ? "Uses the task's due time as the suggested calendar slot."
      : "Suggests the requested calendar slot for this task.",
    createdAt: now,
    updatedAt: now,
  };
}

export async function createAutoScheduleProposalOnly(
  db: AutoScheduleGateDb,
  task: Doc<"tasks">,
  userId: Id<"users">,
  args: AutoSchedulePlacementArgs,
  now: number,
) {
  const proposal = buildAutoScheduleProposalInsert(task, userId, args, now);
  return await db.insert("autoScheduleProposals", proposal);
}

export function buildCalendarEventInsertFromProposal(
  proposal: Doc<"autoScheduleProposals">,
  task: Doc<"tasks">,
  userId: Id<"users">,
  now: number,
): CalendarEventInsert {
  if (proposal.userId !== userId || proposal.deletedAt !== undefined) {
    throw new Error("Auto-schedule proposal not found");
  }
  if (task.userId !== userId || task._id !== proposal.taskId || task.deletedAt !== undefined) {
    throw new Error("Task not found");
  }
  if (proposal.status !== "pending") {
    throw new Error("Auto-schedule proposal was already handled.");
  }

  return {
    userId,
    taskId: proposal.taskId,
    title: proposal.title,
    description: proposal.description,
    startAt: proposal.proposedStartAt,
    endAt: proposal.proposedEndAt,
    source: "auto_schedule",
    createdAt: now,
    updatedAt: now,
  };
}

export async function confirmAutoScheduleProposal(
  db: AutoScheduleGateDb,
  proposal: Doc<"autoScheduleProposals">,
  task: Doc<"tasks">,
  userId: Id<"users">,
  now: number,
) {
  const event = buildCalendarEventInsertFromProposal(proposal, task, userId, now);
  const calendarEventId = await db.insert("calendarEvents", event);
  await db.patch(proposal._id, {
    status: "accepted",
    calendarEventId,
    updatedAt: now,
  });
  return calendarEventId;
}

export const list = query({
  args: {
    startAt: v.number(),
    endAt: v.number(),
  },
  returns: v.array(calendarEventReturnValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await ctx.db
      .query("calendarEvents")
      .withIndex("by_userId_deletedAt_startAt", (q) =>
        q
          .eq("userId", user._id)
          .eq("deletedAt", undefined)
          .gte("startAt", args.startAt)
          .lt("startAt", args.endAt),
      )
      .collect();
  },
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
