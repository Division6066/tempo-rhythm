import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./_helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return folders.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  },
});

export const get = query({
  args: { id: v.id("folders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const folder = await ctx.db.get(args.id);
    if (!folder || folder.userId !== userId) return null;
    return folder;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    parentFolderId: v.optional(v.id("folders")),
    icon: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db.insert("folders", {
      userId,
      name: args.name,
      description: args.description,
      parentFolderId: args.parentFolderId,
      icon: args.icon,
      sortOrder: args.sortOrder,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("folders"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const folder = await ctx.db.get(args.id);
    if (!folder || folder.userId !== userId) throw new Error("Not found");
    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const reorder = mutation({
  args: { folderIds: v.array(v.id("folders")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    for (let i = 0; i < args.folderIds.length; i++) {
      const folder = await ctx.db.get(args.folderIds[i]);
      if (!folder || folder.userId !== userId) continue;
      await ctx.db.patch(args.folderIds[i], { sortOrder: i });
    }
  },
});

export const remove = mutation({
  args: { id: v.id("folders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const folder = await ctx.db.get(args.id);
    if (!folder || folder.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
