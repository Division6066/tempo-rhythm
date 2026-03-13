import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, calendarEventsTable } from "@workspace/db";
import {
  ListCalendarEventsQueryParams,
  ListCalendarEventsResponse,
  CreateCalendarEventBody,
  GetCalendarEventParams,
  GetCalendarEventResponse,
  UpdateCalendarEventParams,
  UpdateCalendarEventBody,
  UpdateCalendarEventResponse,
  DeleteCalendarEventParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/calendar-events", async (req, res): Promise<void> => {
  const query = ListCalendarEventsQueryParams.safeParse(req.query);
  let events = await db.select().from(calendarEventsTable).orderBy(calendarEventsTable.date);

  if (query.success && query.data.startDate) {
    events = events.filter((e) => e.date >= query.data.startDate!);
  }
  if (query.success && query.data.endDate) {
    events = events.filter((e) => e.date <= query.data.endDate!);
  }

  res.json(ListCalendarEventsResponse.parse(events));
});

router.post("/calendar-events", async (req, res): Promise<void> => {
  const parsed = CreateCalendarEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [event] = await db.insert(calendarEventsTable).values(parsed.data).returning();
  res.status(201).json(GetCalendarEventResponse.parse(event));
});

router.get("/calendar-events/:id", async (req, res): Promise<void> => {
  const params = GetCalendarEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db.select().from(calendarEventsTable).where(eq(calendarEventsTable.id, params.data.id));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json(GetCalendarEventResponse.parse(event));
});

router.patch("/calendar-events/:id", async (req, res): Promise<void> => {
  const params = UpdateCalendarEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCalendarEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [event] = await db.update(calendarEventsTable).set(parsed.data).where(eq(calendarEventsTable.id, params.data.id)).returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json(UpdateCalendarEventResponse.parse(event));
});

router.delete("/calendar-events/:id", async (req, res): Promise<void> => {
  const params = DeleteCalendarEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db.delete(calendarEventsTable).where(eq(calendarEventsTable.id, params.data.id)).returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
