import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
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

router.get("/export", requireAuth, async (_req, res): Promise<void> => {
  const [
    tasks,
    taskSubItems,
    notes,
    projects,
    folders,
    tags,
    dailyPlans,
    preferences,
    memories,
    calendarEvents,
    noteLinks,
    savedFilters,
    noteTemplates,
    plugins,
    stagedSuggestions,
    aiActionLog,
    passwordResetTokens,
    conversationRows,
    messageRows,
    searchEmbeddingRows,
  ] = await Promise.all([
    db.select().from(tasksTable),
    db.select().from(taskSubItemsTable),
    db.select().from(notesTable),
    db.select().from(projectsTable),
    db.select().from(foldersTable),
    db.select().from(tagsTable),
    db.select().from(dailyPlansTable),
    db.select().from(preferencesTable),
    db.select().from(memoriesTable),
    db.select().from(calendarEventsTable),
    db.select().from(noteLinksTable),
    db.select().from(savedFiltersTable),
    db.select().from(noteTemplatesTable),
    db.select().from(pluginsTable),
    db.select().from(stagedSuggestionsTable),
    db.select().from(aiActionLogTable),
    db.select().from(passwordResetTokensTable),
    db.select().from(conversations),
    db.select().from(messages),
    db.select().from(searchEmbeddings),
  ]);

  const data = {
    tasks,
    taskSubItems,
    notes,
    projects,
    folders,
    tags,
    dailyPlans,
    preferences,
    memories,
    calendarEvents,
    noteLinks,
    savedFilters,
    noteTemplates,
    plugins,
    stagedSuggestions,
    aiActionLog,
    passwordResetTokens,
    conversations: conversationRows,
    messages: messageRows,
    searchEmbeddings: searchEmbeddingRows,
    exportedAt: new Date().toISOString(),
  };

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", "attachment; filename=tempo-export.json");
  res.json(data);
});

export default router;
