import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, notesTable } from "@workspace/db";
import {
  ListNotesQueryParams,
  ListNotesResponse,
  CreateNoteBody,
  GetNoteParams,
  GetNoteResponse,
  UpdateNoteParams,
  UpdateNoteBody,
  UpdateNoteResponse,
  DeleteNoteParams,
  PublishNoteParams,
  RenameNoteParams,
  RenameNoteBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/notes", async (req, res): Promise<void> => {
  const query = ListNotesQueryParams.safeParse(req.query);
  let notes = await db.select().from(notesTable).orderBy(notesTable.createdAt);

  if (query.success && query.data.projectId) {
    notes = notes.filter((n) => n.projectId === query.data.projectId);
  }
  if (query.success && query.data.folderId) {
    notes = notes.filter((n) => n.folderId === query.data.folderId);
  }
  if (query.success && query.data.periodType) {
    notes = notes.filter((n) => n.periodType === query.data.periodType);
  }
  if (query.success && query.data.search) {
    const searchLower = query.data.search.toLowerCase();
    notes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(searchLower) ||
        n.content.toLowerCase().includes(searchLower)
    );
  }

  res.json(ListNotesResponse.parse(notes));
});

router.post("/notes", async (req, res): Promise<void> => {
  const parsed = CreateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [note] = await db.insert(notesTable).values(parsed.data).returning();
  res.status(201).json(GetNoteResponse.parse(note));
});

router.get("/notes/:id", async (req, res): Promise<void> => {
  const params = GetNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [note] = await db.select().from(notesTable).where(eq(notesTable.id, params.data.id));
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  res.json(GetNoteResponse.parse(note));
});

router.patch("/notes/:id", async (req, res): Promise<void> => {
  const params = UpdateNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [note] = await db.update(notesTable).set(parsed.data).where(eq(notesTable.id, params.data.id)).returning();
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  res.json(UpdateNoteResponse.parse(note));
});

router.delete("/notes/:id", async (req, res): Promise<void> => {
  const params = DeleteNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [note] = await db.delete(notesTable).where(eq(notesTable.id, params.data.id)).returning();
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/notes/:id/publish", async (req, res): Promise<void> => {
  const params = PublishNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { isPublished } = req.body;

  const [existing] = await db.select().from(notesTable).where(eq(notesTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  let publishSlug = existing.publishSlug;
  if (isPublished && !publishSlug) {
    const slugBase = existing.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    publishSlug = `${slugBase}-${Date.now().toString(36)}`;
  }

  const [note] = await db
    .update(notesTable)
    .set({ isPublished: !!isPublished, publishSlug: isPublished ? publishSlug : existing.publishSlug })
    .where(eq(notesTable.id, params.data.id))
    .returning();

  res.json(GetNoteResponse.parse(note));
});

router.post("/notes/:id/rename", async (req, res): Promise<void> => {
  const params = RenameNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = RenameNoteBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { newTitle } = body.data;

  const [existing] = await db.select().from(notesTable).where(eq(notesTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  const authorativeOldTitle = existing.title;

  await db
    .update(notesTable)
    .set({ title: newTitle })
    .where(eq(notesTable.id, params.data.id));

  const allNotes = await db
    .select()
    .from(notesTable);

  let updatedCount = 0;
  const oldPattern = new RegExp(
    `\\[\\[${authorativeOldTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]\\]`,
    "gi"
  );
  const newReplacement = `[[${newTitle}]]`;

  for (const otherNote of allNotes) {
    if (oldPattern.test(otherNote.content)) {
      oldPattern.lastIndex = 0;
      const updatedContent = otherNote.content.replace(oldPattern, newReplacement);
      await db
        .update(notesTable)
        .set({ content: updatedContent })
        .where(eq(notesTable.id, otherNote.id));
      updatedCount++;
    }
  }

  res.json({ updatedCount });
});

router.get("/published/:slug", async (req, res): Promise<void> => {
  const slug = req.params.slug;
  const [note] = await db
    .select()
    .from(notesTable)
    .where(and(eq(notesTable.publishSlug, slug), eq(notesTable.isPublished, true)));

  if (!note) {
    res.status(404).json({ error: "Published note not found" });
    return;
  }

  res.json(GetNoteResponse.parse(note));
});

export default router;
