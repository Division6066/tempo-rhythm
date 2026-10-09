"use client";

import { useQuery } from "convex/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { ResultGroup } from "./ResultGroup";

const DEBOUNCE_MS = 250;

const STATUS_LABEL: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  cancelled: "Cancelled",
};

export function SearchScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams?.get("q") ?? "";
  const [draft, setDraft] = useState(urlQuery);
  const [query, setQuery] = useState(urlQuery.trim());
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const next = draft.trim();
    if (next === query) return;
    const timer = setTimeout(() => {
      setQuery(next);
      router.replace(next ? `${pathname}?q=${encodeURIComponent(next)}` : pathname);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, query, router, pathname]);

  const results = useQuery(api.search.all, query ? { query } : "skip");

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    listRef.current?.querySelector<HTMLElement>("[data-search-result]")?.focus();
  };

  const noMatches =
    results !== undefined &&
    results.notes.length === 0 &&
    results.tasks.length === 0 &&
    results.habits.length === 0 &&
    results.goals.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <Input
        type="search"
        aria-label="Search notes, tasks, habits and goals"
        placeholder="Search notes, tasks, habits and goals"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
      />
      <div ref={listRef} aria-live="polite" className="flex flex-col gap-6">
        {!query ? (
          <p className="text-muted-foreground text-sm">
            Type to search your notes, tasks, habits and goals.
          </p>
        ) : results === undefined ? (
          <p className="text-muted-foreground text-sm">Searching…</p>
        ) : noMatches ? (
          <p className="text-sm">No matches for “{query}”.</p>
        ) : (
          <>
            <ResultGroup
              title="Notes"
              rows={results.notes.map((n) => ({
                id: n._id,
                label: n.title,
                detail: n.snippet,
                href: `/notes/${n._id}`,
              }))}
            />
            <ResultGroup
              title="Tasks"
              rows={results.tasks.map((t) => ({
                id: t._id,
                label: t.title,
                detail: STATUS_LABEL[t.status] ?? t.status,
                href: "/tasks",
              }))}
            />
            <ResultGroup
              title="Habits"
              rows={results.habits.map((h) => ({ id: h._id, label: h.name, href: "/habits" }))}
            />
            <ResultGroup
              title="Goals"
              rows={results.goals.map((g) => ({ id: g._id, label: g.title, href: "/goals" }))}
            />
          </>
        )}
      </div>
    </div>
  );
}
