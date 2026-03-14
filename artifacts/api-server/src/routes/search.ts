import { Router, type IRouter } from "express";
import { ilike, or, sql } from "drizzle-orm";
import { db, notesTable, tasksTable, memoriesTable } from "@workspace/db";
import type { Note, Task, Memory } from "@workspace/db";
import { vectorSearch, indexAllContent } from "../embeddings";

const router: IRouter = Router();

interface RankedNote extends Note {
  rank: number;
  similarity: number;
  vectorScore: number;
}

interface RankedTask extends Task {
  rank: number;
  similarity: number;
  vectorScore: number;
}

interface RankedMemory extends Memory {
  rank: number;
  similarity: number;
  vectorScore: number;
}

interface SearchResponse {
  notes: RankedNote[];
  tasks: RankedTask[];
  memories: RankedMemory[];
  searchMode: "hybrid" | "keyword" | "vector";
}

function buildTsQuery(q: string): string {
  const words = q.trim().split(/\s+/).filter(Boolean);
  return words.map(w => `${w}:*`).join(" & ");
}

const VECTOR_WEIGHT = 0.6;
const LEXICAL_WEIGHT = 0.4;

router.get("/search", async (req, res): Promise<void> => {
  const q = (req.query.q as string || "").trim();
  const mode = (req.query.mode as string) || "hybrid";
  if (!q) {
    const empty: SearchResponse = { notes: [], tasks: [], memories: [], searchMode: mode as SearchResponse["searchMode"] };
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
    res.json({ notes, tasks, memories, searchMode: "keyword" } satisfies SearchResponse);
    return;
  }

  const tsQuery = buildTsQuery(q);

  const [lexicalNotes, lexicalTasks, lexicalMemories, vectorResults] = await Promise.all([
    searchNotesFts(q, pattern, tsQuery).catch(() => searchNotesKeyword(pattern)),
    searchTasksFts(q, pattern, tsQuery).catch(() => searchTasksKeyword(pattern)),
    searchMemoriesFts(q, pattern, tsQuery).catch(() => searchMemoriesKeyword(pattern)),
    vectorSearch(q, 30).catch(() => []),
  ]);

  const vectorScoreMap = new Map<string, number>();
  for (const vr of vectorResults) {
    vectorScoreMap.set(`${vr.sourceType}:${vr.sourceId}`, vr.similarity);
  }

  const fusedNotes = lexicalNotes.map(n => ({
    ...n,
    vectorScore: vectorScoreMap.get(`note:${n.id}`) || 0,
  }));
  const fusedTasks = lexicalTasks.map(t => ({
    ...t,
    vectorScore: vectorScoreMap.get(`task:${t.id}`) || 0,
  }));
  const fusedMemories = lexicalMemories.map(m => ({
    ...m,
    vectorScore: vectorScoreMap.get(`memory:${m.id}`) || 0,
  }));

  const vectorOnlyNoteIds = new Set(fusedNotes.map(n => n.id));
  const vectorOnlyTaskIds = new Set(fusedTasks.map(t => t.id));
  const vectorOnlyMemIds = new Set(fusedMemories.map(m => m.id));

  for (const vr of vectorResults) {
    if (vr.similarity < 0.3) continue;
    if (vr.sourceType === "note" && !vectorOnlyNoteIds.has(vr.sourceId)) {
      const [note] = await db.select().from(notesTable).where(sql`id = ${vr.sourceId}`).limit(1);
      if (note) {
        fusedNotes.push({ ...note, rank: 0, similarity: 0, vectorScore: vr.similarity });
        vectorOnlyNoteIds.add(vr.sourceId);
      }
    } else if (vr.sourceType === "task" && !vectorOnlyTaskIds.has(vr.sourceId)) {
      const [task] = await db.select().from(tasksTable).where(sql`id = ${vr.sourceId}`).limit(1);
      if (task) {
        fusedTasks.push({ ...task, rank: 0, similarity: 0, vectorScore: vr.similarity });
        vectorOnlyTaskIds.add(vr.sourceId);
      }
    } else if (vr.sourceType === "memory" && !vectorOnlyMemIds.has(vr.sourceId)) {
      const [mem] = await db.select().from(memoriesTable).where(sql`id = ${vr.sourceId}`).limit(1);
      if (mem) {
        fusedMemories.push({ ...mem, rank: 0, similarity: 0, vectorScore: vr.similarity });
        vectorOnlyMemIds.add(vr.sourceId);
      }
    }
  }

  const fusedSort = <T extends { rank: number; similarity: number; vectorScore: number }>(items: T[]): T[] => {
    return items.sort((a, b) => {
      const scoreA = (a.vectorScore * VECTOR_WEIGHT) + ((a.rank + a.similarity) * LEXICAL_WEIGHT);
      const scoreB = (b.vectorScore * VECTOR_WEIGHT) + ((b.rank + b.similarity) * LEXICAL_WEIGHT);
      return scoreB - scoreA;
    }).slice(0, 20);
  };

  res.json({
    notes: fusedSort(fusedNotes),
    tasks: fusedSort(fusedTasks),
    memories: fusedSort(fusedMemories).slice(0, 10),
    searchMode: vectorResults.length > 0 ? "hybrid" : "keyword",
  } satisfies SearchResponse);
});

router.post("/search/index", async (_req, res): Promise<void> => {
  try {
    const result = await indexAllContent();
    res.json(result);
  } catch (err) {
    console.error("Indexing error:", err);
    res.status(500).json({ error: "Indexing failed" });
  }
});

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
    vectorScore: 0,
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
    vectorScore: 0,
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
    vectorScore: 0,
  })) as RankedMemory[];
}

async function searchNotesKeyword(pattern: string): Promise<RankedNote[]> {
  const results = await db
    .select()
    .from(notesTable)
    .where(or(ilike(notesTable.title, pattern), ilike(notesTable.content, pattern)))
    .limit(20);
  return results.map(r => ({ ...r, rank: 0, similarity: 0, vectorScore: 0 }));
}

async function searchTasksKeyword(pattern: string): Promise<RankedTask[]> {
  const results = await db
    .select()
    .from(tasksTable)
    .where(ilike(tasksTable.title, pattern))
    .limit(20);
  return results.map(r => ({ ...r, rank: 0, similarity: 0, vectorScore: 0 }));
}

async function searchMemoriesKeyword(pattern: string): Promise<RankedMemory[]> {
  const results = await db
    .select()
    .from(memoriesTable)
    .where(ilike(memoriesTable.content, pattern))
    .limit(10);
  return results.map(r => ({ ...r, rank: 0, similarity: 0, vectorScore: 0 }));
}

export default router;
