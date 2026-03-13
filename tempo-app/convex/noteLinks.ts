import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./_helpers";

export const listBySource = query({
  args: { sourceNoteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const links = await ctx.db
      .query("noteLinks")
      .withIndex("by_sourceNoteId", (q) => q.eq("sourceNoteId", args.sourceNoteId))
      .collect();
    return links.filter((l) => l.userId === userId);
  },
});

export const listBacklinks = query({
  args: { targetNoteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const links = await ctx.db
      .query("noteLinks")
      .withIndex("by_targetNoteId", (q) => q.eq("targetNoteId", args.targetNoteId))
      .collect();
    const filtered = links.filter((l) => l.userId === userId);
    const results = [];
    for (const link of filtered) {
      const note = await ctx.db.get(link.sourceNoteId);
      if (note) {
        results.push({ linkId: link._id, note });
      }
    }
    return results;
  },
});

export const syncLinks = mutation({
  args: { sourceNoteId: v.id("notes"), targetNoteIds: v.array(v.id("notes")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const existing = await ctx.db
      .query("noteLinks")
      .withIndex("by_sourceNoteId", (q) => q.eq("sourceNoteId", args.sourceNoteId))
      .collect();
    const existingFiltered = existing.filter((l) => l.userId === userId);

    const existingTargets = new Set(existingFiltered.map((l) => l.targetNoteId));
    const newTargets = new Set(args.targetNoteIds);

    for (const link of existingFiltered) {
      if (!newTargets.has(link.targetNoteId)) {
        await ctx.db.delete(link._id);
      }
    }

    for (const targetId of args.targetNoteIds) {
      if (!existingTargets.has(targetId)) {
        await ctx.db.insert("noteLinks", {
          userId,
          sourceNoteId: args.sourceNoteId,
          targetNoteId: targetId,
          createdAt: Date.now(),
        });
      }
    }
  },
});
