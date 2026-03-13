import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, memoriesTable } from "@workspace/db";
import {
  ListMemoriesResponse,
  CreateMemoryBody,
  DeleteMemoryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/memories", async (_req, res): Promise<void> => {
  const memories = await db.select().from(memoriesTable).orderBy(memoriesTable.createdAt);
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

export default router;
