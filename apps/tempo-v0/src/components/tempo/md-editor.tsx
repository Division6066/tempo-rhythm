import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from "react";
import { Markdown, toggleMarkdownTaskLine } from "@/lib/markdown";
import { renderTemplate, SLASH_ITEMS, TEMPLATES, type SlashItem } from "@/lib/tempo/templates";
import { cn } from "@/lib/utils";

export type WikiOption = { id: string; title: string };

export function MdEditor({
  value,
  onChange,
  placeholder,
  minHeight = 420,
  mode = "split",
  wikiOptions = [],
  onAgent,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  minHeight?: number;
  mode?: "write" | "read" | "split";
  wikiOptions?: WikiOption[];
  onAgent?: (slash: string, source: string) => void;
}) {
  const [view, setView] = useState<"write" | "read" | "split">(mode);
  const [slash, setSlash] = useState<{ start: number; query: string } | null>(null);
  const [wiki, setWiki] = useState<{ start: number; query: string } | null>(null);
  const [active, setActive] = useState(0);
  const ta = useRef<HTMLTextAreaElement>(null);

  const matches = useMemo(() => {
    if (!slash) return [];
    const q = slash.query.toLowerCase();
    return SLASH_ITEMS.filter(
      (s) => s.slash.includes(q) || s.label.toLowerCase().includes(q) || s.hint.toLowerCase().includes(q),
    ).slice(0, 9);
  }, [slash]);

  const wikiHits = useMemo(() => {
    if (!wiki) return [];
    const q = wiki.query.toLowerCase();
    return wikiOptions.filter((n) => n.title.toLowerCase().includes(q)).slice(0, 8);
  }, [wiki, wikiOptions]);

  useEffect(() => setActive(0), [slash?.query, wiki?.query]);

  function insertAt(from: number, to: number, text: string) {
    const next = value.slice(0, from) + text + value.slice(to);
    onChange(next);
    requestAnimationFrame(() => {
      const el = ta.current;
      if (!el) return;
      const pos = from + text.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }

  function applySlash(item: SlashItem) {
    if (!slash) return;
    if (item.kind === "agent") {
      insertAt(slash.start, slash.start + 1 + slash.query.length, "");
      setSlash(null);
      onAgent?.(item.slash, value);
      return;
    }
    const tmpl = TEMPLATES.find((t) => t.slash === item.slash);
    const text = tmpl ? renderTemplate(tmpl) : item.insert;
    insertAt(slash.start, slash.start + 1 + slash.query.length, text);
    setSlash(null);
  }

  function applyWiki(title: string) {
    if (!wiki) return;
    insertAt(wiki.start, wiki.start + 2 + wiki.query.length, `[[${title}]]`);
    setWiki(null);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const list = slash ? matches : wiki ? wikiHits : [];
    if ((slash || wiki) && list.length) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => (a + 1) % list.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => (a - 1 + list.length) % list.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (slash) applySlash(matches[active]);
        else if (wikiHits[active]) applyWiki(wikiHits[active].title);
        return;
      }
      if (e.key === "Escape") {
        setSlash(null);
        setWiki(null);
        return;
      }
    }
    if (e.key === "Tab" && !slash && !wiki) {
      e.preventDefault();
      const el = e.currentTarget;
      insertAt(el.selectionStart, el.selectionEnd, "  ");
    }
  }

  function onInput(e: ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    onChange(next);
    const pos = e.target.selectionStart;
    const until = next.slice(0, pos);
    const lineStart = until.lastIndexOf("\n") + 1;
    const line = until.slice(lineStart);
    const slashMatch = line.match(/(^|\s)\/([a-z-]*)$/i);
    const wikiMatch = line.match(/\[\[([^\]]*)$/);
    if (wikiMatch) {
      setWiki({ start: lineStart + (wikiMatch.index ?? 0), query: wikiMatch[1] });
      setSlash(null);
    } else if (slashMatch) {
      setSlash({ start: lineStart + (slashMatch.index ?? 0) + (slashMatch[1] ? slashMatch[1].length : 0), query: slashMatch[2] });
      setWiki(null);
    } else {
      setSlash(null);
      setWiki(null);
    }
  }

  const caretTop = (() => {
    const start = slash?.start ?? wiki?.start ?? 0;
    const lines = value.slice(0, start).split("\n").length;
    return Math.min(16 + lines * 21, 260);
  })();

  const showWrite = view !== "read";
  const showRead = view !== "write";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex flex-wrap items-center gap-1">
        {(["write", "split", "read"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "h-8 rounded-full px-3 text-xs font-medium capitalize",
              view === v ? "bg-ink text-bg" : "text-muted hover:text-ink",
            )}
          >
            {v}
          </button>
        ))}
        <p className="ml-auto hidden font-mono text-[10px] text-faint md:block">
          / slash · [[wiki]] · * [ ] · !! · @09:30 · #tag · ==highlight==
        </p>
      </div>
      <div className={cn("relative grid min-h-0 flex-1 gap-3", showWrite && showRead ? "lg:grid-cols-2" : "grid-cols-1")}>
        {showWrite ? (
          <div className="relative min-h-0">
            <textarea
              ref={ta}
              value={value}
              onChange={onInput}
              onKeyDown={onKeyDown}
              placeholder={placeholder ?? "Type / for commands. [[ for a page. Markdown is the file."}
              spellCheck
              className={cn(
                "h-full w-full resize-y rounded-xl border border-border bg-surface p-4 font-mono text-[13px] leading-relaxed text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                minHeight >= 480 ? "min-h-[480px]" : "min-h-[280px] md:min-h-[420px]",
              )}
            />
            {slash && matches.length > 0 ? (
              <Menu top={caretTop}>
                {matches.map((item, i) => (
                  <MenuRow
                    key={item.id}
                    active={i === active}
                    label={item.label}
                    hint={`${item.slash}${item.kind === "template" ? " · tmpl" : item.kind === "agent" ? " · agent" : ""}`}
                    onPick={() => applySlash(item)}
                  />
                ))}
              </Menu>
            ) : null}
            {wiki && wikiHits.length > 0 ? (
              <Menu top={caretTop}>
                {wikiHits.map((item, i) => (
                  <MenuRow
                    key={item.id}
                    active={i === active}
                    label={item.title}
                    hint="wiki"
                    onPick={() => applyWiki(item.title)}
                  />
                ))}
              </Menu>
            ) : null}
          </div>
        ) : null}
        {showRead ? (
          <div className="overflow-auto rounded-xl border border-border bg-surface p-5">
            {value.trim() ? (
              <Markdown
                source={value}
                onToggleTask={(lineIndex, checked) => onChange(toggleMarkdownTaskLine(value, lineIndex, checked))}
              />
            ) : (
              <p className="font-display text-muted">Nothing on the page yet. Type /daily to start the day.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Menu({ top, children }: { top: number; children: ReactNode }) {
  return (
    <ul
      className="absolute left-4 z-20 w-[min(100%-2rem,340px)] overflow-hidden rounded-xl border border-border bg-surface shadow-(--shadow-modal)"
      style={{ top }}
    >
      {children}
    </ul>
  );
}

function MenuRow({
  active,
  label,
  hint,
  onPick,
}: {
  active: boolean;
  label: string;
  hint: string;
  onPick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onPick();
        }}
        className={cn(
          "flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-sm",
          active ? "bg-accent-soft" : "hover:bg-surface-2",
        )}
      >
        <span className="font-medium text-ink">{label}</span>
        <span className="font-mono text-[11px] text-faint">{hint}</span>
      </button>
    </li>
  );
}
