import { useMemo, useState } from "react";
import { Link, useNavigate } from "@/lib/tempo-graft/router";
import { toast } from "@/lib/tempo-graft/toast";
import { Button } from "@tempo-v0/components/ui/button";
import { indexDailyTasks, type IndexedTask } from "@tempo-v0/lib/tempo/note-syntax";
import { isoDay, studioStore, useStudio } from "@tempo-v0/lib/tempo/studio";
import { cn } from "@tempo-v0/lib/utils";

type Filter = "open" | "overdue" | "waiting" | "scheduled" | "priority" | "people";

export function ReviewView() {
  const { dailyNotes, selectedDay } = useStudio();
  const today = isoDay();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("overdue");
  const [shown, setShown] = useState(3);
  const [q, setQ] = useState("");

  const all = useMemo(() => indexDailyTasks(dailyNotes, today), [dailyNotes, today]);

  const filtered = useMemo(() => {
    let list = all;
    if (filter === "open") list = all.filter((t) => t.status === "open");
    if (filter === "overdue") list = all.filter((t) => t.status === "open" && t.day < today);
    if (filter === "waiting") list = all.filter((t) => t.tags.includes("waiting") && t.status !== "done" && t.status !== "cancelled");
    if (filter === "scheduled") list = all.filter((t) => Boolean(t.scheduled) || t.status === "scheduled");
    if (filter === "priority") list = all.filter((t) => t.priority > 0 && t.status === "open");
    if (filter === "people") list = all.filter((t) => t.people.length > 0 && t.status === "open");
    const query = q.trim().toLowerCase().replace(/^#/, "");
    if (query) {
      list = list.filter((t) => {
        const hay = `${t.title} ${t.tags.join(" ")} ${t.people.join(" ")} ${t.day}`.toLowerCase();
        return hay.includes(query);
      });
    }
    return list;
  }, [all, filter, q, today]);

  const slice = filtered.slice(0, shown);

  function openDay(day: string) {
    studioStore.setSelectedDay(day);
    void navigate({ to: "/daily-note" });
  }

  function carryYesterday() {
    const from = selectedDay === today ? shiftBack(today) : selectedDay;
    const n = studioStore.carryOpen(from, today);
    if (n === 0) toast("Nothing open to carry. That's a clean page.");
    else toast(`Carried ${n}. Yesterday is marked moved — not failed.`);
    studioStore.setSelectedDay(today);
    void navigate({ to: "/daily-note" });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Review · from the notes</p>
          <h1 className="font-display text-4xl font-medium tracking-tight">Three open things.</h1>
          <p className="mt-2 max-w-xl font-display text-muted">
            Every checkbox across daily notes, in one place. Carry, cancel, or do. Then stop.
          </p>
        </div>
        <Button onClick={carryYesterday} variant="outline">
          Carry yesterday
        </Button>
      </header>

      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setShown(3);
        }}
        placeholder="Filter by word, #tag, or @person"
        className="h-11 rounded-md border border-border bg-surface px-3 text-sm"
      />

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ["overdue", "Overdue"],
            ["open", "Open"],
            ["waiting", "#waiting"],
            ["scheduled", "Scheduled"],
            ["priority", "!!"],
            ["people", "@people"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setFilter(id);
              setShown(3);
            }}
            className={cn(
              "h-9 rounded-full px-3 text-xs font-medium",
              filter === id ? "bg-ink text-bg" : "bg-surface-2 text-muted hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {slice.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-5 py-6 font-display text-muted">
          Nothing in this filter. That's allowed.{" "}
          <Link to="/daily-note" className="text-accent">
            Open today
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-2">
          {slice.map((t) => (
            <ReviewRow key={`${t.day}-${t.lineIndex}`} task={t} today={today} onOpen={openDay} />
          ))}
        </ul>
      )}

      {filtered.length > shown ? (
        <Button variant="ghost" onClick={() => setShown((n) => n + 3)}>
          Show three more · {filtered.length - shown} waiting
        </Button>
      ) : null}

      <p className="text-xs leading-relaxed text-faint">
        Tasks live in the daily note as <code className="font-mono">* [ ]</code>. Review never shames a missed day —
        it just lists what is still open.
      </p>
    </div>
  );
}

function ReviewRow({
  task,
  today,
  onOpen,
}: {
  task: IndexedTask;
  today: string;
  onOpen: (day: string) => void;
}) {
  const overdue = task.status === "open" && task.day < today;
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(task.day)}
        className="flex w-full items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left hover:border-accent"
      >
        <span
          className={cn(
            "mt-1.5 size-2.5 shrink-0 rounded-full",
            task.status === "done" && "bg-ok",
            task.status === "scheduled" && "bg-amber",
            task.status === "cancelled" && "bg-border",
            task.status === "open" && overdue && "bg-overdue",
            task.status === "open" && !overdue && "bg-accent",
          )}
        />
        <span className="min-w-0 flex-1">
          <span className="font-display text-[16px] leading-snug">{task.title}</span>
          <span className="mt-1 flex flex-wrap gap-2 font-mono text-[11px] text-faint">
            <span>{task.day}</span>
            {task.priority > 0 ? <span className="text-overdue">{"!".repeat(task.priority)}</span> : null}
            {task.time ? <span className="text-accent">@{task.time}</span> : null}
            {task.scheduled ? <span>{`>${task.scheduled}`}</span> : null}
            {task.people.map((p) => (
              <span key={p}>@{p}</span>
            ))}
            {task.tags.map((tag) => (
              <span key={tag} className="text-accent">
                #{tag}
              </span>
            ))}
          </span>
        </span>
      </button>
    </li>
  );
}

function shiftBack(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, (d ?? 1) - 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}
