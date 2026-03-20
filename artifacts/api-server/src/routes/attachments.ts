import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, notesTable } from "@workspace/db";
import multer from "multer";
import path from "path";
import fs from "fs";

interface NoteAttachment {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: string;
}

const UPLOADS_DIR = path.resolve("uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

function parseAttachments(raw: unknown): NoteAttachment[] {
  if (!Array.isArray(raw)) return [];
  return raw as NoteAttachment[];
}

const router: IRouter = Router();

router.get("/notes/:id/attachments", async (req, res): Promise<void> => {
  const noteId = Number(req.params.id);
  if (Number.isNaN(noteId)) {
    res.status(400).json({ error: "Invalid note id" });
    return;
  }

  const [note] = await db.select().from(notesTable).where(eq(notesTable.id, noteId));
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  res.json({ attachments: parseAttachments(note.attachments) });
});

router.post("/notes/:id/attachments", upload.single("file"), async (req, res): Promise<void> => {
  const noteId = Number(req.params.id);
  if (Number.isNaN(noteId)) {
    res.status(400).json({ error: "Invalid note id" });
    return;
  }

  const [note] = await db.select().from(notesTable).where(eq(notesTable.id, noteId));
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const attachment: NoteAttachment = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: `/uploads/${req.file.filename}`,
    uploadedAt: new Date().toISOString(),
  };

  const currentAttachments = parseAttachments(note.attachments);
  const updatedAttachments = [...currentAttachments, attachment];

  await db
    .update(notesTable)
    .set({ attachments: updatedAttachments })
    .where(eq(notesTable.id, noteId));

  res.status(201).json({ attachment });
});

router.delete("/notes/:id/attachments", async (req, res): Promise<void> => {
  const noteId = Number(req.params.id);
  if (Number.isNaN(noteId)) {
    res.status(400).json({ error: "Invalid note id" });
    return;
  }

  const filename = (req.query.filename ?? req.body?.filename) as string | undefined;
  if (!filename) {
    res.status(400).json({ error: "filename is required (query param or body)" });
    return;
  }

  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }

  const [note] = await db.select().from(notesTable).where(eq(notesTable.id, noteId));
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  const currentAttachments = parseAttachments(note.attachments);
  const filtered = currentAttachments.filter((a) => a.filename !== filename);

  if (filtered.length === currentAttachments.length) {
    res.status(404).json({ error: "Attachment not found" });
    return;
  }

  await db
    .update(notesTable)
    .set({ attachments: filtered })
    .where(eq(notesTable.id, noteId));

  const filePath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  res.sendStatus(204);
});

export default router;
