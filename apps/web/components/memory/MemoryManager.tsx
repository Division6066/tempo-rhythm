"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  MEMORY_MAX,
  SECTORS,
  SECTOR_LABELS,
  sortForDisplay,
  validateMemory,
  type Sector,
} from "./memoryView";

const SEARCH_DELAY_MS = 250;
const LIST_LIMIT = 100;

export function MemoryManager() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState<Sector | "">("");
  const [draft, setDraft] = useState("");
  const [draftSector, setDraftSector] = useState<Sector>("general");
  const [formError, setFormError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [forgotten, setForgotten] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [retryId, setRetryId] = useState<Id<"memories"> | null>(null);
  const [showContext, setShowContext] = useState(false);

  const remember = useMutation(api.memory.remember);
  const forget = useMutation(api.memory.forget);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(search.trim()), SEARCH_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [search]);

  const searching = debounced.length >= 2;
  const listed = useQuery(
    api.memory.list,
    isAuthenticated && !searching ? { sector: filter || undefined, limit: LIST_LIMIT } : "skip"
  );
  const recalled = useQuery(
    api.memory.recall,
    isAuthenticated && searching ? { query: debounced, limit: LIST_LIMIT } : "skip"
  );
  const preview = useQuery(api.memory.context, isAuthenticated && showContext ? {} : "skip");

  const current = searching ? recalled : listed;
  // Keep the last results on screen while args change, so the page chrome stays mounted.
  const lastRaw = useRef(current);
  if (current !== undefined) lastRaw.current = current;
  const raw = current ?? lastRaw.current;
  const refreshing = isAuthenticated && current === undefined && raw !== undefined;
  const rows =
    raw === undefined
      ? undefined
      : sortForDisplay(raw).filter((m) => !filter || m.sector === filter);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (adding) return;
    const result = validateMemory(draft);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setFormError(null);
    setAdding(true);
    try {
      await remember({ content: result.text, sector: draftSector });
      setDraft("");
    } catch {
      setFormError("That didn't save. Try again?");
    } finally {
      setAdding(false);
    }
  }

  async function onForget(memoryId: Id<"memories">) {
    if (busyId) return;
    setBusyId(memoryId);
    setRetryId(null);
    try {
      await forget({ memoryId });
      setForgotten((prev) => new Set(prev).add(memoryId));
    } catch {
      setRetryId(memoryId);
    } finally {
      setBusyId(null);
    }
  }

  if (authLoading || (isAuthenticated && rows === undefined)) {
    return (
      <section aria-busy="true" aria-labelledby="memory-heading" className="max-w-2xl">
        <h2 id="memory-heading" className="font-heading text-xl font-semibold text-foreground">
          What Tempo remembers
        </h2>
        <output className="mt-3 block space-y-2">
          <span className="sr-only">Loading your memories.</span>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
          ))}
        </output>
      </section>
    );
  }

  if (!isAuthenticated || rows === undefined) return null;

  return (
    <section
      aria-labelledby="memory-heading"
      aria-busy={refreshing || undefined}
      className="max-w-2xl space-y-6"
    >
      <h2 id="memory-heading" className="font-heading text-xl font-semibold text-foreground">
        What Tempo remembers
      </h2>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Label htmlFor="memory-search" className="sr-only">
            Search memories
          </Label>
          <Input
            id="memory-search"
            type="search"
            placeholder="Search what Tempo remembers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="memory-filter" className="sr-only">
            Filter by kind
          </Label>
          <select
            id="memory-filter"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as Sector | "")}
          >
            <option value="">All kinds</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {SECTOR_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {refreshing ? (
        <output className="block text-xs text-muted-foreground">Updating.</output>
      ) : null}

      {rows.length === 0 ? (
        refreshing ? null : (
          <p className="text-sm text-muted-foreground">
            {searching
              ? "No memories match that search."
              : filter
                ? `No ${SECTOR_LABELS[filter].toLowerCase()} memories. Choose All kinds to see the rest.`
                : "Nothing remembered yet."}
          </p>
        )
      ) : (
        <ul className="space-y-2">
          {rows.map((m) => {
            const gone = forgotten.has(m._id);
            return (
              <li
                key={m._id}
                className="flex items-start justify-between gap-3 rounded-md border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="break-words text-sm text-foreground">{m.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{SECTOR_LABELS[m.sector]}</p>
                  {retryId === m._id ? (
                    <p role="alert" className="mt-1 text-sm text-destructive">
                      That didn&apos;t go through. Try again?
                    </p>
                  ) : null}
                </div>
                {gone ? (
                  <output className="text-sm text-muted-foreground">Forgotten</output>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busyId !== null}
                    onClick={() => onForget(m._id)}
                  >
                    {retryId === m._id ? "Retry" : "Forget"}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a memory</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAdd} className="space-y-3" noValidate>
            <div>
              <Label htmlFor="memory-new">Something for Tempo to remember</Label>
              <Input
                id="memory-new"
                value={draft}
                aria-invalid={formError ? true : undefined}
                aria-describedby={formError ? "memory-new-error" : undefined}
                onChange={(e) => setDraft(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Up to {MEMORY_MAX} characters.
              </p>
            </div>
            <div>
              <Label htmlFor="memory-new-sector">Kind</Label>
              <select
                id="memory-new-sector"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={draftSector}
                onChange={(e) => setDraftSector(e.target.value as Sector)}
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {SECTOR_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            {formError ? (
              <p id="memory-new-error" role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            ) : null}
            <Button type="submit" disabled={adding}>
              {adding ? "Saving" : "Remember this"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <Button
          type="button"
          variant="ghost"
          aria-expanded={showContext}
          aria-controls="memory-context"
          onClick={() => setShowContext((s) => !s)}
        >
          What the coach sees
        </Button>
        {showContext ? (
          <div id="memory-context" className="mt-2 rounded-md border border-border p-3">
            {preview === undefined ? (
              <p className="text-sm text-muted-foreground">Loading.</p>
            ) : preview.count === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing remembered yet.</p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {preview.count} {preview.count === 1 ? "memory" : "memories"} shared with the
                  coach
                </p>
                <div className="mt-2 space-y-1 text-sm text-foreground">
                  {preview.text.split("\n").map((line, i) => (
                    <p key={`${i}-${line}`}>{line.replace(/^- /, "")}</p>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
