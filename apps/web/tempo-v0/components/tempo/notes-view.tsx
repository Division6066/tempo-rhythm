import { Link, useNavigate } from "@/lib/tempo-graft/router";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@tempo-v0/components/tempo/empty-state";
import { Button } from "@tempo-v0/components/ui/button";
import { Input } from "@tempo-v0/components/ui/input";
import { allTags, searchDocs } from "@tempo-v0/lib/tempo/note-syntax";
import { studioStore, useStudio } from "@tempo-v0/lib/tempo/studio";
import { cn } from "@tempo-v0/lib/utils";

export function NotesView() {
  const { notes, dailyNotes, mapCards } = useStudio();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [layout, setLayout] = useState<"list" | "board">("list");

  const corpus = useMemo(
    () => [
      ...notes.map((n) => ({ id: n.id, title: n.title, body: n.body, kind: "note" as const, tag: n.tag })),
      ...Object.entries(dailyNotes).map(([day, body]) => ({
        id: `day:${day}`,
        title: `Daily · ${day}`,
        body,
        kind: "daily" as const,
        tag: "daily",
      })),
    ],
    [notes, dailyNotes],
  );
  const tags = useMemo(() => allTags(corpus), [corpus]);
  const hits = useMemo(() => {
    const found = searchDocs(q, corpus);
    if (!tag) return found;
    return found.filter((d) => d.body.toLowerCase().includes(`#${tag}`) || notes.find((n) => n.id === d.id)?.tag === tag);
  }, [q, tag, corpus, notes]);

  function create() {
    const note = studioStore.addNote("Untitled");
    navigate({ to: "/notes/$id", params: { id: note.id } });
  }

  if (notes.length === 0) {
    return (
      <EmptyState
        title="A clean cream page."
        body="Start a note, or paste from anywhere. Markdown works."
        actionLabel="New note"
        onAction={create}
      />
    );
  }

  const columns = useMemo(() => {
    const groups = new Map<string, typeof hits>();
    for (const doc of hits) {
      const key = notes.find((n) => n.id === doc.id)?.tag ?? (doc.kind === "daily" ? "daily" : "note");
      const list = groups.get(key) ?? [];
      list.push(doc);
      groups.set(key, list);
    }
    return [...groups.entries()];
  }, [hits, notes]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Library · index</p>
          <h1 className="font-display text-4xl font-medium tracking-tight">Notes</h1>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-full border border-border p-0.5">
            {(["list", "board"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLayout(l)}
                className={cn("h-8 rounded-full px-3 text-xs capitalize", layout === l ? "bg-ink text-bg" : "text-muted")}
              >
                {l}
              </button>
            ))}
          </div>
          <Button onClick={create}>
            <Plus className="size-4" />
            New note
          </Button>
        </div>
      </header>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles, tags, [[links]]" />
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(tag === t ? null : t)}
            className={`rounded-full px-3 py-1 font-mono text-[11px] ${tag === t ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted"}`}
          >
            #{t}
          </button>
        ))}
      </div>
      {layout === "list" ? (
        <ul className="space-y-2">
          {hits.map((doc) => (
            <li key={doc.id}>
              <DocCard
                doc={doc}
                onPin={() => {
                  if (doc.kind === "daily") return;
                  studioStore.addMapCard({
                    title: doc.title,
                    body: doc.body.slice(0, 280),
                    noteId: doc.id,
                    x: 80 + mapCards.length * 24,
                    y: 90 + mapCards.length * 16,
                  });
                  navigate({ to: "/map" });
                }}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {columns.map(([col, docs]) => (
            <section key={col} className="rounded-xl border border-border bg-surface p-3">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{col}</p>
              <ul className="space-y-2">
                {docs.map((doc) => (
                  <li key={doc.id}>
                    <DocCard doc={doc} compact />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function DocCard({
  doc,
  onPin,
  compact,
}: {
  doc: { id: string; title: string; body: string; kind?: string };
  onPin?: () => void;
  compact?: boolean;
}) {
  const inner = (
    <>
      <p className="font-display text-lg">{doc.title}</p>
      {compact ? null : (
        <p className="mt-1 line-clamp-2 text-sm text-muted">{doc.body.replace(/[#*_[\]]/g, "").slice(0, 140)}</p>
      )}
    </>
  );
  if (doc.kind === "daily") {
    return (
      <Link
        to="/daily-note"
        onClick={() => studioStore.setSelectedDay(doc.id.replace("day:", ""))}
        className="block rounded-xl border border-border bg-surface p-4 hover:border-accent"
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-surface p-4 hover:border-accent">
      <Link to="/notes/$id" params={{ id: doc.id }} className="block">
        {inner}
      </Link>
      {onPin ? (
        <button type="button" onClick={onPin} className="mt-2 font-mono text-[10px] text-accent">
          Pin to map
        </button>
      ) : null}
    </div>
  );
}
