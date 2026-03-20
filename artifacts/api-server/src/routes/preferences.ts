import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  preferencesTable,
} from "@workspace/db";
import {
  GetPreferencesResponse,
  UpdatePreferencesBody,
  UpdatePreferencesResponse,
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

router.get("/preferences", requireAuth, async (_req, res): Promise<void> => {
  const prefs = await getOrCreatePreferences();
  res.json(GetPreferencesResponse.parse(prefs));
});

router.put("/preferences", requireAuth, async (req, res): Promise<void> => {
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

router.patch("/preferences", requireAuth, async (req, res): Promise<void> => {
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

export default router;
