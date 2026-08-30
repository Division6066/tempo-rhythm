import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { requireUser } from "./lib/requireUser";
import { liveOnly, softDeletePatch } from "./lib/soft_delete";

export type MemorySector = "semantic" | "episodic" | "procedural" | "emotional" | "general";

const sectorValidator = v.union(
  v.literal("semantic"),
  v.literal("episodic"),
  v.literal("procedural"),
  v.literal("emotional"),
  v.literal("general"),
);

export const queryMemories = query({
  args: {
    sector: v.optional(sectorValidator),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const memories = liveOnly(
      await ctx.db
        .query("memories")
        .withIndex("by_userId_salience", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect(),
    );

    let filtered = args.sector
      ? memories.filter((m) => m.sector === args.sector)
      : memories;

    filtered.sort((a, b) => {
      if (b.salience !== a.salience) {
        return b.salience - a.salience;
      }
      return b.lastAccessed - a.lastAccessed;
    });

    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

export const addMemory = mutation({
  args: {
    content: v.string(),
    sector: v.optional(sectorValidator),
    salience: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("memories"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    return ctx.db.insert("memories", {
      userId: user._id,
      content: args.content,
      sector: args.sector || "general",
      salience: args.salience ?? 0.5,
      decayRate: 0.1,
      lastAccessed: now,
      accessCount: 0,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateSalience = mutation({
  args: {
    memoryId: v.id("memories"),
    salience: v.number(),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const memory = await ctx.db.get(args.memoryId);
    if (!memory || memory.userId !== user._id || memory.deletedAt !== undefined) {
      throw new Error("Memory not found or access denied");
    }

    const clampedSalience = Math.max(0.1, Math.min(1.0, args.salience));
    const now = Date.now();

    await ctx.db.patch(args.memoryId, {
      salience: clampedSalience,
      lastAccessed: now,
      accessCount: memory.accessCount + 1,
      updatedAt: now,
    });

    return { success: true };
  },
});

export const deleteMemory = mutation({
  args: {
    memoryId: v.id("memories"),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const memory = await ctx.db.get(args.memoryId);
    if (!memory || memory.userId !== user._id || memory.deletedAt !== undefined) {
      throw new Error("Memory not found or access denied");
    }

    await ctx.db.patch(args.memoryId, softDeletePatch());
    return { success: true };
  },
});

export const decayMemories = action({
  args: {},
  returns: v.object({ success: v.boolean(), updated: v.number() }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const memories = await ctx.runQuery(api.memories.queryMemories, {});
    const now = Date.now();
    let updated = 0;

    for (const memory of memories) {
      const daysSinceAccess = (now - memory.lastAccessed) / (1000 * 60 * 60 * 24);

      if (daysSinceAccess > 1) {
        const newSalience = Math.max(
          0.1,
          memory.salience * (1 - memory.decayRate * daysSinceAccess),
        );

        if (newSalience < memory.salience) {
          await ctx.runMutation(api.memories.updateSalience, {
            memoryId: memory._id,
            salience: newSalience,
          });
          updated++;
        }
      }
    }

    return { success: true, updated };
  },
});

/**
 * Extract memories from conversation text.
 * NOTE: Legacy AI path still present in this module; prefer Mistral via
 * `lib/ai_router` in a follow-up. Auth gate is enforced here.
 */
export const extractMemories = action({
  args: {
    content: v.string(),
    save: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const aiApiKey = process.env.AI_API_KEY;
    const aiProvider = process.env.AI_PROVIDER || "gemini";
    const aiModel = process.env.AI_MODEL || "gemini-2.5-flash";

    if (!aiApiKey) {
      throw new Error("AI not configured. Please set AI_API_KEY in Convex dashboard.");
    }

    const extractionPrompt = `Analyze this conversation and extract important facts, preferences, and information worth remembering about the user.

Return a JSON array of memories, each with:
- content: The fact or information to remember
- sector: One of "semantic" (facts/knowledge), "episodic" (events/experiences), "procedural" (how to do things), "emotional" (feelings/preferences), or "general"
- salience: Importance from 0.1 to 1.0

Only extract genuinely useful information. Return [] if nothing worth remembering.
Return ONLY valid JSON array, no markdown or explanation.

Conversation:
${args.content}`;

    let apiUrl: string;
    let headers: Record<string, string>;
    let body: Record<string, unknown>;

    if (aiProvider === "gemini") {
      apiUrl =
        "https://generativelanguage.googleapis.com/v1beta/models/" +
        aiModel +
        ":generateContent";
      headers = {
        "Content-Type": "application/json",
      };
      body = {
        contents: [
          {
            parts: [{ text: extractionPrompt }],
          },
        ],
      };
      apiUrl += `?key=${aiApiKey}`;
    } else {
      apiUrl = "https://api.openai.com/v1/chat/completions";
      headers = {
        Authorization: `Bearer ${aiApiKey}`,
        "Content-Type": "application/json",
      };
      body = {
        model: aiModel,
        messages: [{ role: "user", content: extractionPrompt }],
      };
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("AI extraction failed");
    }

    let extractedText: string;
    if (aiProvider === "gemini") {
      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    } else {
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      extractedText = data.choices?.[0]?.message?.content || "[]";
    }

    let memories: Array<{
      content: string;
      sector: MemorySector;
      salience: number;
    }> = [];

    try {
      const cleanJson = extractedText.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanJson) as Array<Record<string, unknown>>;
      memories = parsed.map((m) => ({
        content: typeof m.content === "string" ? m.content : "",
        sector: (typeof m.sector === "string" ? m.sector : "general") as MemorySector,
        salience: Math.max(
          0.1,
          Math.min(1.0, typeof m.salience === "number" ? m.salience : 0.5),
        ),
      }));
    } catch (e) {
      console.error("Failed to parse extracted memories:", e);
      return { success: false, data: [] };
    }

    if (args.save && memories.length > 0) {
      for (const memory of memories) {
        await ctx.runMutation(api.memories.addMemory, {
          content: memory.content,
          sector: memory.sector,
          salience: memory.salience,
        });
      }
    }

    return { success: true, data: memories };
  },
});

export const getMemoryStats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    sectors: v.array(
      v.object({
        sector: sectorValidator,
        count: v.number(),
        avgSalience: v.number(),
      }),
    ),
    avgSalience: v.number(),
  }),
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const memories = liveOnly(
      await ctx.db
        .query("memories")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect(),
    );

    const sectors: MemorySector[] = [
      "semantic",
      "episodic",
      "procedural",
      "emotional",
      "general",
    ];
    const stats = sectors.map((sector) => {
      const sectorMemories = memories.filter((m) => m.sector === sector);
      return {
        sector,
        count: sectorMemories.length,
        avgSalience:
          sectorMemories.length > 0
            ? sectorMemories.reduce((sum, m) => sum + m.salience, 0) /
              sectorMemories.length
            : 0,
      };
    });

    return {
      total: memories.length,
      sectors: stats,
      avgSalience:
        memories.length > 0
          ? memories.reduce((sum, m) => sum + m.salience, 0) / memories.length
          : 0,
    };
  },
});
