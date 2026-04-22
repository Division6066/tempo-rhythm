import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

/**
 * Journal is one row per user per local calendar date. `dateKey` is a
 * YYYY-MM-DD string derived on the client so it always respects the
 * user's timezone (HARD_RULES §5 — no Date.now() in queries).
 */

const moodValidator = v.union(
  v.literal("low"),
  v.literal("ok"),
  v.literal("good"),
);

export const getByDate = query({
  args: { dateKey: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const entry = await ctx.db
      .query("journalEntries")
      .withIndex("by_userId_dateKey", (q) =>
        q.eq("userId", user._id).eq("dateKey", args.dateKey),
      )
      .unique();
    if (!entry || entry.deletedAt !== undefined) {
      return null;
    }
    return entry;
  },
});

export const upsertByDate = mutation({
  args: {
    dateKey: v.string(),
    body: v.string(),
    mood: v.optional(moodValidator),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query("journalEntries")
      .withIndex("by_userId_dateKey", (q) =>
        q.eq("userId", user._id).eq("dateKey", args.dateKey),
      )
      .unique();

    if (existing && existing.deletedAt === undefined) {
      await ctx.db.patch(existing._id, {
        body: args.body,
        mood: args.mood ?? existing.mood,
        updatedAt: now,
      });
      return existing._id;
    }

    // If the row is soft-deleted, restore it by writing a new one and
    // ignoring the tombstoned row.
    return ctx.db.insert("journalEntries", {
      userId: user._id,
      dateKey: args.dateKey,
      body: args.body,
      mood: args.mood,
      createdAt: now,
      updatedAt: now,
    });
  },
});
