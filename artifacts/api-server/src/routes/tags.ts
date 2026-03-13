import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, tagsTable } from "@workspace/db";
import {
  ListTagsResponse,
  CreateTagBody,
  DeleteTagParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tags", async (_req, res): Promise<void> => {
  const tags = await db.select().from(tagsTable);
  res.json(ListTagsResponse.parse(tags));
});

router.post("/tags", async (req, res): Promise<void> => {
  const parsed = CreateTagBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [tag] = await db.insert(tagsTable).values(parsed.data).returning();
  res.status(201).json(tag);
});

router.delete("/tags/:id", async (req, res): Promise<void> => {
  const params = DeleteTagParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [tag] = await db.delete(tagsTable).where(eq(tagsTable.id, params.data.id)).returning();
  if (!tag) {
    res.status(404).json({ error: "Tag not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
