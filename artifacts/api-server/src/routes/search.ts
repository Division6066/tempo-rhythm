import { Router, type IRouter } from "express";
import { ilike, or, sql } from "drizzle-orm";
import { db, notesTable, tasksTable, memoriesTable } from "@workspace/db";
import type { Note, Task, Memory } from "@workspace/db";

const router: IRouter = Router();

interface RankedNote extends Note {
  rank: number;
  similarity: number;
}

interface RankedTask extends Task {
  rank: number;
  similarity: number;
}

interface RankedMemory extends Memory {
  rank: number;
  similarity: number;
}

interface SearchResponse {
  notes: RankedNote[];
  tasks: RankedTask[];
  memories: RankedMemory[];
}

function buildTsQuery(q: string): string {
  const words = q.trim().split(/\s+/).filter(Boolean);
  return words.map(w => `${w}:*`).join(" & ");
}

async function searchNotesFts(q: string, pattern: string, tsQuery: string): Promise<RankedNote[]> {
  const result = await db.execute(sql`
    SELECT n.*,
      COALESCE(ts_rank(
        to_tsvector('english', COALESCE(n.title, '') || ' ' || COALESCE(n.content, '')),
        to_tsquery('english', ${tsQuery})
      ), 0) AS rank,
      COALESCE(similarity(COALESCE(n.title, ''), ${q}), 0) AS similarity
    FROM notes n
    WHERE 
      to_tsvector('english', COALESCE(n.title, '') || ' ' || COALESCE(n.content, '')) @@ to_tsquery('english', ${tsQuery})
      OR n.title % ${q}
      OR n.title ILIKE ${pattern}
      OR n.content ILIKE ${pattern}
    ORDER BY 
      (COALESCE(similarity(COALESCE(n.title, ''), ${q}), 0) * 3) +
      COALESCE(ts_rank(
        to_tsvector('english', COALESCE(n.title, '') || ' ' || COALESCE(n.content, '')),
        to_tsquery('english', ${tsQuery})
      ), 0) +
      (CASE WHEN n.title ILIKE ${pattern} THEN 2 ELSE 0 END)
      DESC
    LIMIT 20
  `);
  const rows = Array.isArray(result) ? result : (result as { rows: RankedNote[] }).rows;
  return rows.map(r => ({
    ...r,
    rank: Number(r.rank) || 0,
    similarity: Number(r.similarity) || 0,
  })) as RankedNote[];
}

async function searchTasksFts(q: string, pattern: string, tsQuery: string): Promise<RankedTask[]> {
  const result = await db.execute(sql`
    SELECT t.*,
      COALESCE(ts_rank(
        to_tsvector('english', COALESCE(t.title, '') || ' ' || COALESCE(t.notes, '')),
        to_tsquery('english', ${tsQuery})
      ), 0) AS rank,
      COALESCE(similarity(COALESCE(t.title, ''), ${q}), 0) AS similarity
    FROM tasks t
    WHERE 
      to_tsvector('english', COALESCE(t.title, '') || ' ' || COALESCE(t.notes, '')) @@ to_tsquery('english', ${tsQuery})
      OR t.title % ${q}
      OR t.title ILIKE ${pattern}
    ORDER BY 
      (COALESCE(similarity(COALESCE(t.title, ''), ${q}), 0) * 3) +
      COALESCE(ts_rank(
        to_tsvector('english', COALESCE(t.title, '') || ' ' || COALESCE(t.notes, '')),
        to_tsquery('english', ${tsQuery})
      ), 0)
      DESC
    LIMIT 20
  `);
  const rows = Array.isArray(result) ? result : (result as { rows: RankedTask[] }).rows;
  return rows.map(r => ({
    ...r,
    rank: Number(r.rank) || 0,
    similarity: Number(r.similarity) || 0,
  })) as RankedTask[];
}

async function searchMemoriesFts(q: string, pattern: string, tsQuery: string): Promise<RankedMemory[]> {
  const result = await db.execute(sql`
    SELECT m.*,
      COALESCE(ts_rank(
        to_tsvector('english', m.content),
        to_tsquery('english', ${tsQuery})
      ), 0) AS rank,
      COALESCE(similarity(m.content, ${q}), 0) AS similarity
    FROM memories m
    WHERE 
      to_tsvector('english', m.content) @@ to_tsquery('english', ${tsQuery})
      OR m.content % ${q}
      OR m.content ILIKE ${pattern}
    ORDER BY 
      (COALESCE(similarity(m.content, ${q}), 0) * 3) +
      COALESCE(ts_rank(
        to_tsvector('english', m.content),
        to_tsquery('english', ${tsQuery})
      ), 0)
      DESC
    LIMIT 10
  `);
  const rows = Array.isArray(result) ? result : (result as { rows: RankedMemory[] }).rows;
  return rows.map(r => ({
    ...r,
    rank: Number(r.rank) || 0,
    similarity: Number(r.similarity) || 0,
  })) as RankedMemory[];
}

async function searchNotesKeyword(pattern: string): Promise<RankedNote[]> {
  const results = await db
    .select()
    .from(notesTable)
    .where(or(ilike(notesTable.title, pattern), ilike(notesTable.content, pattern)))
    .limit(20);
  return results.map(r => ({ ...r, rank: 0, similarity: 0 }));
}

async function searchTasksKeyword(pattern: string): Promise<RankedTask[]> {
  const results = await db
    .select()
    .from(tasksTable)
    .where(ilike(tasksTable.title, pattern))
    .limit(20);
  return results.map(r => ({ ...r, rank: 0, similarity: 0 }));
}

async function searchMemoriesKeyword(pattern: string): Promise<RankedMemory[]> {
  const results = await db
    .select()
    .from(memoriesTable)
    .where(ilike(memoriesTable.content, pattern))
    .limit(10);
  return results.map(r => ({ ...r, rank: 0, similarity: 0 }));
}

router.get("/search", async (req, res): Promise<void> => {
  const q = (req.query.q as string || "").trim();
  const mode = (req.query.mode as string) || "hybrid";
  if (!q) {
    const empty: SearchResponse = { notes: [], tasks: [], memories: [] };
    res.json(empty);
    return;
  }

  const pattern = `%${q}%`;

  if (mode === "keyword") {
    const [notes, tasks, memories] = await Promise.all([
      searchNotesKeyword(pattern),
      searchTasksKeyword(pattern),
      searchMemoriesKeyword(pattern),
    ]);
    const result: SearchResponse = { notes, tasks, memories };
    res.json(result);
    return;
  }

  const tsQuery = buildTsQuery(q);

  let notes: RankedNote[];
  let tasks: RankedTask[];
  let memories: RankedMemory[];

  try {
    [notes, tasks, memories] = await Promise.all([
      searchNotesFts(q, pattern, tsQuery),
      searchTasksFts(q, pattern, tsQuery),
      searchMemoriesFts(q, pattern, tsQuery),
    ]);
  } catch (err) {
    console.warn("Full-text search failed, falling back to keyword:", err instanceof Error ? err.message : err);
    [notes, tasks, memories] = await Promise.all([
      searchNotesKeyword(pattern),
      searchTasksKeyword(pattern),
      searchMemoriesKeyword(pattern),
    ]);
  }

  const result: SearchResponse = { notes, tasks, memories };
  res.json(result);
});

export default router;
