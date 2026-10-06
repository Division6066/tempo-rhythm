import { describe, expect, test } from "bun:test";
import * as goals from "./goals";

function makeCtx(userId: string, goal: Record<string, unknown> | null) {
  return {
    auth: { getUserIdentity: async () => ({ subject: userId }) },
    db: {
      normalizeId: (table: string, id: string) => table === "users" && id === userId ? id : null,
      get: async (id: string) => id === userId ? { _id: userId } : goal,
      query: () => ({
        withIndex: () => ({ unique: async () => ({ _id: userId }) }),
      }),
    },
  } as any;
}

describe("goals.get", () => {
  test("returns the signed-in owner's goal", async () => {
    const goal = { _id: "goals:1", userId: "users:a", title: "Mine" };
    const result = await (goals.get as any)._handler(makeCtx("users:a", goal), {
      goalId: goal._id,
    });
    expect(result).toEqual(goal);
  });

  test("does not expose another user's goal", async () => {
    const goal = { _id: "goals:1", userId: "users:a", title: "Private" };
    const result = await (goals.get as any)._handler(makeCtx("users:b", goal), {
      goalId: goal._id,
    });
    expect(result).toBeNull();
  });
});
