import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, preferencesTable } from "@workspace/db";
import {
  GetPreferencesResponse,
  UpdatePreferencesBody,
  UpdatePreferencesResponse,
  CompleteOnboardingBody,
  CompleteOnboardingResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

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

export default router;
