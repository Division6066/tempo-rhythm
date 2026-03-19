import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, foldersTable } from "@workspace/db";
import {
  ListFoldersResponse,
  CreateFolderBody,
  UpdateFolderParams,
  UpdateFolderBody,
  UpdateFolderResponse,
  DeleteFolderParams,
  GetFolderParams,
  GetFolderResponse,
  ReorderFoldersBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/folders", async (_req, res): Promise<void> => {
  const folders = await db.select().from(foldersTable).orderBy(asc(foldersTable.sortOrder), asc(foldersTable.createdAt));
  res.json(ListFoldersResponse.parse(folders));
});

router.get("/folders/:id", async (req, res): Promise<void> => {
  const params = GetFolderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [folder] = await db.select().from(foldersTable).where(eq(foldersTable.id, params.data.id));
  if (!folder) {
    res.status(404).json({ error: "Folder not found" });
    return;
  }

  res.json(GetFolderResponse.parse(folder));
});

router.post("/folders", async (req, res): Promise<void> => {
  const parsed = CreateFolderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [folder] = await db.insert(foldersTable).values(parsed.data).returning();
  res.status(201).json(UpdateFolderResponse.parse(folder));
});

router.patch("/folders/:id", async (req, res): Promise<void> => {
  const params = UpdateFolderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateFolderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [folder] = await db.update(foldersTable).set(parsed.data).where(eq(foldersTable.id, params.data.id)).returning();
  if (!folder) {
    res.status(404).json({ error: "Folder not found" });
    return;
  }

  res.json(UpdateFolderResponse.parse(folder));
});

router.delete("/folders/:id", async (req, res): Promise<void> => {
  const params = DeleteFolderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [folder] = await db.delete(foldersTable).where(eq(foldersTable.id, params.data.id)).returning();
  if (!folder) {
    res.status(404).json({ error: "Folder not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/folders/reorder", async (req, res): Promise<void> => {
  const parsed = ReorderFoldersBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  for (let i = 0; i < parsed.data.folderIds.length; i++) {
    await db.update(foldersTable).set({ sortOrder: i }).where(eq(foldersTable.id, parsed.data.folderIds[i]));
  }

  res.sendStatus(204);
});

export default router;
