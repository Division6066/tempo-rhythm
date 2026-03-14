import { Router, type IRouter } from "express";
import { eq, sql, ilike, and, lte } from "drizzle-orm";
import { db, memoriesTable } from "@workspace/db";
import type { Memory } from "@workspace/db";
import {
  ListMemoriesResponse,
  CreateMemoryBody,
  DeleteMemoryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

interface MemoryStats {
  tier: string;
  count: string;
  avg_decay: string;
  oldest: string;
  newest: string;
}

router.get("/memories", async (req, res): Promise<void> => {
  const tier = req.query.tier as string | undefined;
  const q = req.query.q as string | undefined;

  let conditions = [];
  if (tier) conditions.push(eq(memoriesTable.tier, tier));
  if (q) conditions.push(ilike(memoriesTable.content, `%${q}%`));

  let memories: Memory[];
  if (conditions.length > 0) {
    memories = await db.select().from(memoriesTable)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions))
      .orderBy(memoriesTable.createdAt);
  } else {
    memories = await db.select().from(memoriesTable).orderBy(memoriesTable.createdAt);
  }

  res.json(ListMemoriesResponse.parse(memories));
});

router.post("/memories", async (req, res): Promise<void> => {
  const parsed = CreateMemoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [memory] = await db.insert(memoriesTable).values(parsed.data).returning();
  res.status(201).json(memory);
});

router.delete("/memories/:id", async (req, res): Promise<void> => {
  const params = DeleteMemoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [memory] = await db.delete(memoriesTable).where(eq(memoriesTable.id, params.data.id)).returning();
  if (!memory) {
    res.status(404).json({ error: "Memory not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/memories/decay", async (_req, res): Promise<void> => {
  try {
    await db.execute(sql`
      UPDATE memories 
      SET decay = GREATEST(0, decay - 5)
      WHERE decay > 0
    `);

    const pruned = await db.delete(memoriesTable)
      .where(and(
        lte(memoriesTable.decay, 10),
        eq(memoriesTable.tier, "cold")
      ))
      .returning();

    res.json({ 
      message: "Decay applied (scale 0-100, step -5)",
      pruned: pruned.length,
    });
  } catch (err) {
    console.error("Memory decay error:", err);
    res.status(500).json({ error: "Decay operation failed", details: err instanceof Error ? err.message : String(err) });
  }
});

router.get("/memories/stats", async (_req, res): Promise<void> => {
  try {
    const result = await db.execute(sql`
      SELECT 
        tier,
        COUNT(*)::text as count,
        AVG(decay)::text as avg_decay,
        MIN(created_at)::text as oldest,
        MAX(created_at)::text as newest
      FROM memories
      GROUP BY tier
    `);
    const rows: MemoryStats[] = Array.isArray(result) ? result : (result as { rows: MemoryStats[] }).rows;
    res.json(rows);
  } catch (err) {
    console.error("Memory stats error:", err);
    res.status(500).json({ error: "Failed to fetch memory stats" });
  }
});

export default router;
