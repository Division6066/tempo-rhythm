import { Router, type IRouter } from "express";
import { ilike } from "drizzle-orm";
import { db, notesTable, tasksTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/search", async (req, res): Promise<void> => {
  const q = (req.query.q as string || "").trim();
  if (!q) {
    res.json({ notes: [], tasks: [] });
    return;
  }

  const pattern = `%${q}%`;

  const notes = await db
    .select()
    .from(notesTable)
    .where(ilike(notesTable.title, pattern))
    .limit(20);

  const notesByContent = await db
    .select()
    .from(notesTable)
    .where(ilike(notesTable.content, pattern))
    .limit(20);

  const seenNoteIds = new Set(notes.map((n) => n.id));
  for (const n of notesByContent) {
    if (!seenNoteIds.has(n.id)) {
      notes.push(n);
      seenNoteIds.add(n.id);
    }
  }

  const tasks = await db
    .select()
    .from(tasksTable)
    .where(ilike(tasksTable.title, pattern))
    .limit(20);

  res.json({ notes: notes.slice(0, 20), tasks });
});

export default router;
