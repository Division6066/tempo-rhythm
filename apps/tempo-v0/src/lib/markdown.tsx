import { Fragment, type ReactNode } from "react";
import { parseTaskLine } from "@/lib/tempo/note-syntax";
import { cn } from "@/lib/utils";

export type MarkdownTaskHandler = (lineIndex: number, checked: boolean, sourceLine: string) => void;

type InlinePart =
  | { kind: "text"; value: string }
  | { kind: "em"; value: string }
  | { kind: "strong"; value: string }
  | { kind: "strike"; value: string }
  | { kind: "code"; value: string }
  | { kind: "mark"; value: string }
  | { kind: "wiki"; value: string }
  | { kind: "tag"; value: string }
  | { kind: "time"; value: string }
  | { kind: "person"; value: string }
  | { kind: "link"; href: string; label: string };

function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const re =
    /(==[^=]+==|\*\*[^*]+\*\*|~~[^~]+~~|\*[^*]+\*|`[^`]+`|\[\[[^\]]+\]\]|\[[^\]]+\]\([^)]+\)|#([A-Za-z][\w-]*)|@(\d{1,2}:\d{2}(?:\s*[-–]\s*\d{1,2}:\d{2})?)|@([A-Za-z][\w.-]*))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match.index > last) parts.push({ kind: "text", value: text.slice(last, match.index) });
    const token = match[0];
    if (token.startsWith("==")) parts.push({ kind: "mark", value: token.slice(2, -2) });
    else if (token.startsWith("**")) parts.push({ kind: "strong", value: token.slice(2, -2) });
    else if (token.startsWith("~~")) parts.push({ kind: "strike", value: token.slice(2, -2) });
    else if (token.startsWith("*")) parts.push({ kind: "em", value: token.slice(1, -1) });
    else if (token.startsWith("`")) parts.push({ kind: "code", value: token.slice(1, -1) });
    else if (token.startsWith("[[")) parts.push({ kind: "wiki", value: token.slice(2, -2) });
    else if (token.startsWith("[") && token.includes("](")) {
      const m = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) parts.push({ kind: "link", label: m[1], href: m[2] });
      else parts.push({ kind: "text", value: token });
    } else if (token.startsWith("#")) parts.push({ kind: "tag", value: token.slice(1) });
    else if (match[3]) parts.push({ kind: "time", value: match[3] });
    else if (match[4]) parts.push({ kind: "person", value: match[4] });
    else parts.push({ kind: "text", value: token });
    last = match.index + token.length;
  }
  if (last < text.length) parts.push({ kind: "text", value: text.slice(last) });
  return parts;
}

export function wikiHref(title: string): string {
  const key = title.trim().toLowerCase();
  if (key === "journal") return "/journal";
  if (key === "today") return "/today";
  if (key === "coach") return "/coach";
  if (key === "tasks") return "/tasks";
  if (key === "habits") return "/habits";
  if (key === "brain dump") return "/brain-dump";
  if (key === "daily note") return "/daily-note";
  if (key === "study session" || key === "study") return "/study";
  if (key === "map") return "/map";
  if (key === "review") return "/review";
  if (key === "templates") return "/templates";
  return `/notes/${encodeURIComponent(title.trim())}`;
}

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((part, i) => {
        if (part.kind === "text") return <Fragment key={i}>{part.value}</Fragment>;
        if (part.kind === "em")
          return (
            <em key={i} className="italic">
              {part.value}
            </em>
          );
        if (part.kind === "strong")
          return (
            <strong key={i} className="font-semibold">
              {part.value}
            </strong>
          );
        if (part.kind === "strike")
          return (
            <s key={i} className="text-muted">
              {part.value}
            </s>
          );
        if (part.kind === "mark")
          return (
            <mark key={i} className="rounded-xs bg-amber-soft px-0.5 text-ink">
              {part.value}
            </mark>
          );
        if (part.kind === "code")
          return (
            <code key={i} className="rounded-xs bg-surface-2 px-1 font-mono text-[0.9em] text-accent">
              {part.value}
            </code>
          );
        if (part.kind === "wiki")
          return (
            <a
              key={i}
              href={wikiHref(part.value)}
              className="text-accent no-underline decoration-dashed decoration-accent/40 underline-offset-4 hover:underline"
            >
              [[{part.value}]]
            </a>
          );
        if (part.kind === "tag")
          return (
            <a
              key={i}
              href={`/notes?tag=${encodeURIComponent(part.value)}`}
              className="font-mono text-[12px] font-medium text-accent"
            >
              #{part.value}
            </a>
          );
        if (part.kind === "time")
          return (
            <span key={i} className="font-mono text-[12px] font-medium text-accent">
              @{part.value}
            </span>
          );
        if (part.kind === "person")
          return (
            <span key={i} className="font-mono text-[12px] text-slate">
              @{part.value}
            </span>
          );
        const external = /^https?:\/\//.test(part.href);
        if (external) {
          return (
            <a
              key={i}
              href={part.href}
              className="text-accent underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {part.label}
            </a>
          );
        }
        return (
          <a key={i} href={part.href} className="text-accent underline-offset-4 hover:underline">
            {part.label}
          </a>
        );
      })}
    </>
  );
}

function isTask(line: string) {
  return /^\s*[-*]\s+\[[ xX>\-]\]\s+/.test(line);
}

function isList(line: string) {
  return /^\s*[-*]\s+/.test(line) && !isTask(line);
}

function isOrdered(line: string) {
  return /^\s*\d+\.\s+/.test(line);
}

function isTableRow(line: string) {
  return /^\s*\|.+\|\s*$/.test(line);
}

export function Markdown({
  source,
  className,
  onToggleTask,
}: {
  source: string;
  className?: string;
  onToggleTask?: MarkdownTaskHandler;
}) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let fence = false;
  let fenceBuf: string[] = [];
  let fenceLang = "";

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      if (!fence) {
        fence = true;
        fenceLang = line.trim().slice(3).trim();
        fenceBuf = [];
      } else {
        blocks.push(
          <pre
            key={`f-${i}`}
            className="overflow-x-auto rounded-lg bg-mkt-bg px-4 py-3 font-mono text-xs leading-relaxed text-mkt-fg"
            data-lang={fenceLang || undefined}
          >
            <code>{fenceBuf.join("\n")}</code>
          </pre>,
        );
        fence = false;
      }
      i += 1;
      continue;
    }
    if (fence) {
      fenceBuf.push(line);
      i += 1;
      continue;
    }
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={`hr-${i}`} className="border-border" />);
      i += 1;
      continue;
    }
    if (isTableRow(line)) {
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        const cells = lines[i]
          .trim()
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        if (!cells.every((c) => /^:?-{3,}:?$/.test(c))) rows.push(cells);
        i += 1;
      }
      if (rows.length) {
        const [head, ...body] = rows;
        blocks.push(
          <div key={`tbl-${i}`} className="overflow-x-auto">
            <table className="w-full min-w-[320px] border-collapse text-sm">
              <thead>
                <tr>
                  {head.map((c, n) => (
                    <th key={n} className="border border-border bg-surface-2 px-3 py-2 text-left font-medium">
                      <Inline text={c} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, r) => (
                  <tr key={r}>
                    {row.map((c, n) => (
                      <td key={n} className="border border-border px-3 py-2">
                        <Inline text={c} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
      }
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push(
        <h1 key={i} className="font-display text-4xl font-medium tracking-tight hyphens-none md:text-5xl">
          <Inline text={line.slice(2)} />
        </h1>,
      );
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={i} className="mt-8 font-display text-2xl font-medium tracking-tight hyphens-none">
          <span className="mr-2 font-mono text-sm font-normal text-faint">##</span>
          <Inline text={line.slice(3)} />
        </h2>,
      );
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={i} className="mt-6 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          <Inline text={line.slice(4)} />
        </h3>,
      );
      i += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      const quote: string[] = [];
      const start = i;
      while (i < lines.length && lines[i].startsWith("> ")) {
        quote.push(lines[i].slice(2));
        i += 1;
      }
      const joined = quote.join(" ");
      const callout = joined.match(/^\[!(note|tip|warn|task|important)\]\s*(.*)$/i);
      blocks.push(
        <blockquote
          key={`q-${start}`}
          className={cn(
            "border-l-[3px] pl-4 font-display text-[17px] italic leading-relaxed text-muted",
            callout ? "rounded-r-lg border-accent bg-accent-soft/40 py-3 pr-3 not-italic" : "border-accent",
            callout?.[1].toLowerCase() === "warn" && "border-overdue bg-overdue-soft/60",
            callout?.[1].toLowerCase() === "important" && "border-amber bg-amber-soft",
          )}
        >
          {callout ? (
            <>
              <span className="mb-1 block font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
                {callout[1]}
              </span>
              <Inline text={callout[2]} />
            </>
          ) : (
            <Inline text={joined} />
          )}
        </blockquote>,
      );
      continue;
    }
    if (isTask(line)) {
      const items: { idx: number; raw: string }[] = [];
      while (i < lines.length && isTask(lines[i])) {
        items.push({ idx: i, raw: lines[i] });
        i += 1;
      }
      blocks.push(
        <ul key={`t-${i}`} className="space-y-1">
          {items.map((item) => {
            const parsed = parseTaskLine(item.raw, item.idx);
            if (!parsed) return null;
            const moved = parsed.status === "scheduled";
            const cancelled = parsed.status === "cancelled";
            return (
              <li
                key={item.idx}
                className="flex items-start gap-2.5 py-1"
                style={{ paddingLeft: Math.min(parsed.indent, 24) }}
              >
                <span className="w-3 font-mono text-xs leading-6 text-faint">*</span>
                <button
                  type="button"
                  aria-checked={parsed.done}
                  role="checkbox"
                  onClick={() => onToggleTask?.(item.idx, !parsed.done, item.raw)}
                  className={cn(
                    "mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-[5px] border-[1.5px] transition-colors",
                    parsed.done && "border-ok bg-ok text-accent-fg",
                    moved && "border-amber bg-amber-soft",
                    cancelled && "border-border bg-surface-2",
                    parsed.status === "open" && "border-border bg-transparent",
                  )}
                >
                  {parsed.done ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                      <path
                        d="M2 6l3 3 5-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : moved ? (
                    <span className="font-mono text-[10px] text-amber">›</span>
                  ) : cancelled ? (
                    <span className="font-mono text-[10px] text-faint">–</span>
                  ) : null}
                </button>
                <span
                  className={cn(
                    "flex-1 font-display text-[16px] leading-relaxed hyphens-none",
                    parsed.done || cancelled ? "text-muted line-through" : "text-ink",
                  )}
                >
                  <Inline text={parsed.title} />
                </span>
                {parsed.priority > 0 ? (
                  <span className="font-mono text-[11px] text-overdue">{"!".repeat(parsed.priority)}</span>
                ) : null}
                {parsed.time ? <span className="font-mono text-[11px] text-accent">{parsed.time}</span> : null}
                {parsed.scheduled ? (
                  <span className="font-mono text-[10px] text-faint">{`>${parsed.scheduled}`}</span>
                ) : null}
                {parsed.repeat ? (
                  <span className="rounded-sm bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
                    {parsed.repeat}
                  </span>
                ) : null}
                {parsed.remind ? (
                  <span className="font-mono text-[10px] text-slate">@remind</span>
                ) : null}
                {parsed.energy ? (
                  <span className="rounded-sm bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
                    {parsed.energy}
                  </span>
                ) : null}
                {parsed.tags.map((t) => (
                  <span key={t} className="font-mono text-[11px] text-accent">
                    #{t}
                  </span>
                ))}
              </li>
            );
          })}
        </ul>,
      );
      continue;
    }
    if (isOrdered(line)) {
      const items: string[] = [];
      while (i < lines.length && isOrdered(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push(
        <ol key={`o-${i}`} className="list-decimal space-y-1 pl-5 text-[16px] leading-7 text-ink hyphens-none">
          {items.map((item, n) => (
            <li key={n}>
              <Inline text={item} />
            </li>
          ))}
        </ol>,
      );
      continue;
    }
    if (isList(line)) {
      const items: string[] = [];
      while (i < lines.length && isList(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i += 1;
      }
      blocks.push(
        <ul key={`l-${i}`} className="list-disc space-y-1 pl-5 text-[16px] leading-7 text-ink hyphens-none">
          {items.map((item, n) => (
            <li key={n}>
              <Inline text={item} />
            </li>
          ))}
        </ul>,
      );
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^#{1,3}\s/.test(lines[i]) &&
      !isList(lines[i]) &&
      !isTask(lines[i]) &&
      !isOrdered(lines[i]) &&
      !lines[i].startsWith("> ") &&
      !lines[i].trim().startsWith("```") &&
      !/^---+$/.test(lines[i].trim()) &&
      !isTableRow(lines[i])
    ) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push(
      <p key={`p-${i}`} className="font-display text-[17px] leading-[1.7] text-ink text-pretty hyphens-none">
        <Inline text={para.join(" ")} />
      </p>,
    );
  }

  return <article className={cn("flex flex-col gap-3", className)}>{blocks}</article>;
}

export function toggleMarkdownTaskLine(source: string, lineIndex: number, checked: boolean): string {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const line = lines[lineIndex];
  if (!line) return source;
  if (checked) {
    lines[lineIndex] = line.replace(/\[[ >\-]\]/, "[x]");
  } else {
    lines[lineIndex] = line.replace(/\[[xX]\]/, "[ ]");
  }
  return lines.join("\n");
}
