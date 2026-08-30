import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

const USER_OWNED_TABLES = [
  "tasks",
  "notes",
  "habits",
  "goals",
  "memories",
] as const;

type UserOwnedTable = (typeof USER_OWNED_TABLES)[number];

/** Soft-delete a user account and owned rows (GDPR grace window per HARD_RULES §9). */
export async function softDeleteUserAccount(
  ctx: MutationCtx,
  userId: Id<"users">,
  now = Date.now(),
): Promise<{ deletedCount: number }> {
  const user = await ctx.db.get(userId);
  if (!user) {
    return { deletedCount: 0 };
  }

  let deletedCount = 0;

  if (user.deletedAt === undefined) {
    await ctx.db.patch(userId, {
      deletedAt: now,
      isActive: false,
      updatedAt: now,
    });
    deletedCount += 1;
  }

  for (const table of USER_OWNED_TABLES) {
    deletedCount += await softDeleteRowsByUserId(ctx, table, userId, now);
  }

  const conversations = await ctx.db
    .query("conversations")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  for (const conversation of conversations) {
    if (conversation.deletedAt === undefined) {
      await ctx.db.patch(conversation._id, { deletedAt: now, updatedAt: now });
      deletedCount += 1;
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
      .collect();

    for (const message of messages) {
      if (message.deletedAt === undefined) {
        await ctx.db.patch(message._id, { deletedAt: now });
        deletedCount += 1;
      }
    }
  }

  const subscription = await ctx.db
    .query("subscriptionStates")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();

  if (subscription && subscription.status !== "inactive") {
    await ctx.db.patch(subscription._id, {
      status: "inactive",
      updatedAt: now,
    });
    deletedCount += 1;
  }

  return { deletedCount };
}

async function softDeleteRowsByUserId(
  ctx: MutationCtx,
  table: UserOwnedTable,
  userId: Id<"users">,
  now: number,
): Promise<number> {
  const rows = await ctx.db
    .query(table)
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  let count = 0;
  for (const row of rows) {
    if (row.deletedAt === undefined) {
      await ctx.db.patch(row._id, { deletedAt: now, updatedAt: now });
      count += 1;
    }
  }
  return count;
}
