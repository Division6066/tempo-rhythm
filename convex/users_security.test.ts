import { describe, expect, test } from "bun:test";

async function readConvexFile(name: string) {
  return Bun.file(new URL(`./${name}`, import.meta.url)).text();
}

describe("users API security contracts", () => {
  test("RevenueCat subscription sync is internal-only", async () => {
    const usersSource = await readConvexFile("users.ts");
    const revenuecatSource = await readConvexFile("revenuecat.ts");

    expect(usersSource).toContain("export const updateSubscriptionStatus = internalMutation({");
    expect(usersSource).not.toContain("export const updateSubscriptionStatus = mutation({");
    expect(revenuecatSource).toContain("ctx.runMutation(internal.users.updateSubscriptionStatus");
  });

  test("clients cannot directly grant paid entitlements", async () => {
    const usersSource = await readConvexFile("users.ts");
    const premiumGateSource = await Bun.file(
      new URL("../apps/web/components/payments/PremiumGate.tsx", import.meta.url),
    ).text();
    const navbarSource = await Bun.file(
      new URL("../apps/web/components/Navbar.tsx", import.meta.url),
    ).text();

    expect(usersSource).not.toContain("export const updateUserType = mutation({");
    expect(premiumGateSource).not.toContain("api.users.updateUserType");
    expect(navbarSource).not.toContain("api.users.updateUserType");
  });

  test("legacy user bootstrap and broad user reads are not public APIs", async () => {
    const usersSource = await readConvexFile("users.ts");

    expect(usersSource).not.toContain("export const createOrUpdateUser = mutation({");
    expect(usersSource).not.toContain("export const getById = query({");
    expect(usersSource).not.toContain("export const listActive = query({");
  });

  test("account deletion resolves the current app user and soft-deletes user data", async () => {
    const usersSource = await readConvexFile("users.ts");

    expect(usersSource).toContain("const user = await requireUser(ctx);");
    expect(usersSource).toContain("await softDeleteUserOwnedRows(ctx, user._id, now);");
    expect(usersSource).toContain("deletedAt: now");
    expect(usersSource).not.toContain("ctx.db.delete(user._id)");
    expect(usersSource).not.toContain("q.eq(q.field(\"_id\"), userId)");
  });

  test("coach and memory modules use the shared active-user resolver", async () => {
    const conversationsSource = await readConvexFile("conversations.ts");
    const messagesSource = await readConvexFile("messages.ts");
    const memoriesSource = await readConvexFile("memories.ts");

    for (const source of [conversationsSource, messagesSource, memoriesSource]) {
      expect(source).toContain("requireUser");
      expect(source).not.toContain(".query('users')");
      expect(source).not.toContain(".withIndex('by_email'");
      expect(source).not.toContain("ctx.db.delete");
    }
  });

  test("core user-owned modules filter and soft-delete rows", async () => {
    const tasksSource = await readConvexFile("tasks.ts");
    const notesSource = await readConvexFile("notes.ts");
    const habitsSource = await readConvexFile("habits.ts");
    const goalsSource = await readConvexFile("goals.ts");

    for (const source of [tasksSource, notesSource, habitsSource, goalsSource]) {
      expect(source).toContain("deletedAt");
      expect(source).toContain("by_userId_deletedAt");
      expect(source).not.toContain("ctx.db.delete");
    }
  });

  test("derived user-owned reads and coach writes ignore soft-deleted rows", async () => {
    const coachSource = await readConvexFile("coach.ts");
    const analyticsSource = await readConvexFile("analytics.ts");
    const streaksSource = await readConvexFile("streaks.ts");

    expect(coachSource).toContain("conv.deletedAt !== undefined");
    for (const source of [analyticsSource, streaksSource]) {
      expect(source).toContain("by_userId_deletedAt");
      expect(source).toContain("deletedAt");
      expect(source).not.toContain("withIndex(\"by_userId\"");
    }
  });
});
