import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import crypto from "crypto";

const EMBEDDING_DIM = 256;

function contentHash(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex");
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2);
}

function generateLocalEmbedding(text: string): number[] {
  const tokens = tokenize(text);
  const vector = new Float64Array(EMBEDDING_DIM);

  for (const token of tokens) {
    const hash = crypto.createHash("sha256").update(token).digest();
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      const byteIndex = i % hash.length;
      const val = (hash[byteIndex] / 128.0) - 1.0;
      vector[i] += val;
    }
  }

  const bigrams = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]}_${tokens[i + 1]}`);
  }
  for (const bigram of bigrams) {
    const hash = crypto.createHash("sha256").update(bigram).digest();
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      const byteIndex = i % hash.length;
      const val = ((hash[byteIndex] / 128.0) - 1.0) * 0.5;
      vector[i] += val;
    }
  }

  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      vector[i] /= norm;
    }
  }

  return Array.from(vector);
}

export async function ensureEmbeddingsTable(): Promise<void> {
  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector`);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS search_embeddings (
        id SERIAL PRIMARY KEY,
        source_type TEXT NOT NULL,
        source_id INTEGER NOT NULL,
        content_hash TEXT NOT NULL,
        embedding vector(${sql.raw(String(EMBEDDING_DIM))}),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(source_type, source_id)
      )
    `);
  } catch (err) {
    console.warn("Could not create embeddings table:", err instanceof Error ? err.message : err);
  }
}

export async function upsertEmbedding(
  sourceType: "note" | "task" | "memory",
  sourceId: number,
  text: string
): Promise<boolean> {
  const hash = contentHash(text);
  const embedding = generateLocalEmbedding(text);
  const vectorStr = `[${embedding.join(",")}]`;

  try {
    await db.execute(sql`
      INSERT INTO search_embeddings (source_type, source_id, content_hash, embedding)
      VALUES (${sourceType}, ${sourceId}, ${hash}, ${vectorStr}::vector)
      ON CONFLICT (source_type, source_id)
      DO UPDATE SET content_hash = ${hash}, embedding = ${vectorStr}::vector, created_at = NOW()
    `);
    return true;
  } catch (err) {
    console.warn("Upsert embedding failed:", err instanceof Error ? err.message : err);
    return false;
  }
}

export async function deleteEmbedding(sourceType: string, sourceId: number): Promise<void> {
  try {
    await db.execute(sql`
      DELETE FROM search_embeddings WHERE source_type = ${sourceType} AND source_id = ${sourceId}
    `);
  } catch {
    // ignore
  }
}

export interface VectorSearchResult {
  sourceType: string;
  sourceId: number;
  similarity: number;
}

export async function vectorSearch(queryText: string, limit = 20): Promise<VectorSearchResult[]> {
  const embedding = generateLocalEmbedding(queryText);
  const vectorStr = `[${embedding.join(",")}]`;

  try {
    const results = await db.execute(sql`
      SELECT source_type, source_id,
        1 - (embedding <=> ${vectorStr}::vector) as similarity
      FROM search_embeddings
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${vectorStr}::vector
      LIMIT ${limit}
    `);
    const rows: Array<Record<string, unknown>> = Array.isArray(results)
      ? results
      : (results as { rows: Array<Record<string, unknown>> }).rows;

    return rows
      .filter(r => Number(r.similarity) > 0.1)
      .map(r => ({
        sourceType: String(r.source_type),
        sourceId: Number(r.source_id),
        similarity: Number(r.similarity),
      }));
  } catch (err) {
    console.warn("Vector search failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

export async function indexAllContent(): Promise<{ indexed: number; failed: number }> {
  let indexed = 0;
  let failed = 0;

  const notes = await db.execute(sql`
    SELECT n.id, n.title, n.content FROM notes n
    LEFT JOIN search_embeddings se ON se.source_type = 'note' AND se.source_id = n.id
    WHERE se.id IS NULL OR se.content_hash != md5(COALESCE(n.title, '') || ' ' || COALESCE(n.content, ''))
    LIMIT 100
  `);
  const noteRows: Array<Record<string, unknown>> = Array.isArray(notes)
    ? notes
    : (notes as { rows: Array<Record<string, unknown>> }).rows;

  for (const note of noteRows) {
    const text = `${note.title || ""} ${note.content || ""}`.trim();
    if (text.length > 5) {
      const ok = await upsertEmbedding("note", Number(note.id), text);
      if (ok) indexed++; else failed++;
    }
  }

  const tasks = await db.execute(sql`
    SELECT t.id, t.title, t.notes FROM tasks t
    LEFT JOIN search_embeddings se ON se.source_type = 'task' AND se.source_id = t.id
    WHERE se.id IS NULL OR se.content_hash != md5(COALESCE(t.title, '') || ' ' || COALESCE(t.notes, ''))
    LIMIT 100
  `);
  const taskRows: Array<Record<string, unknown>> = Array.isArray(tasks)
    ? tasks
    : (tasks as { rows: Array<Record<string, unknown>> }).rows;

  for (const task of taskRows) {
    const text = `${task.title || ""} ${task.notes || ""}`.trim();
    if (text.length > 5) {
      const ok = await upsertEmbedding("task", Number(task.id), text);
      if (ok) indexed++; else failed++;
    }
  }

  const memories = await db.execute(sql`
    SELECT m.id, m.content FROM memories m
    LEFT JOIN search_embeddings se ON se.source_type = 'memory' AND se.source_id = m.id
    WHERE se.id IS NULL OR se.content_hash != md5(m.content)
    LIMIT 100
  `);
  const memRows: Array<Record<string, unknown>> = Array.isArray(memories)
    ? memories
    : (memories as { rows: Array<Record<string, unknown>> }).rows;

  for (const mem of memRows) {
    if (mem.content && String(mem.content).length > 5) {
      const ok = await upsertEmbedding("memory", Number(mem.id), String(mem.content));
      if (ok) indexed++; else failed++;
    }
  }

  return { indexed, failed };
}
