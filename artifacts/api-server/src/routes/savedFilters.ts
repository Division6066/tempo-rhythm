import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, savedFiltersTable } from "@workspace/db";
import {
  CreateSavedFilterBody,
  DeleteSavedFilterParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/saved-filters", async (_req, res): Promise<void> => {
  const filters = await db.select().from(savedFiltersTable).orderBy(savedFiltersTable.createdAt);
  res.json(filters);
});

router.post("/saved-filters", async (req, res): Promise<void> => {
  const parsed = CreateSavedFilterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [filter] = await db.insert(savedFiltersTable).values(parsed.data).returning();
  res.status(201).json(filter);
});

router.delete("/saved-filters/:id", async (req, res): Promise<void> => {
  const params = DeleteSavedFilterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [filter] = await db.delete(savedFiltersTable).where(eq(savedFiltersTable.id, params.data.id)).returning();
  if (!filter) {
    res.status(404).json({ error: "Filter not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
