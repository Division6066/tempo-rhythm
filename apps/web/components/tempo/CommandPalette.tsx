"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "@tempo/ui/icons";
import { TEMPO_SCREENS } from "@/lib/tempo-nav";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * CommandPalette — ⌘K screen jumper.
 * @source docs/design/claude-export/design-system/app.html (ScreenPicker)
 * @action jumpToScreen
 * @navigate push(screen.route)
 */
export function CommandPalette({ open, onOpenChange }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery("");
      setFocused(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TEMPO_SCREENS.slice(0, 40);
    return TEMPO_SCREENS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocused((i) => Math.min(i + 1, items.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocused((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        const picked = items[focused];
        if (picked) {
          onOpenChange(false);
          router.push(picked.route);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, focused, onOpenChange, router]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-[rgba(0,0,0,0.35)] backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-[min(640px,90vw)] rounded-2xl bg-card border border-border shadow-lift overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-soft">
          <Search size={16} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search screens…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setFocused(0);
            }}
            className="flex-1 bg-transparent text-body outline-none placeholder:text-subtle-foreground"
          />
        </div>

        <ul className="max-h-[50vh] overflow-y-auto scroll-subtle p-1.5">
          {items.length === 0 ? (
            <li className="px-3.5 py-8 text-center text-muted-foreground text-small">
              Nothing matches. Try a different word.
            </li>
          ) : (
            items.map((s, i) => (
              <li
                key={s.slug}
                className={[
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-small cursor-pointer",
                  i === focused
                    ? "bg-surface-sunken"
                    : "hover:bg-surface-sunken",
                ].join(" ")}
                onMouseEnter={() => setFocused(i)}
                onClick={() => {
                  onOpenChange(false);
                  router.push(s.route);
                }}
              >
                <span className="text-caption font-tabular px-2 py-0.5 rounded-full bg-surface-sunken text-muted-foreground">
                  {s.category}
                </span>
                <span className="flex-1 text-foreground">{s.title}</span>
                <span className="text-caption font-tabular text-muted-foreground opacity-60">
                  {s.route}
                </span>
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border-soft text-caption text-muted-foreground font-tabular">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
