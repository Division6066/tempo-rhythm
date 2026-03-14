import { Router, type IRouter } from "express";
import { ilike, or, sql, desc } from "drizzle-orm";
import { db, notesTable, tasksTable, memoriesTable } from "@workspace/db";

const router: IRouter = Router();

function buildTsQuery(q: string): string {
  const words = q.trim().split(/\s+/).filter(Boolean);
  return words.map(w => `${w}:*`).join(" & ");
}

router.get("/search", async (req, res): Promise<void> => {
  const q = (req.query.q as string || "").trim();
  const mode = (req.query.mode as string) || "hybrid";
  if (!q) {
    res.json({ notes: [], tasks: [], memories: [] });
    return;
  }

  const pattern = `%${q}%`;

  if (mode === "keyword") {
    const notes = await db
      .select()
      .from(notesTable)
      .where(or(ilike(notesTable.title, pattern), ilike(notesTable.content, pattern)))
      .limit(20);

    const tasks = await db
      .select()
      .from(tasksTable)
      .where(ilike(tasksTable.title, pattern))
      .limit(20);

    const memories = await db
      .select()
      .from(memoriesTable)
      .where(ilike(memoriesTable.content, pattern))
      .limit(10);

    res.json({ notes, tasks, memories });
    return;
  }

  const tsQuery = buildTsQuery(q);

  let rankedNotes: Array<Record<string, unknown>> = [];
  try {
    rankedNotes = await db.execute(sql`
      SELECT *, 
        ts_rank(
          to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')),
          to_tsquery('english', ${tsQuery})
        ) as rank,
        similarity(coalesce(title, ''), ${q}) as title_sim
      FROM notes
      WHERE 
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')) @@ to_tsquery('english', ${tsQuery})
        OR title ILIKE ${pattern}
        OR content ILIKE ${pattern}
      ORDER BY 
        (CASE WHEN title ILIKE ${pattern} THEN 2 ELSE 0 END) +
        ts_rank(
          to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')),
          to_tsquery('english', ${tsQuery})
        ) DESC
      LIMIT 20
    `) as any;
  } catch {
    rankedNotes = await db
      .select()
      .from(notesTable)
      .where(or(ilike(notesTable.title, pattern), ilike(notesTable.content, pattern)))
      .limit(20) as any;
  }

  let rankedTasks: Array<Record<string, unknown>> = [];
  try {
    rankedTasks = await db.execute(sql`
      SELECT *,
        ts_rank(
          to_tsvector('english', coalesce(title, '') || ' ' || coalesce(notes, '')),
          to_tsquery('english', ${tsQuery})
        ) as rank
      FROM tasks
      WHERE 
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(notes, '')) @@ to_tsquery('english', ${tsQuery})
        OR title ILIKE ${pattern}
      ORDER BY rank DESC
      LIMIT 20
    `) as any;
  } catch {
    rankedTasks = await db
      .select()
      .from(tasksTable)
      .where(ilike(tasksTable.title, pattern))
      .limit(20) as any;
  }

  let rankedMemories: Array<Record<string, unknown>> = [];
  try {
    rankedMemories = await db.execute(sql`
      SELECT *,
        ts_rank(
          to_tsvector('english', content),
          to_tsquery('english', ${tsQuery})
        ) as rank
      FROM memories
      WHERE 
        to_tsvector('english', content) @@ to_tsquery('english', ${tsQuery})
        OR content ILIKE ${pattern}
      ORDER BY rank DESC
      LIMIT 10
    `) as any;
  } catch {
    rankedMemories = await db
      .select()
      .from(memoriesTable)
      .where(ilike(memoriesTable.content, pattern))
      .limit(10) as any;
  }

  res.json({
    notes: Array.isArray(rankedNotes) ? rankedNotes : (rankedNotes as any).rows || [],
    tasks: Array.isArray(rankedTasks) ? rankedTasks : (rankedTasks as any).rows || [],
    memories: Array.isArray(rankedMemories) ? rankedMemories : (rankedMemories as any).rows || [],
  });
});

export default router;
