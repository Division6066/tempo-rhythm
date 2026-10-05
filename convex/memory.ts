import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

const SECTORS = ["semantic", "episodic", "procedural", "emotional", "general"] as const;
type Sector = (typeof SECTORS)[number];

const sectorValidator = v.union(
  v.literal("semantic"),
  v.literal("episodic"),
  v.literal("procedural"),
  v.literal("emotional"),
  v.literal("general"),
);

const memoryValidator = v.object({
  _id: v.id("memories"),
  content: v.string(),
  sector: sectorValidator,
  salience: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
  lastAccessed: v.number(),
});

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const CONTENT_MAX = 2000;

function clampLimit(limit: number | undefined, fallback = DEFAULT_LIMIT): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return fallback;
  }
  return Math.max(1, Math.min(MAX_LIMIT, Math.floor(limit)));
}

function toMemory(m: Doc<"memories">) {
  return {
    _id: m._id,
    content: m.content,
    sector: m.sector,
    salience: m.salience,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    lastAccessed: m.lastAccessed,
  };
}

async function liveMemories(ctx: QueryCtx, userId: Doc<"users">["_id"]) {
  const rows = await ctx.db
    .query("memories")
    .withIndex("by_userId_deletedAt", (q) => q.eq("userId", userId).eq("deletedAt", undefined))
    .collect();
  return rows.filter((m) => m.deletedAt === undefined);
}

function bySalience(a: Doc<"memories">, b: Doc<"memories">) {
  return b.salience - a.salience || b.updatedAt - a.updatedAt;
}

export const remember = mutation({
  args: { content: v.string(), sector: v.optional(sectorValidator) },
  returns: v.id("memories"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const content = args.content.trim();
    if (!content) {
      throw new Error("Write something to remember first.");
    }
    if (content.length > CONTENT_MAX) {
      throw new Error(`Keep a memory to ${CONTENT_MAX} characters or fewer.`);
    }
    const now = Date.now();
    return ctx.db.insert("memories", {
      userId: user._id,
      content,
      sector: args.sector ?? "general",
      salience: 0.5,
      decayRate: 0.01,
      lastAccessed: now,
      accessCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const recall = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  returns: v.array(memoryValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const needle = args.query.trim().toLowerCase();
    if (!needle) {
      return [];
    }
    const rows = await liveMemories(ctx, user._id);
    return rows
      .filter((m) => m.content.toLowerCase().includes(needle))
      .sort(bySalience)
      .slice(0, clampLimit(args.limit))
      .map(toMemory);
  },
});

export const list = query({
  args: { sector: v.optional(sectorValidator), limit: v.optional(v.number()) },
  returns: v.array(memoryValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const rows = await liveMemories(ctx, user._id);
    return rows
      .filter((m) => args.sector === undefined || m.sector === args.sector)
      .sort(bySalience)
      .slice(0, clampLimit(args.limit))
      .map(toMemory);
  },
});

export const context = query({
  args: { limit: v.optional(v.number()) },
  returns: v.object({ text: v.string(), count: v.number() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const rows = (await liveMemories(ctx, user._id))
      .sort(bySalience)
      .slice(0, clampLimit(args.limit, 10));
    return { text: rows.map((m) => `- ${m.content}`).join("\n"), count: rows.length };
  },
});

/** Soft delete (HARD_RULES §9). */
export const forget = mutation({
  args: { memoryId: v.id("memories") },
  returns: v.object({ success: v.literal(true) }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const m = await ctx.db.get(args.memoryId);
    if (!m || m.userId !== user._id || m.deletedAt !== undefined) {
      throw new Error("Memory not found");
    }
    const now = Date.now();
    await ctx.db.patch(m._id, { deletedAt: now, updatedAt: now });
    return { success: true as const };
  },
});

function isoDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Markdown, one section per sector. The person never sees JSON. */
export const exportAll = query({
  args: {},
  returns: v.object({
    filename: v.string(),
    exportedAt: v.number(),
    count: v.number(),
    markdown: v.string(),
  }),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const exportedAt = Date.now();
    const rows = (await liveMemories(ctx, user._id)).sort(bySalience);
    const sections: string[] = ["# Tempo memories", ""];
    for (const sector of SECTORS as readonly Sector[]) {
      const inSector = rows.filter((m) => m.sector === sector);
      if (inSector.length === 0) {
        continue;
      }
      sections.push(`## ${sector[0]?.toUpperCase()}${sector.slice(1)}`, "");
      for (const m of inSector) {
        sections.push(`- ${m.content.replace(/\s*\n\s*/g, " ")}`);
      }
      sections.push("");
    }
    if (rows.length === 0) {
      sections.push("No memories saved yet.", "");
    }
    return {
      filename: `tempo-memories-${isoDate(exportedAt)}.md`,
      exportedAt,
      count: rows.length,
      markdown: sections.join("\n"),
    };
  },
});
