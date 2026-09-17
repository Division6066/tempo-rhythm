import type { Doc, Id } from "../_generated/dataModel";

const DEFAULT_AUTO_SCHEDULE_DURATION_MINUTES = 30;
const MAX_AUTO_SCHEDULE_DURATION_MINUTES = 12 * 60;
const MS_PER_MINUTE = 60_000;

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

/** Landed calendarEvents shape — title + startsAtMs only. */
export type CalendarEventInsert = {
  userId: Id<"users">;
  title: string;
  startsAtMs: number;
  createdAt: number;
  updatedAt: number;
};

export type AutoScheduleAcceptPatch = {
  status: "accepted";
  calendarEventId: Id<"calendarEvents">;
  updatedAt: number;
};

export type AutoScheduleRejectPatch = {
  status: "rejected";
  updatedAt: number;
};

export type AutoScheduleProposalPatch = AutoScheduleAcceptPatch | AutoScheduleRejectPatch;

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
    reason:
      task.dueAt === proposedStartAt
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
    title: proposal.title,
    startsAtMs: proposal.proposedStartAt,
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

export async function rejectAutoScheduleProposal(
  db: AutoScheduleGateDb,
  proposal: Doc<"autoScheduleProposals">,
  userId: Id<"users">,
  now: number,
) {
  if (proposal.userId !== userId || proposal.deletedAt !== undefined) {
    throw new Error("Auto-schedule proposal not found");
  }
  if (proposal.status !== "pending") {
    throw new Error("Auto-schedule proposal was already handled.");
  }

  await db.patch(proposal._id, {
    status: "rejected",
    updatedAt: now,
  });
}
