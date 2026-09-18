import { useNavigate } from "@/lib/tempo-graft/router";
import { useEffect, useMemo, useState } from "react";
import { TEMPLATES } from "@tempo-v0/lib/tempo/templates";
import { studioStore, useStudio } from "@tempo-v0/lib/tempo/studio";
import { cn } from "@tempo-v0/lib/utils";

const SCREENS = [
  { to: "/daily-note", label: "Daily note", hint: "NotePlan day" },
  { to: "/review", label: "Review", hint: "Open · overdue · waiting" },
  { to: "/today", label: "Today", hint: "Overdue + list" },
  { to: "/notes", label: "Notes index", hint: "Searchable vault" },
  { to: "/templates", label: "Templates", hint: "JSON + markdown" },
  { to: "/study", label: "Study", hint: "Cards · quiz · tutor" },
  { to: "/map", label: "Map", hint: "Whiteboard" },
  { to: "/coach", label: "Coach", hint: "Chat + voice" },
  { to: "/brain-dump", label: "Brain dump", hint: "Sort later" },
  { to: "/journal", label: "Journal", hint: "Markdown" },
  { to: "/dashboard", label: "Pulse", hint: "Week" },
  { to: "/tasks", label: "Tasks", hint: "Board" },
  { to: "/habits", label: "Habits", hint: "Pebbles" },
  { to: "/settings", label: "Settings", hint: "Ruler · dyslexia" },
] as const;

type Item = { kind: string; label: string; hint: string; run: () => void };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const studio = useStudio();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQ("");
        setActive(0);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    const notes: Item[] = studio.notes.map((n) => ({
      kind: "note",
      label: n.title,
      hint: n.tag,
      run: () => {
        void navigate({ to: "/notes/$id", params: { id: n.id } });
      },
    }));
    const tpls: Item[] = TEMPLATES.map((t) => ({
      kind: "template",
      label: `${t.slash}  ${t.title}`,
      hint: t.kicker,
      run: () => {
        void navigate({ to: "/templates/$id", params: { id: t.id } });
      },
    }));
    const screens: Item[] = SCREENS.map((s) => ({
      kind: "screen",
      label: s.label,
      hint: s.hint,
      run: () => {
        void navigate({ to: s.to });
      },
    }));
    const week: Item = {
      kind: "screen",
      label: "Weekly note",
      hint: "Week container",
      run: () => {
        void navigate({ to: "/daily-note", search: { scope: "week" } });
      },
    };
    const year: Item = {
      kind: "screen",
      label: "Yearly note",
      hint: "One sentence for the year",
      run: () => {
        void navigate({ to: "/daily-note", search: { scope: "year" } });
      },
    };
    const all = [...screens, week, year, ...notes, ...tpls];
    if (!query) return all.slice(0, 12);
    return all.filter((i) => `${i.label} ${i.hint}`.toLowerCase().includes(query)).slice(0, 12);
  }, [q, studio.notes, navigate]);

  useEffect(() => setActive(0), [q, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-start bg-ink/40 px-4 pt-[12vh]" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-(--shadow-modal)"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => (a + 1) % Math.max(1, items.length));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => (a - 1 + items.length) % Math.max(1, items.length));
            }
            if (e.key === "Enter" && items[active]) {
              items[active].run();
              setOpen(false);
              studioStore.setFocusMode(false);
            }
          }}
          placeholder="Jump to a note, template, or screen"
          className="h-14 w-full border-b border-border bg-transparent px-4 font-display text-lg text-ink outline-none placeholder:text-faint"
        />
        <ul className="max-h-80 overflow-auto py-2">
          {items.length === 0 ? (
            <li className="px-4 py-6 text-sm text-muted">Nothing matches. Try a tag or a slash.</li>
          ) : (
            items.map((item, i) => (
              <li key={`${item.kind}-${item.label}`}>
                <button
                  type="button"
                  onClick={() => {
                    item.run();
                    setOpen(false);
                    studioStore.setFocusMode(false);
                  }}
                  className={cn(
                    "flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-left",
                    i === active ? "bg-accent-soft" : "hover:bg-surface-2",
                  )}
                >
                  <span className="text-sm text-ink">{item.label}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wide text-faint">{item.hint}</span>
                </button>
              </li>
            ))
          )}
        </ul>
        <p className="border-t border-border px-4 py-2 font-mono text-[10px] text-faint">⌘K · ↑↓ · Enter · Esc</p>
      </div>
    </div>
  );
}

export function CommandHint({ className }: { className?: string }) {
  return <span className={cn("hidden font-mono text-[10px] text-faint md:inline", className)}>⌘K</span>;
}
