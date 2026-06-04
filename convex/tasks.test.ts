import { describe, expect, test } from "bun:test";
import { createQuick, listToday } from "./tasks";

type HandlerFunction = {
  _handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown>;
};

type FakeUser = {
  _id: string;
  email: string;
};

type FakeTask = {
  _id: string;
  userId: string;
  title: string;
  status: "todo" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high";
  dueAt?: number;
  createdAt: number;
  updatedAt: number;
};

function handler(fn: unknown) {
  return (fn as HandlerFunction)._handler;
}

async function withFixedNow<T>(now: number, run: () => Promise<T>) {
  const originalNow = Date.now;
  Date.now = () => now;
  try {
    return await run();
  } finally {
    Date.now = originalNow;
  }
}

function makeCreateQuickCtx(user: FakeUser, inserted: Array<{ table: string; value: Record<string, unknown> }>) {
  return {
    auth: {
      getUserIdentity: async () => ({ subject: `auth_account|${user._id}` }),
    },
    db: {
      normalizeId: (_table: "users", value: string) => (value === user._id ? value : null),
      get: async (id: string) => (id === user._id ? user : null),
      insert: async (table: string, value: Record<string, unknown>) => {
        inserted.push({ table, value });
        return "task_new";
      },
    },
  };
}

function makeListTodayCtx({
  user,
  tasks,
}: {
  user: FakeUser | null;
  tasks: FakeTask[];
}) {
  return {
    auth: {
      getUserIdentity: async () => (user ? { subject: `auth_account|${user._id}` } : null),
    },
    db: {
      get: async (id: string) => (user && id === user._id ? user : null),
      query: (_table: "tasks") => ({
        withIndex: (_index: "by_userId", build: (q: { eq: (field: string, value: string) => string }) => void) => {
          let requestedUserId = "";
          build({
            eq: (_field: string, value: string) => {
              requestedUserId = value;
              return value;
            },
          });
          return {
            collect: async () => tasks.filter((task) => task.userId === requestedUserId),
          };
        },
      }),
    },
  };
}

describe("createQuick", () => {
  test("trims the title and inserts a default todo due at the requested time", async () => {
    const now = new Date("2026-04-15T10:00:00.000Z").getTime();
    const user = { _id: "user_123", email: "user@example.com" };
    const inserted: Array<{ table: string; value: Record<string, unknown> }> = [];
    const ctx = makeCreateQuickCtx(user, inserted);

    const result = await withFixedNow(now, () =>
      handler(createQuick)(ctx, { title: "  Pay rent  ", dueAt: now + 60_000 }),
    );

    expect(result).toBe("task_new");
    expect(inserted).toEqual([
      {
        table: "tasks",
        value: {
          userId: user._id,
          title: "Pay rent",
          status: "todo",
          priority: "medium",
          dueAt: now + 60_000,
          createdAt: now,
          updatedAt: now,
        },
      },
    ]);
  });

  test("rejects whitespace-only titles before inserting a task", async () => {
    const user = { _id: "user_123", email: "user@example.com" };
    const inserted: Array<{ table: string; value: Record<string, unknown> }> = [];
    const ctx = makeCreateQuickCtx(user, inserted);

    await expect(handler(createQuick)(ctx, { title: "  \n\t  " })).rejects.toThrow(
      "Title cannot be empty.",
    );
    expect(inserted).toEqual([]);
  });

  test("caps very long quick-add titles to 280 characters with an ellipsis", async () => {
    const user = { _id: "user_123", email: "user@example.com" };
    const inserted: Array<{ table: string; value: Record<string, unknown> }> = [];
    const ctx = makeCreateQuickCtx(user, inserted);

    await handler(createQuick)(ctx, { title: "x".repeat(400) });

    const title = inserted[0]?.value.title;
    expect(typeof title).toBe("string");
    if (typeof title === "string") {
      expect(title.length).toBe(280);
      expect(title.endsWith("...")).toBe(true);
    }
  });
});

describe("listToday", () => {
  test("returns an empty list instead of throwing when there is no signed-in app user", async () => {
    const ctx = makeListTodayCtx({ user: null, tasks: [] });

    await expect(
      handler(listToday)(ctx, { dueFrom: 1_000, dueTo: 2_000 }),
    ).resolves.toEqual([]);
  });

  test("uses a half-open due window, excludes cancelled tasks, and sorts by due time", async () => {
    const user = { _id: "user_123", email: "user@example.com" };
    const dueFrom = 1_000;
    const dueTo = 2_000;
    const tasks: FakeTask[] = [
      makeTask({ _id: "end", userId: user._id, dueAt: dueTo }),
      makeTask({ _id: "late", userId: user._id, dueAt: dueTo - 1, title: "Last" }),
      makeTask({ _id: "cancelled", userId: user._id, dueAt: dueFrom + 1, status: "cancelled" }),
      makeTask({ _id: "start", userId: user._id, dueAt: dueFrom, title: "First" }),
      makeTask({ _id: "other-user", userId: "user_other", dueAt: dueFrom + 2 }),
      makeTask({ _id: "before", userId: user._id, dueAt: dueFrom - 1 }),
      makeTask({ _id: "no-due", userId: user._id, dueAt: undefined }),
    ];
    const ctx = makeListTodayCtx({ user, tasks });

    const result = await handler(listToday)(ctx, { dueFrom, dueTo });

    expect((result as FakeTask[]).map((task) => task._id)).toEqual(["start", "late"]);
  });
});

function makeTask(overrides: Partial<FakeTask> & { _id: string; userId: string }): FakeTask {
  return {
    title: "Task",
    status: "todo",
    priority: "medium",
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}
