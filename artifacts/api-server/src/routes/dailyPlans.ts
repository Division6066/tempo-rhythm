import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, dailyPlansTable } from "@workspace/db";
import {
  ListDailyPlansQueryParams,
  ListDailyPlansResponse,
  CreateDailyPlanBody,
  GetDailyPlanParams,
  GetDailyPlanResponse,
  UpdateDailyPlanParams,
  UpdateDailyPlanBody,
  UpdateDailyPlanResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/daily-plans", async (req, res): Promise<void> => {
  const query = ListDailyPlansQueryParams.safeParse(req.query);
  let plans = await db.select().from(dailyPlansTable).orderBy(dailyPlansTable.createdAt);

  if (query.success && query.data.date) {
    const dateStr = typeof query.data.date === "string" ? query.data.date : query.data.date.toISOString().split("T")[0];
    plans = plans.filter((p) => p.date === dateStr);
  }

  res.json(ListDailyPlansResponse.parse(plans));
});

router.post("/daily-plans", async (req, res): Promise<void> => {
  const parsed = CreateDailyPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [plan] = await db.insert(dailyPlansTable).values(parsed.data).returning();
  res.status(201).json(GetDailyPlanResponse.parse(plan));
});

router.get("/daily-plans/:id", async (req, res): Promise<void> => {
  const params = GetDailyPlanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [plan] = await db.select().from(dailyPlansTable).where(eq(dailyPlansTable.id, params.data.id));
  if (!plan) {
    res.status(404).json({ error: "Daily plan not found" });
    return;
  }

  res.json(GetDailyPlanResponse.parse(plan));
});

router.patch("/daily-plans/:id", async (req, res): Promise<void> => {
  const params = UpdateDailyPlanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateDailyPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [plan] = await db.update(dailyPlansTable).set(parsed.data).where(eq(dailyPlansTable.id, params.data.id)).returning();
  if (!plan) {
    res.status(404).json({ error: "Daily plan not found" });
    return;
  }

  res.json(UpdateDailyPlanResponse.parse(plan));
});

export default router;
