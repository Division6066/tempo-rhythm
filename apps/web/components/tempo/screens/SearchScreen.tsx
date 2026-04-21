"use client";

import { useMemo, useState } from "react";
import { Pill, SoftCard } from "@tempo/ui/primitives";
import {
  mockHabits,
  mockJournal,
  mockNotes,
  mockProjects,
  mockTasks,
} from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";

type Hit = {
  id: string;
  title: string;
  excerpt?: string;
  type: "task" | "note" | "habit" | "journal" | "project";
};

/**
 * SearchScreen — single-box search across the whole library.
 * @source docs/design/claude-export/design-system/screens-5.jsx (ScreenSearch)
 */
export function SearchScreen() {
  const [query, setQuery] = useState("");

  const results: Hit[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const hits: Hit[] = [];
    for (const t of mockTasks) {
      if (t.title.toLowerCase().includes(q)) {
        hits.push({ id: t.id, title: t.title, excerpt: t.project, type: "task" });
      }
    }
    for (const n of mockNotes) {
      if (
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q)
      ) {
        hits.push({ id: n.id, title: n.title, excerpt: n.excerpt, type: "note" });
      }
    }
    for (const h of mockHabits) {
      if (h.title.toLowerCase().includes(q)) {
        hits.push({ id: h.id, title: h.title, type: "habit" });
      }
    }
    for (const j of mockJournal) {
      if (j.excerpt.toLowerCase().includes(q)) {
        hits.push({ id: j.id, title: j.dateLabel, excerpt: j.excerpt, type: "journal" });
      }
    }
    for (const p of mockProjects) {
      if (p.title.toLowerCase().includes(q)) {
        hits.push({ id: p.id, title: p.title, type: "project" });
      }
    }
    return hits;
  }, [query]);

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="You"
        title="Search"
        lede="Across tasks, notes, habits, journal, projects — one box."
      />

      <div className="px-6 py-6">
        <div className="flex items-center gap-3 rounded-xl border border-border-soft bg-card px-4 py-3 shadow-whisper">
          <span aria-hidden className="text-lg">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anything…"
            className="flex-1 bg-transparent text-h4 placeholder:text-muted-foreground focus:outline-none"
            /*
             * @behavior: Full-text search across user's library.
             * @convex-query-needed: search.unified
             */
          />
          <Pill tone="neutral">{results.length} results</Pill>
        </div>

        <SoftCard tone="default" padding="md" className="mt-5">
          {results.length === 0 ? (
            <p className="text-small text-muted-foreground">
              Start typing to search. Examples: <em>tempo</em>, <em>walk</em>,
              <em>convex</em>, <em>dentist</em>.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border-soft">
              {results.map((hit) => (
                <li key={`${hit.type}-${hit.id}`} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <div className="text-body">{hit.title}</div>
                    {hit.excerpt ? (
                      <div className="text-caption text-muted-foreground">
                        {hit.excerpt}
                      </div>
                    ) : null}
                  </div>
                  <Pill tone="slate">{hit.type}</Pill>
                </li>
              ))}
            </ul>
          )}
        </SoftCard>
      </div>
    </div>
  );
}
