import { Router, type IRouter } from "express";
import { eq, or } from "drizzle-orm";
import { db, noteLinksTable, notesTable } from "@workspace/db";
import {
  ListNoteLinksQueryParams,
  CreateNoteLinkBody,
  DeleteNoteLinkParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/note-links", async (req, res): Promise<void> => {
  const query = ListNoteLinksQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const noteId = query.data.noteId;
  const links = await db
    .select()
    .from(noteLinksTable)
    .where(or(eq(noteLinksTable.sourceNoteId, noteId), eq(noteLinksTable.targetNoteId, noteId)));

  const enriched = await Promise.all(
    links.map(async (link) => {
      const [sourceNote] = await db.select({ title: notesTable.title }).from(notesTable).where(eq(notesTable.id, link.sourceNoteId));
      const [targetNote] = await db.select({ title: notesTable.title }).from(notesTable).where(eq(notesTable.id, link.targetNoteId));
      return {
        ...link,
        sourceNoteTitle: sourceNote?.title || "Unknown",
        targetNoteTitle: targetNote?.title || "Unknown",
      };
    })
  );

  res.json(enriched);
});

router.post("/note-links", async (req, res): Promise<void> => {
  const parsed = CreateNoteLinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(noteLinksTable)
    .where(
      or(
        eq(noteLinksTable.sourceNoteId, parsed.data.sourceNoteId),
        eq(noteLinksTable.sourceNoteId, parsed.data.targetNoteId)
      )
    );

  const alreadyLinked = existing.some(
    (l) =>
      (l.sourceNoteId === parsed.data.sourceNoteId && l.targetNoteId === parsed.data.targetNoteId) ||
      (l.sourceNoteId === parsed.data.targetNoteId && l.targetNoteId === parsed.data.sourceNoteId)
  );

  if (alreadyLinked) {
    res.status(409).json({ error: "Link already exists" });
    return;
  }

  const [link] = await db.insert(noteLinksTable).values(parsed.data).returning();
  res.status(201).json(link);
});

router.delete("/note-links/:id", async (req, res): Promise<void> => {
  const params = DeleteNoteLinkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [link] = await db.delete(noteLinksTable).where(eq(noteLinksTable.id, params.data.id)).returning();
  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
