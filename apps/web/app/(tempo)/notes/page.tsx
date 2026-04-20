/**
 * @screen: notes
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-2.jsx
 * @queries: notes.listByUser withIndex("by_userId_deletedAt")
 * @mutations: notes.softDelete @index by_userId_deletedAt
 * @routes-to: /notes/[id]
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import Link from "next/link";
import { useState } from "react";
import { mockNoteFolders, mockNotes } from "@tempo/mock-data";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { Plus } from "@tempo/ui/icons";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-6xl gap-6 p-6 pb-24 md:flex md:p-8">
        <aside className="mb-6 w-full shrink-0 space-y-2 md:mb-0 md:w-52">
          {mockNoteFolders.map((f) => (
            <Button
              key={f.name}
              type="button"
              variant={f.name === "All notes" ? "soft" : "ghost"}
              size="sm"
              className="w-full justify-between"
            >
              <span className="truncate">{f.name}</span>
              <span className="font-tabular text-caption text-muted-foreground">{f.count}</span>
            </Button>
          ))}
        </aside>
        <div className="min-w-0 flex-1 space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-eyebrow text-muted-foreground">Library · Notes</p>
              <h1 className="text-h1 font-serif text-foreground">Notes that breathe.</h1>
            </div>
            {/*
              @action createNote
              @mutation: notes.create @index by_userId_deletedAt
              @auth: required
              @errors: toast
              @env: NEXT_PUBLIC_CONVEX_URL
            */}
            <Button type="button" variant="primary" leadingIcon={<Plus size={14} />}>
              New note
            </Button>
          </header>
          <ul className="space-y-3">
            {mockNotes.map((n) => (
              <li key={n.id}>
                <SoftCard padding="md" className="transition-colors hover:bg-surface-sunken/50">
                  {/*
                    @action openNote
                    @navigate: /notes/{noteId}
                    @query: notes.getById (with deletedAt undefined check)
                    @index: by_userId_deletedAt
                    @auth: required
                    @errors: not-found state
                    @env: NEXT_PUBLIC_CONVEX_URL
                  */}
                  <Link href={`/notes/${n.id}`} className="block space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-h3 font-serif text-foreground">{n.title}</h2>
                      {n.tags.map((tag) => (
                        <Pill key={tag} tone="slate">
                          {tag}
                        </Pill>
                      ))}
                    </div>
                    <p className="line-clamp-2 text-small text-muted-foreground">{n.body}</p>
                  </Link>
                </SoftCard>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ScreenSurface>
  );
}
