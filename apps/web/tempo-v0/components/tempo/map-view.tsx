import { useMemo, useRef, useState, type PointerEvent } from "react";
import { Link, useNavigate } from "@/lib/tempo-graft/router";
import { toast } from "@/lib/tempo-graft/toast";
import { Button } from "@tempo-v0/components/ui/button";
import { askAboutSource, clusterMap, makeStudySetAi } from "@/lib/tempo-graft/ai";
import { extractWiki } from "@tempo-v0/lib/tempo/note-syntax";
import {
  cardsFromMarkdown,
  clozeFromMarkdown,
  materializeCards,
  materializeCloze,
  materializeQuiz,
  quizFromCards,
  studyGuideLocal,
} from "@tempo-v0/lib/tempo/study-local";
import { studioStore, useStudio, type MapCard } from "@tempo-v0/lib/tempo/studio";
import { cn } from "@tempo-v0/lib/utils";

export function MapView() {
  const { mapCards, notes } = useStudio();
  const navigate = useNavigate();
  const board = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(mapCards[0]?.id ?? null);
  const [busy, setBusy] = useState(false);
  const [pan, setPan] = useState<{ x: number; y: number } | null>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  const noteById = useMemo(() => new Map(notes.map((n) => [n.id, n])), [notes]);
  const links: { from: string; to: string }[] = [];
  for (const card of mapCards) {
    const body = card.noteId ? (noteById.get(card.noteId)?.body ?? card.body) : card.body;
    const title = card.noteId ? (noteById.get(card.noteId)?.title ?? card.title) : card.title;
    for (const wiki of extractWiki(`${body} [[${title}]]`)) {
      const target = mapCards.find((o) => {
        const t = o.noteId ? noteById.get(o.noteId)?.title ?? o.title : o.title;
        return t.toLowerCase() === wiki.toLowerCase() && o.id !== card.id;
      });
      if (target) links.push({ from: card.id, to: target.id });
    }
  }

  const active = mapCards.find((c) => c.id === selected) ?? null;

  function startCard(e: PointerEvent<HTMLElement>, id: string, x: number, y: number) {
    if (!board.current) return;
    const rect = board.current.getBoundingClientRect();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ id, ox: e.clientX - rect.left - origin.x - x, oy: e.clientY - rect.top - origin.y - y });
    setSelected(id);
  }

  function move(e: PointerEvent<HTMLDivElement>) {
    if (!board.current) return;
    const rect = board.current.getBoundingClientRect();
    if (drag) {
      studioStore.moveMapCard(
        drag.id,
        Math.max(8, e.clientX - rect.left - origin.x - drag.ox),
        Math.max(8, e.clientY - rect.top - origin.y - drag.oy),
      );
      return;
    }
    if (pan) {
      setOrigin({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }

  async function cluster() {
    setBusy(true);
    try {
      const res = await clusterMap({
        data: {
          cards: mapCards.map((c) => ({
            id: c.id,
            title: c.noteId ? (noteById.get(c.noteId)?.title ?? c.title) : c.title,
            body: c.body,
          })),
        },
      });
      if (res.ok && res.positions?.length) {
        studioStore.layoutMapCards(res.positions);
        toast("Cards clustered by topic.");
      } else {
        gridLayout();
        toast("Coach was quiet — I laid them on a grid.");
      }
    } catch {
      gridLayout();
      toast("Laid out locally.");
    } finally {
      setBusy(false);
    }
  }

  function gridLayout() {
    studioStore.layoutMapCards(
      mapCards.map((c, i) => ({
        id: c.id,
        x: 48 + (i % 4) * 220,
        y: 48 + Math.floor(i / 4) * 160,
      })),
    );
  }

  async function learnCluster() {
    const ids = new Set<string>();
    if (selected) {
      ids.add(selected);
      for (const l of links) {
        if (l.from === selected) ids.add(l.to);
        if (l.to === selected) ids.add(l.from);
      }
    }
    const clusterCards = (ids.size ? mapCards.filter((c) => ids.has(c.id)) : mapCards).slice(0, 8);
    const markdown = clusterCards
      .map((c) => {
        const title = c.noteId ? (noteById.get(c.noteId)?.title ?? c.title) : c.title;
        const body = c.noteId ? (noteById.get(c.noteId)?.body ?? c.body) : c.body;
        return `# ${title}\n\n${body}`;
      })
      .join("\n\n");
    if (!markdown.trim()) {
      toast("Pin a card first.");
      return;
    }
    setBusy(true);
    try {
      const res = await makeStudySetAi({ data: { markdown, title: "Map cluster" } });
      const cards = res.ok && res.set ? res.set.cards : cardsFromMarkdown(markdown);
      const quiz = res.ok && res.set ? res.set.quiz : quizFromCards(cards);
      const set = studioStore.addStudySet({
        title: clusterCards[0] ? `${clusterCards[0].title} cluster` : "Map cluster",
        notesMd: res.ok && res.set ? res.set.notesMd : markdown,
        cards: materializeCards(cards),
        quiz: materializeQuiz(quiz),
        cloze: materializeCloze(res.ok && res.set?.cloze?.length ? res.set.cloze : clozeFromMarkdown(markdown)),
        guideMd: res.ok && res.set?.guideMd ? res.set.guideMd : studyGuideLocal(markdown, "Map cluster"),
      });
      toast(res.ok ? "Lesson from the cluster." : "Pulled terms from the cards.");
      navigate({ to: "/study/$id", params: { id: set.id } });
    } catch {
      toast("Couldn't reach the coach. The cards still hold the ideas.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">Map</p>
          <h1 className="font-display text-2xl font-medium">One idea, one card.</h1>
        </div>
        <div className="flex flex-wrap gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const card = studioStore.addMapCard({
                title: "Untitled",
                body: "One thought. Link it with [[ ]] when it earns a friend.",
                x: 120 + mapCards.length * 24,
                y: 120 + mapCards.length * 16,
              });
              setSelected(card.id);
            }}
          >
            New card
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void cluster()}>
            {busy ? "Clustering…" : "Cluster with coach"}
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void learnCluster()}>
            Learn this cluster
          </Button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <div
          ref={board}
          className="relative min-h-[640px] flex-1 overflow-hidden map-dots"
          onPointerMove={move}
          onPointerDown={(e) => {
            if (e.target !== e.currentTarget) return;
            setPan({ x: e.clientX - origin.x, y: e.clientY - origin.y });
            setSelected(null);
          }}
          onPointerUp={() => {
            setDrag(null);
            setPan(null);
          }}
        >
          <div className="absolute" style={{ transform: `translate(${origin.x}px, ${origin.y}px)` }}>
            <svg className="pointer-events-none absolute inset-0 overflow-visible" width={1600} height={1200} aria-hidden>
              {links.map((l) => {
                const a = mapCards.find((c) => c.id === l.from);
                const b = mapCards.find((c) => c.id === l.to);
                if (!a || !b) return null;
                return (
                  <line
                    key={`${l.from}-${l.to}`}
                    x1={a.x + 100}
                    y1={a.y + 40}
                    x2={b.x + 100}
                    y2={b.y + 40}
                    stroke="var(--color-accent)"
                    strokeOpacity="0.45"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
            {mapCards.map((card) => {
              const title = card.noteId ? (noteById.get(card.noteId)?.title ?? card.title) : card.title;
              return (
                <article
                  key={card.id}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    startCard(e, card.id, card.x, card.y);
                  }}
                  style={{ left: card.x, top: card.y }}
                  className={cn(
                    "absolute w-[200px] cursor-grab rounded-xl border bg-surface p-3 shadow-(--shadow-soft) active:cursor-grabbing",
                    selected === card.id ? "border-accent" : "border-border",
                  )}
                >
                  <h2 className="font-display text-base leading-tight">{title}</h2>
                  <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-muted">{card.body}</p>
                  {card.noteId ? (
                    <Link
                      to="/notes/$id"
                      params={{ id: card.noteId }}
                      className="mt-2 inline-block font-mono text-[10px] text-accent"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      Open note
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
        {active ? (
          <CardDrawer card={active} noteTitle={active.noteId ? noteById.get(active.noteId)?.title : undefined} />
        ) : null}
      </div>
    </div>
  );
}

function CardDrawer({ card, noteTitle }: { card: MapCard; noteTitle?: string }) {
  const [q, setQ] = useState("");
  const [log, setLog] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { notes } = useStudio();
  const body = card.noteId ? (notes.find((n) => n.id === card.noteId)?.body ?? card.body) : card.body;

  async function ask() {
    const question = q.trim() || "Explain this card in two short sentences.";
    setBusy(true);
    try {
      const res = await askAboutSource({ data: { question, context: `# ${card.title}\n\n${body}` } });
      setLog(res.ok && res.text ? res.text : "Coach was quiet. The card still holds the idea.");
    } catch {
      setLog("Couldn't reach the coach.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="hidden w-[300px] shrink-0 flex-col gap-3 overflow-auto border-l border-border p-4 md:flex">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">Card</p>
      <input
        value={card.title}
        onChange={(e) => studioStore.updateMapCard(card.id, { title: e.target.value })}
        className="h-10 rounded-md border border-border bg-surface px-3 font-display text-lg"
      />
      <textarea
        value={card.body}
        onChange={(e) => studioStore.updateMapCard(card.id, { body: e.target.value })}
        rows={8}
        className="rounded-md border border-border bg-surface p-3 font-mono text-[12px] leading-relaxed"
      />
      <p className="text-[11px] leading-relaxed text-faint">
        Wiki links in the body draw lines. Try [[{noteTitle ?? "Daily note"}]].
      </p>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          void ask();
        }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">Ask about this source</p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Explain, take notes, organize…"
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
        />
        <Button type="submit" size="sm" variant="outline" disabled={busy} className="w-full">
          {busy ? "Looking…" : "Ask"}
        </Button>
      </form>
      {log ? <p className="rounded-lg bg-accent-soft px-3 py-2 font-display text-[13px] leading-relaxed">{log}</p> : null}
      {card.noteId ? (
        <Button asChild variant="outline" size="sm">
          <Link to="/notes/$id" params={{ id: card.noteId }}>
            Open linked note
          </Link>
        </Button>
      ) : null}
      <Button size="sm" variant="ghost" onClick={() => studioStore.removeMapCard(card.id)}>
        Remove card
      </Button>
    </aside>
  );
}
