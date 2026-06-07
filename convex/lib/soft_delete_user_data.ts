import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

/**
 * Soft-delete all user-owned rows for DSR/account deletion.
 * HARD_RULES §9 — user-visible data uses deletedAt, not hard delete.
 */
export async function softDeleteUserData(
  ctx: MutationCtx,
  userId: Id<"users">,
  now: number,
): Promise<number> {
  let deletedCount = 0;

  const tasks = await ctx.db
    .query("tasks")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const task of tasks) {
    if (task.deletedAt !== undefined) continue;
    await ctx.db.patch(task._id, { deletedAt: now, updatedAt: now });
    deletedCount += 1;
  }

  const notes = await ctx.db
    .query("notes")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const note of notes) {
    if (note.deletedAt !== undefined) continue;
    await ctx.db.patch(note._id, { deletedAt: now, updatedAt: now });
    deletedCount += 1;
  }

  const habits = await ctx.db
    .query("habits")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const habit of habits) {
    if (habit.deletedAt !== undefined) continue;
    await ctx.db.patch(habit._id, { deletedAt: now, updatedAt: now });
    deletedCount += 1;
  }

  const goals = await ctx.db
    .query("goals")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const goal of goals) {
    if (goal.deletedAt !== undefined) continue;
    await ctx.db.patch(goal._id, { deletedAt: now, updatedAt: now });
    deletedCount += 1;
  }

  const memories = await ctx.db
    .query("memories")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const memory of memories) {
    if (memory.deletedAt !== undefined) continue;
    await ctx.db.patch(memory._id, { deletedAt: now, updatedAt: now });
    deletedCount += 1;
  }

  const conversations = await ctx.db
    .query("conversations")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  for (const conversation of conversations) {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
      .collect();

    for (const message of messages) {
      if (message.deletedAt !== undefined) continue;
      await ctx.db.patch(message._id, { deletedAt: now });
      deletedCount += 1;
    }

    if (conversation.deletedAt === undefined) {
      await ctx.db.patch(conversation._id, { deletedAt: now, updatedAt: now });
      deletedCount += 1;
    }
  }

  const user = await ctx.db.get(userId);
  if (user && user.deletedAt === undefined) {
    await ctx.db.patch(userId, {
      deletedAt: now,
      isActive: false,
      updatedAt: now,
    });
    deletedCount += 1;
  }

  return deletedCount;
}
