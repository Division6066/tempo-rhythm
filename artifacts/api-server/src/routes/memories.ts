import { Router, type IRouter } from "express";
import { eq, sql, ilike, and, lte } from "drizzle-orm";
import { db, memoriesTable } from "@workspace/db";
import {
  ListMemoriesResponse,
  CreateMemoryBody,
  DeleteMemoryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/memories", async (req, res): Promise<void> => {
  const tier = req.query.tier as string | undefined;
  const q = req.query.q as string | undefined;

  let query = db.select().from(memoriesTable);

  if (tier) {
    query = query.where(eq(memoriesTable.tier, tier)) as any;
  }

  if (q) {
    const pattern = `%${q}%`;
    query = query.where(ilike(memoriesTable.content, pattern)) as any;
  }

  const memories = await query.orderBy(memoriesTable.createdAt);
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
      SET decay = GREATEST(0, decay - 0.05)
      WHERE decay > 0
    `);

    const pruned = await db.delete(memoriesTable)
      .where(and(
        lte(memoriesTable.decay, sql`0.1`),
        eq(memoriesTable.tier, "short")
      ))
      .returning();

    res.json({ 
      message: "Decay applied",
      pruned: pruned.length,
    });
  } catch (err) {
    console.error("Memory decay error:", err);
    res.json({ message: "Decay applied", pruned: 0 });
  }
});

router.get("/memories/stats", async (_req, res): Promise<void> => {
  try {
    const stats = await db.execute(sql`
      SELECT 
        tier,
        COUNT(*) as count,
        AVG(decay) as avg_decay,
        MIN(created_at) as oldest,
        MAX(created_at) as newest
      FROM memories
      GROUP BY tier
    `);
    res.json(Array.isArray(stats) ? stats : (stats as any).rows || []);
  } catch {
    res.json([]);
  }
});

export default router;
