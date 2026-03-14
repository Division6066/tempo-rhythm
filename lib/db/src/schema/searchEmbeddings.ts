import { pgTable, serial, text, integer, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const searchEmbeddings = pgTable("search_embeddings", {
  id: serial("id").primaryKey(),
  sourceType: text("source_type").notNull(),
  sourceId: integer("source_id").notNull(),
  contentHash: text("content_hash").notNull(),
  embedding: text("embedding"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
}, (table) => [
  uniqueIndex("search_embeddings_source_type_source_id_key").on(table.sourceType, table.sourceId),
]);
