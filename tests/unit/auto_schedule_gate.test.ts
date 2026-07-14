import { describe, expect, test } from "bun:test";
import type { Doc, Id, TableNames } from "../../convex/_generated/dataModel";
import {
  type AutoScheduleGateDb,
  type AutoScheduleProposalInsert,
  type AutoScheduleProposalPatch,
  type CalendarEventInsert,
  confirmAutoScheduleProposal,
  createAutoScheduleProposalOnly,
} from "../../convex/calendar";

type InsertRecord =
  | { table: "autoScheduleProposals"; doc: AutoScheduleProposalInsert }
  | { table: "calendarEvents"; doc: CalendarEventInsert };

function id<TableName extends TableNames>(value: string) {
  return value as Id<TableName>;
}

const userId = id<"users">("users:alice");
const taskId = id<"tasks">("tasks:pay-rent");
const proposalId = id<"autoScheduleProposals">("autoScheduleProposals:proposal-1");
const calendarEventId = id<"calendarEvents">("calendarEvents:event-1");

function task(overrides: Partial<Doc<"tasks">> = {}): Doc<"tasks"> {
  return {
    _id: taskId,
    _creationTime: 1,
    userId,
    title: "Pay rent",
    description: "Before the end of the day",
    status: "todo",
    priority: "high",
    dueAt: 1_800_000,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

function pendingProposal(overrides: Partial<Doc<"autoScheduleProposals">> = {}) {
  return {
    _id: proposalId,
    _creationTime: 2,
    userId,
    taskId,
    status: "pending",
    title: "Pay rent",
    description: "Before the end of the day",
    proposedStartAt: 1_800_000,
    proposedEndAt: 3_600_000,
    durationMinutes: 30,
    reason: "Uses the task's due time as the suggested calendar slot.",
    createdAt: 10,
    updatedAt: 10,
    ...overrides,
  } satisfies Doc<"autoScheduleProposals">;
}

class FakeGateDb implements AutoScheduleGateDb {
  readonly inserts: InsertRecord[] = [];
  readonly patches: Array<{ id: Id<"autoScheduleProposals">; patch: AutoScheduleProposalPatch }> = [];

  async insert(
    table: "autoScheduleProposals",
    doc: AutoScheduleProposalInsert,
  ): Promise<Id<"autoScheduleProposals">>;
  async insert(table: "calendarEvents", doc: CalendarEventInsert): Promise<Id<"calendarEvents">>;
  async insert(
    table: "autoScheduleProposals" | "calendarEvents",
    doc: AutoScheduleProposalInsert | CalendarEventInsert,
  ): Promise<Id<"autoScheduleProposals"> | Id<"calendarEvents">> {
    if (table === "autoScheduleProposals") {
      this.inserts.push({ table, doc: doc as AutoScheduleProposalInsert });
      return proposalId;
    }

    this.inserts.push({ table, doc: doc as CalendarEventInsert });
    return calendarEventId;
  }

  async patch(idToPatch: Id<"autoScheduleProposals">, patch: AutoScheduleProposalPatch) {
    this.patches.push({ id: idToPatch, patch });
  }
}

describe("auto-schedule proposal gate", () => {
  test("auto-schedule creates only a pending proposal", async () => {
    const db = new FakeGateDb();

    const result = await createAutoScheduleProposalOnly(
      db,
      task(),
      userId,
      { preferredStartAt: 7_200_000, durationMinutes: 45 },
      1_000,
    );

    expect(result).toBe(proposalId);
    expect(db.inserts).toHaveLength(1);
    expect(db.patches).toHaveLength(0);
    expect(db.inserts[0]?.table).toBe("autoScheduleProposals");
    expect(db.inserts.some((insert) => insert.table === "calendarEvents")).toBe(false);

    const proposal = db.inserts[0];
    expect(proposal?.doc).toMatchObject({
      userId,
      taskId,
      status: "pending",
      title: "Pay rent",
      proposedStartAt: 7_200_000,
      proposedEndAt: 9_900_000,
      durationMinutes: 45,
    });
  });

  test("confirmation writes the calendar event and marks the proposal accepted", async () => {
    const db = new FakeGateDb();

    const result = await confirmAutoScheduleProposal(
      db,
      pendingProposal(),
      task(),
      userId,
      5_000,
    );

    expect(result).toBe(calendarEventId);
    expect(db.inserts).toHaveLength(1);
    expect(db.inserts[0]).toEqual({
      table: "calendarEvents",
      doc: {
        userId,
        taskId,
        title: "Pay rent",
        description: "Before the end of the day",
        startAt: 1_800_000,
        endAt: 3_600_000,
        source: "auto_schedule",
        createdAt: 5_000,
        updatedAt: 5_000,
      },
    });
    expect(db.patches).toEqual([
      {
        id: proposalId,
        patch: {
          status: "accepted",
          calendarEventId,
          updatedAt: 5_000,
        },
      },
    ]);
  });

  test("handled proposals cannot be confirmed again", async () => {
    const db = new FakeGateDb();

    await expect(
      confirmAutoScheduleProposal(
        db,
        pendingProposal({ status: "accepted", calendarEventId }),
        task(),
        userId,
        5_000,
      ),
    ).rejects.toThrow(/already handled/i);
    expect(db.inserts).toHaveLength(0);
    expect(db.patches).toHaveLength(0);
  });
});
