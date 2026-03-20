import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  preferencesTable,
  tasksTable,
  notesTable,
  memoriesTable,
  projectsTable,
  foldersTable,
  calendarEventsTable,
  dailyPlansTable,
  tagsTable,
  noteLinksTable,
  noteTemplatesTable,
  savedFiltersTable,
  stagedSuggestionsTable,
  aiActionLogTable,
} from "@workspace/db";
import {
  GetPreferencesResponse,
  UpdatePreferencesBody,
  UpdatePreferencesResponse,
  CompleteOnboardingBody,
  CompleteOnboardingResponse,
} from "@workspace/api-zod";

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

async function getOrCreatePreferences() {
  const existing = await db.select().from(preferencesTable);
  if (existing.length > 0) return existing[0];

  const [created] = await db.insert(preferencesTable).values({}).returning();
  return created;
}

router.get("/preferences", async (_req, res): Promise<void> => {
  const prefs = await getOrCreatePreferences();
  res.json(GetPreferencesResponse.parse(prefs));
});

router.put("/preferences", async (req, res): Promise<void> => {
  const parsed = UpdatePreferencesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await getOrCreatePreferences();
  const [updated] = await db
    .update(preferencesTable)
    .set(parsed.data)
    .where(eq(preferencesTable.id, existing.id))
    .returning();

  res.json(UpdatePreferencesResponse.parse(updated));
});

router.patch("/preferences", async (req, res): Promise<void> => {
  const parsed = UpdatePreferencesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await getOrCreatePreferences();
  const [updated] = await db
    .update(preferencesTable)
    .set(parsed.data)
    .where(eq(preferencesTable.id, existing.id))
    .returning();

  res.json(UpdatePreferencesResponse.parse(updated));
});

router.post("/onboarding", async (req, res): Promise<void> => {
  const parsed = CompleteOnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await getOrCreatePreferences();
  const [updated] = await db
    .update(preferencesTable)
    .set({
      ...parsed.data,
      onboardingComplete: true,
    })
    .where(eq(preferencesTable.id, existing.id))
    .returning();

  res.json(CompleteOnboardingResponse.parse(updated));
});

router.get("/export", requireAuth, async (_req, res): Promise<void> => {
  try {
    const [tasks, notes, memories, projects, folders, calendarEvents, dailyPlans, preferences, tags, noteLinks, noteTemplates, savedFilters, stagedSuggestions, aiActionLog] =
      await Promise.all([
        db.select().from(tasksTable),
        db.select().from(notesTable),
        db.select().from(memoriesTable),
        db.select().from(projectsTable),
        db.select().from(foldersTable),
        db.select().from(calendarEventsTable),
        db.select().from(dailyPlansTable),
        db.select().from(preferencesTable),
        db.select().from(tagsTable),
        db.select().from(noteLinksTable),
        db.select().from(noteTemplatesTable),
        db.select().from(savedFiltersTable),
        db.select().from(stagedSuggestionsTable),
        db.select().from(aiActionLogTable),
      ]);

    res.json({
      exportedAt: new Date().toISOString(),
      tasks,
      notes,
      memories,
      projects,
      folders,
      calendarEvents,
      dailyPlans,
      preferences,
      tags,
      noteLinks,
      noteTemplates,
      savedFilters,
      stagedSuggestions,
      aiActionLog,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to export data" });
  }
});

router.post("/memories/reset", requireAuth, async (_req, res): Promise<void> => {
  try {
    const result = await db.delete(memoriesTable);
    res.json({ deleted: result.rowCount ?? 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset memories" });
  }
});

router.delete("/account", requireAuth, async (_req, res): Promise<void> => {
  try {
    await db.delete(noteLinksTable);
    await db.delete(stagedSuggestionsTable);
    await db.delete(aiActionLogTable);
    await db.delete(savedFiltersTable);
    await db.delete(noteTemplatesTable);

    await Promise.all([
      db.delete(tasksTable),
      db.delete(notesTable),
      db.delete(memoriesTable),
      db.delete(calendarEventsTable),
      db.delete(dailyPlansTable),
      db.delete(tagsTable),
    ]);

    await db.delete(projectsTable);
    await db.delete(foldersTable);
    await db.delete(preferencesTable);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
