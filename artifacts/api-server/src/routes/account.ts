import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import {
  db,
  tasksTable,
  taskSubItemsTable,
  notesTable,
  projectsTable,
  foldersTable,
  tagsTable,
  dailyPlansTable,
  preferencesTable,
  memoriesTable,
  calendarEventsTable,
  noteLinksTable,
  savedFiltersTable,
  noteTemplatesTable,
  pluginsTable,
  stagedSuggestionsTable,
  aiActionLogTable,
  passwordResetTokensTable,
  conversations,
  messages,
  searchEmbeddings,
} from "@workspace/db";

const UPLOADS_DIR = path.resolve("uploads");

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  if (!token || !token.startsWith("tempo-session-")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

router.delete("/account", requireAuth, async (req, res): Promise<void> => {
  const { confirm } = req.body ?? {};
  if (confirm !== "DELETE") {
    res.status(400).json({ error: "Must send { confirm: 'DELETE' } to confirm account deletion" });
    return;
  }

  await db.transaction(async (tx) => {
    await tx.delete(messages);
    await tx.delete(taskSubItemsTable);
    await tx.delete(noteLinksTable);
    await tx.delete(savedFiltersTable);
    await tx.delete(searchEmbeddings);
    await tx.delete(tasksTable);
    await tx.delete(notesTable);
    await tx.delete(projectsTable);
    await tx.delete(foldersTable);
    await tx.delete(tagsTable);
    await tx.delete(dailyPlansTable);
    await tx.delete(preferencesTable);
    await tx.delete(memoriesTable);
    await tx.delete(calendarEventsTable);
    await tx.delete(noteTemplatesTable);
    await tx.delete(pluginsTable);
    await tx.delete(stagedSuggestionsTable);
    await tx.delete(aiActionLogTable);
    await tx.delete(passwordResetTokensTable);
    await tx.delete(conversations);
  });

  if (fs.existsSync(UPLOADS_DIR)) {
    const files = fs.readdirSync(UPLOADS_DIR);
    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    }
  }

  res.json({ success: true });
});

export default router;
