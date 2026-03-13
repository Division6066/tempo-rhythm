import { Router, type IRouter } from "express";
import { db, stagedSuggestionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  CreateStagedSuggestionBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/staging", async (req, res): Promise<void> => {
  const { type, status } = req.query;
  let query = db.select().from(stagedSuggestionsTable).$dynamic();
  
  const conditions = [];
  if (status) {
    conditions.push(eq(stagedSuggestionsTable.status, status as string));
  } else {
    conditions.push(eq(stagedSuggestionsTable.status, "pending"));
  }
  if (type) {
    conditions.push(eq(stagedSuggestionsTable.type, type as string));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  const results = await query;
  res.json(results);
});

router.post("/staging", async (req, res): Promise<void> => {
  const parsed = CreateStagedSuggestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [result] = await db
    .insert(stagedSuggestionsTable)
    .values({
      type: parsed.data.type,
      data: parsed.data.data,
      reasoning: parsed.data.reasoning,
      status: "pending",
    })
    .returning();

  res.status(201).json(result);
});

router.get("/staging/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const [result] = await db
    .select()
    .from(stagedSuggestionsTable)
    .where(eq(stagedSuggestionsTable.id, id));

  if (!result) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(result);
});

router.post("/staging/:id/accept", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const [result] = await db
    .update(stagedSuggestionsTable)
    .set({ status: "accepted", resolvedAt: new Date() })
    .where(eq(stagedSuggestionsTable.id, id))
    .returning();

  if (!result) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(result);
});

router.post("/staging/:id/reject", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const [result] = await db
    .update(stagedSuggestionsTable)
    .set({ status: "rejected", resolvedAt: new Date() })
    .where(eq(stagedSuggestionsTable.id, id))
    .returning();

  if (!result) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(result);
});

router.patch("/staging/:id/data", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { data } = req.body;

  if (!data) {
    res.status(400).json({ error: "data field is required" });
    return;
  }

  const [result] = await db
    .update(stagedSuggestionsTable)
    .set({ data })
    .where(eq(stagedSuggestionsTable.id, id))
    .returning();

  if (!result) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(result);
});

export default router;
