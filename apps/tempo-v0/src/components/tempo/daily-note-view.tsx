import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { MdEditor } from "@/components/tempo/md-editor";
import { Button } from "@/components/ui/button";
import { askAboutSource, enhanceMarkdown, makeClozeAi, makeStudyGuide, makeStudySetAi } from "@/lib/tempo/ai";
import {
  isoWeekKey,
  monthKey,
  yearKey,
  parseTasks,
  setTaskTime,
  appendTimedTask,
  clockFromMinutes,
  shiftIsoDay,
} from "@/lib/tempo/note-syntax";
import {
  cardsFromMarkdown,
  clozeFromMarkdown,
  materializeCards,
  materializeCloze,
  materializeQuiz,
  quizFromCards,
  studyGuideLocal,
} from "@/lib/tempo/study-local";
import { isoDay, parseIsoDay, studioStore, useStudio } from "@/lib/tempo/studio";
import { renderTemplate, templateById } from "@/lib/tempo/templates";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);
const PX = 48;
const DAY_START = 7 * 60;

type Scope = "day" | "week" | "month" | "year";

function shiftDay(day: string, delta: number) {
  return shiftIsoDay(day, delta);
}

function shiftMonth(day: string, delta: number) {
  const d = parseIsoDay(day);
  d.setMonth(d.getMonth() + delta);
  return isoDay(d.getTime());
}

export function DailyNoteView({ initialScope = "day" }: { initialScope?: Scope }) {
  const studio = useStudio();
  const navigate = useNavigate();
  const day = studio.selectedDay || isoDay();
  const date = parseIsoDay(day);
  const [pane, setPane] = useState<"note" | "time" | "cal">("note");
  const [scope, setScope] = useState<Scope>(initialScope);
  const [busy, setBusy] = useState<string | null>(null);
  const [ask, setAsk] = useState("");
  const [askLog, setAskLog] = useState<string | null>(null);
  useEffect(() => setScope(initialScope), [initialScope]);
  const week = isoWeekKey(date.getTime());
  const month = monthKey(date.getTime());
  const year = yearKey(date.getTime());

  const source =
    scope === "week"
      ? (studio.weeklyNotes[week] ?? "")
      : scope === "month"
        ? (studio.monthlyNotes[month] ?? "")
        : scope === "year"
          ? (studio.yearlyNotes[year] ?? "")
          : (studio.dailyNotes[day] ?? "");

  const tasks = useMemo(() => parseTasks(source, day), [source, day]);
  const wikiOptions = useMemo(
    () => [
      ...studio.notes.map((n) => ({ id: n.id, title: n.title })),
      { id: "journal", title: "Journal" },
      { id: "today", title: "Today" },
      { id: "study", title: "Study" },
      { id: "map", title: "Map" },
      { id: "review", title: "Review" },
    ],
    [studio.notes],
  );

  function write(next: string) {
    if (scope === "week") studioStore.upsertWeekly(week, next);
    else if (scope === "month") studioStore.upsertMonthly(month, next);
    else if (scope === "year") studioStore.upsertYearly(year, next);
    else studioStore.upsertDaily(day, next);
  }

  function seedIfEmpty() {
    if (source.trim()) return;
    if (scope === "week") {
      const t = templateById("weekly-review");
      if (t) studioStore.upsertWeekly(week, renderTemplate(t, date.getTime()));
    } else if (scope === "month") {
      const t = templateById("monthly-aim");
      if (t) studioStore.upsertMonthly(month, renderTemplate(t, date.getTime()));
    } else if (scope === "year") {
      const t = templateById("yearly-aim");
      if (t) studioStore.upsertYearly(year, renderTemplate(t, date.getTime()));
    } else {
      const t = templateById("daily-note");
      if (t) studioStore.upsertDaily(day, renderTemplate(t, date.getTime()));
    }
  }

  async function enhance() {
    if (!source.trim()) {
      toast("Write a messy dump first. Coach sorts; it doesn't invent.");
      return;
    }
    setBusy("enhance");
    try {
      const res = await enhanceMarkdown({ data: { raw: source } });
      if (res.ok && res.markdown) {
        write(res.markdown);
        toast("Structured. Your words, headers, and three tasks.");
      } else {
        toast("Coach was quiet. Slash /daily still works.");
      }
    } catch {
      toast("Couldn't reach the coach. The page is still yours.");
    } finally {
      setBusy(null);
    }
  }

  async function makeCards() {
    if (!source.trim()) {
      toast("Need a page first.");
      return;
    }
    setBusy("cards");
    try {
      const res = await makeStudySetAi({ data: { markdown: source, title: heading } });
      const cards = res.ok && res.set ? res.set.cards : cardsFromMarkdown(source);
      const quiz = res.ok && res.set ? res.set.quiz : quizFromCards(cards);
      const notesMd = res.ok && res.set ? res.set.notesMd : source;
      const cloze = res.ok && res.set?.cloze?.length ? res.set.cloze : clozeFromMarkdown(source);
      const guideMd = res.ok && res.set?.guideMd ? res.set.guideMd : studyGuideLocal(source, heading);
      const set = studioStore.addStudySet({
        title: heading,
        sourceDay: scope === "day" ? day : undefined,
        notesMd,
        cards: materializeCards(cards),
        quiz: materializeQuiz(quiz),
        cloze: materializeCloze(cloze),
        guideMd,
      });
      toast(res.ok ? "Study set ready." : "Coach was quiet — I pulled terms from the page.");
      navigate({ to: "/study/$id", params: { id: set.id } });
    } catch {
      const cards = cardsFromMarkdown(source);
      const set = studioStore.addStudySet({
        title: heading,
        sourceDay: scope === "day" ? day : undefined,
        notesMd: source,
        cards: materializeCards(cards),
        quiz: materializeQuiz(quizFromCards(cards)),
        cloze: materializeCloze(clozeFromMarkdown(source)),
        guideMd: studyGuideLocal(source, heading),
      });
      toast("Sorted locally. Five cards, no timer.");
      navigate({ to: "/study/$id", params: { id: set.id } });
    } finally {
      setBusy(null);
    }
  }

  async function makeGuide() {
    if (!source.trim()) {
      toast("Need a page first.");
      return;
    }
    setBusy("guide");
    try {
      const res = await makeStudyGuide({ data: { markdown: source, title: heading } });
      const cards = cardsFromMarkdown(source);
      const set = studioStore.addStudySet({
        title: `${heading} · guide`,
        sourceDay: scope === "day" ? day : undefined,
        notesMd: source,
        cards: materializeCards(cards),
        quiz: materializeQuiz(quizFromCards(cards)),
        cloze: materializeCloze(clozeFromMarkdown(source)),
        guideMd: res.ok && res.markdown ? res.markdown : studyGuideLocal(source, heading),
      });
      toast(res.ok ? "Guide ready." : "Built a local guide from the terms on the page.");
      navigate({ to: "/study/$id", params: { id: set.id } });
    } catch {
      toast("Couldn't reach the coach. /cards still works.");
    } finally {
      setBusy(null);
    }
  }

  async function makeBlanks() {
    if (!source.trim()) {
      toast("Need a page first.");
      return;
    }
    setBusy("blank");
    try {
      const res = await makeClozeAi({ data: { markdown: source } });
      const items = res.ok && res.items?.length ? res.items : clozeFromMarkdown(source);
      const cards = cardsFromMarkdown(source);
      const set = studioStore.addStudySet({
        title: `${heading} · blanks`,
        sourceDay: scope === "day" ? day : undefined,
        notesMd: source,
        cards: materializeCards(cards),
        quiz: materializeQuiz(quizFromCards(cards)),
        cloze: materializeCloze(items),
        guideMd: studyGuideLocal(source, heading),
      });
      toast(items.length ? "Blanks ready." : "No terms yet. Write **term** — definition, or ==highlight== a phrase.");
      navigate({ to: "/study/$id", params: { id: set.id } });
    } catch {
      toast("Couldn't reach the coach.");
    } finally {
      setBusy(null);
    }
  }

  function pinMap() {
    const title = heading.split("·")[0]?.trim() || "Daily";
    studioStore.addMapCard({
      title,
      body: source.slice(0, 280),
      x: 80 + studio.mapCards.length * 28,
      y: 80 + studio.mapCards.length * 20,
    });
    toast("Pinned to the map.");
    navigate({ to: "/map" });
  }

  function carry() {
    const from = shiftDay(day, -1);
    const n = studioStore.carryOpen(from, day);
    if (n === 0) toast("Yesterday is already clean.");
    else toast(`Carried ${n}. Marked moved on yesterday — not failed.`);
  }

  async function askPage() {
    const question = ask.trim() || "What are the three doable things on this page?";
    setBusy("ask");
    try {
      const res = await askAboutSource({ data: { question, context: source } });
      setAskLog(res.ok && res.text ? res.text : "Coach was quiet. The page still answers if you read it slowly.");
    } catch {
      setAskLog("Couldn't reach the coach. The page is still yours.");
    } finally {
      setBusy(null);
    }
  }

  const heading =
    scope === "week"
      ? `Week ${week}`
      : scope === "month"
        ? date.toLocaleDateString(undefined, { month: "long", year: "numeric" })
        : scope === "year"
          ? year
          : date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <header className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 md:px-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
            {scope === "day" ? "Daily note" : scope === "week" ? "Weekly note" : scope === "month" ? "Monthly note" : "Yearly note"}
          </p>
          <h1 className="font-display text-xl font-medium tracking-tight md:text-2xl">{heading}</h1>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-1">
          {(["day", "week", "month", "year"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setScope(s);
                if (s !== "day") setPane("note");
              }}
              className={cn(
                "h-8 rounded-full px-3 text-xs font-medium capitalize",
                scope === s ? "bg-ink text-bg" : "text-muted hover:text-ink",
              )}
            >
              {s}
            </button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => studioStore.setSelectedDay(shiftDay(day, -1))}>
            Prev
          </Button>
          <Button size="sm" variant="outline" onClick={() => studioStore.setSelectedDay(isoDay())}>
            Today
          </Button>
          <Button size="sm" variant="ghost" onClick={() => studioStore.setSelectedDay(shiftDay(day, 1))}>
            Next
          </Button>
          <Button size="sm" variant="outline" onClick={seedIfEmpty}>
            {scope === "week" ? "/weekly" : scope === "month" ? "/month" : scope === "year" ? "/year" : "/daily"}
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-1.5">
        <Button size="sm" variant="ghost" disabled={Boolean(busy)} onClick={() => void enhance()}>
          {busy === "enhance" ? "Sorting…" : "Enhance dump"}
        </Button>
        <Button size="sm" variant="ghost" disabled={Boolean(busy)} onClick={() => void makeCards()}>
          {busy === "cards" ? "Making cards…" : "Make study cards"}
        </Button>
        <Button size="sm" variant="ghost" disabled={Boolean(busy)} onClick={() => void makeGuide()}>
          {busy === "guide" ? "Writing…" : "Study guide"}
        </Button>
        <Button size="sm" variant="ghost" onClick={pinMap}>
          Pin to map
        </Button>
        {scope === "day" ? (
          <Button size="sm" variant="ghost" onClick={carry}>
            Carry yesterday
          </Button>
        ) : null}
        <Link to="/review" className="inline-flex h-8 items-center rounded-full px-3 text-xs text-muted hover:text-ink">
          Review
        </Link>
        <span className="hidden font-mono text-[10px] text-faint md:inline">
          /enhance · /cards · /guide · /blank · /pin · /carry
        </span>
      </div>

      <p className="hidden border-b border-border px-4 py-1.5 font-mono text-[10px] leading-relaxed text-faint md:block">
        {"* [ ] task · [x] done · [>] moved · [-] cancelled · !! priority · @09:30 time · #tag · @person · >tomorrow · @repeat(weekly) · @remind(14:00) · [[wiki]] · ==highlight== · / slash"}
      </p>

      <div className="flex gap-1 border-b border-border px-3 py-1 md:hidden">
        {(["note", "time", "cal"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPane(p)}
            className={cn(
              "h-9 flex-1 rounded-full text-xs font-medium capitalize",
              pane === p ? "bg-ink text-bg" : "text-muted",
            )}
          >
            {p === "cal" ? "Calendar" : p === "time" ? "Timeline" : "Note"}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside
          className={cn(
            "w-full shrink-0 overflow-auto border-b border-border p-3 md:w-[200px] md:border-b-0 md:border-r lg:w-[220px]",
            pane === "cal" ? "block" : "max-md:hidden",
          )}
        >
          <CalendarRail
            day={day}
            notedDays={Object.keys(studio.dailyNotes)}
            onPick={(d) => {
              studioStore.setSelectedDay(d);
              setScope("day");
            }}
            onShiftMonth={(delta) => studioStore.setSelectedDay(shiftMonth(day, delta))}
          />
          <div className="mt-5 space-y-1">
            <p className="px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">On this page</p>
            {tasks.length === 0 ? (
              <p className="px-2 text-xs text-muted">No checkboxes yet. Type * [ ] or /task.</p>
            ) : (
              tasks.slice(0, 8).map((t) => (
                <button
                  key={t.lineIndex}
                  type="button"
                  draggable={scope === "day"}
                  onDragStart={(e) => e.dataTransfer.setData("text/line", String(t.lineIndex))}
                  className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-surface-2"
                >
                  <span
                    className={cn(
                      "mt-0.5 size-2 shrink-0 rounded-full",
                      t.done ? "bg-ok" : t.status === "scheduled" ? "bg-amber" : t.priority > 0 ? "bg-overdue" : "bg-accent",
                    )}
                  />
                  <span className={cn("min-w-0 flex-1 leading-snug", t.done && "text-muted line-through")}>{t.title}</span>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className={cn("min-h-0 min-w-0 flex-1 overflow-auto p-3 md:p-4", pane === "note" ? "block" : "max-md:hidden")}>
          <MdEditor
            value={source}
            onChange={write}
            placeholder={
              scope === "week"
                ? "Type /weekly. Friday questions, no score."
                : scope === "month"
                  ? "Type /month. One aim is enough."
                  : scope === "year"
                    ? "Type /year. One sentence is a complete year."
                    : "Type /daily to start. Tasks are * [ ]  — times are @09:30. Priority is !!."
            }
            mode="write"
            wikiOptions={wikiOptions}
            onAgent={(slash) => {
              if (slash === "/enhance") void enhance();
              else if (slash === "/cards") void makeCards();
              else if (slash === "/guide") void makeGuide();
              else if (slash === "/blank") void makeBlanks();
              else if (slash === "/pin") pinMap();
              else if (slash === "/carry") carry();
              else if (slash === "/ask") void askPage();
            }}
          />
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void askPage();
            }}
          >
            <input
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              placeholder="Ask about this page…"
              className="h-11 flex-1 rounded-md border border-border bg-surface px-3 text-sm"
            />
            <Button type="submit" variant="outline" disabled={Boolean(busy)}>
              {busy === "ask" ? "Looking…" : "Ask"}
            </Button>
          </form>
          {askLog ? (
            <p className="mt-2 rounded-xl bg-accent-soft px-4 py-3 font-display text-[15px] leading-relaxed">{askLog}</p>
          ) : null}
        </section>

        <aside
          className={cn(
            "w-full shrink-0 overflow-auto border-t border-border p-3 md:w-[260px] md:border-t-0 md:border-l lg:w-[300px]",
            pane === "time" ? "block" : "max-md:hidden",
          )}
        >
          {scope === "day" ? (
            <DayTimeline day={day} source={source} />
          ) : scope === "week" ? (
            <WeekStrip
              day={day}
              dailyNotes={studio.dailyNotes}
              onPick={(d) => {
                studioStore.setSelectedDay(d);
                setScope("day");
              }}
            />
          ) : (
            <MonthList
              day={day}
              dailyNotes={studio.dailyNotes}
              onPick={(d) => {
                studioStore.setSelectedDay(d);
                setScope("day");
              }}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function DayTimeline({ day, source }: { day: string; source: string }) {
  const tasks = useMemo(() => parseTasks(source, day), [source, day]);
  const timed = tasks.filter((t) => t.startMin !== undefined);
  const loose = tasks.filter((t) => t.startMin === undefined && !t.done && t.status === "open");
  const now = new Date();
  const isToday = day === isoDay();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMin - DAY_START) / 60) * PX;

  return (
    <div>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">Time blocks</p>
      {loose.length > 0 ? (
        <div className="mb-3 space-y-1">
          <p className="font-mono text-[10px] text-faint">Not on the clock · drag onto a hour</p>
          {loose.map((t) => (
            <span
              key={t.lineIndex}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/line", String(t.lineIndex))}
              className="block cursor-grab truncate rounded-md bg-surface-2 px-2 py-1 text-[12px] active:cursor-grabbing"
            >
              {t.priority > 0 ? `${"!".repeat(t.priority)} ` : ""}
              {t.title}
            </span>
          ))}
        </div>
      ) : null}
      <div className="relative" style={{ height: HOURS.length * PX }}>
        {HOURS.map((h, i) => {
          const startMin = h * 60;
          const label = `${String(h).padStart(2, "0")}:00`;
          return (
            <button
              key={h}
              type="button"
              onClick={() => studioStore.upsertDaily(day, appendTimedTask(source, "New block", startMin))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const idx = Number(e.dataTransfer.getData("text/line"));
                if (!Number.isFinite(idx)) return;
                studioStore.upsertDaily(day, setTaskTime(source, idx, startMin));
              }}
              className="absolute inset-x-0 flex border-t border-border text-left hover:bg-surface-2"
              style={{ top: i * PX, height: PX }}
            >
              <span className="w-11 shrink-0 pt-1 font-mono text-[10px] text-faint">{label}</span>
            </button>
          );
        })}
        {timed.map((t) => {
          const start = t.startMin ?? DAY_START;
          const end = t.endMin ?? start + 30;
          const top = ((start - DAY_START) / 60) * PX;
          const height = Math.max(28, ((end - start) / 60) * PX - 4);
          return (
            <div
              key={t.lineIndex}
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData("text/line", String(t.lineIndex));
              }}
              className={cn(
                "absolute right-1 left-12 overflow-hidden rounded-md px-2 py-1 text-[12px] leading-tight shadow-(--shadow-soft)",
                t.done ? "bg-ok-soft text-ok line-through" : t.priority > 0 ? "bg-overdue-soft text-ink" : "bg-accent-soft text-ink",
              )}
              style={{ top: top + 2, height }}
            >
              <p className="truncate font-medium">{t.title}</p>
              <p className="font-mono text-[10px] text-faint">{clockFromMinutes(start)}</p>
            </div>
          );
        })}
        {isToday && nowMin >= DAY_START && nowMin <= 21 * 60 ? (
          <div className="timeline-now" style={{ top: nowTop }} />
        ) : null}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-faint">
        Click an hour to add a block. Drag a task onto a time. Nothing is mandatory.
      </p>
    </div>
  );
}

function WeekStrip({
  day,
  dailyNotes,
  onPick,
}: {
  day: string;
  dailyNotes: Record<string, string>;
  onPick: (d: string) => void;
}) {
  const current = parseIsoDay(day);
  const monday = new Date(current);
  const wd = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - wd);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return isoDay(d.getTime());
  });
  return (
    <div className="space-y-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">This week</p>
      {days.map((iso) => {
        const d = parseIsoDay(iso);
        const count = parseTasks(dailyNotes[iso] ?? "", iso).filter((t) => t.status === "open").length;
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onPick(iso)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm",
              iso === day ? "border-accent bg-accent-soft" : "border-border hover:bg-surface-2",
            )}
          >
            <span>{d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}</span>
            <span className="font-mono text-[10px] text-faint">{count ? `${count} open` : dailyNotes[iso] ? "noted" : "—"}</span>
          </button>
        );
      })}
      <Link to="/daily-note" className="block px-1 pt-2 text-xs text-accent">
        Open a day →
      </Link>
    </div>
  );
}

function MonthList({
  day,
  dailyNotes,
  onPick,
}: {
  day: string;
  dailyNotes: Record<string, string>;
  onPick: (d: string) => void;
}) {
  const entries = Object.keys(dailyNotes)
    .filter((k) => k.startsWith(monthKey(parseIsoDay(day).getTime())))
    .sort();
  return (
    <div className="space-y-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">Days with notes</p>
      {entries.length === 0 ? (
        <p className="text-xs text-muted">Empty month. Open a day and type /daily.</p>
      ) : (
        entries.map((iso) => (
          <button
            key={iso}
            type="button"
            onClick={() => onPick(iso)}
            className="block w-full truncate rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-2"
          >
            {iso}
          </button>
        ))
      )}
    </div>
  );
}

function CalendarRail({
  day,
  notedDays,
  onPick,
  onShiftMonth,
}: {
  day: string;
  notedDays: string[];
  onPick: (d: string) => void;
  onShiftMonth: (delta: number) => void;
}) {
  const current = parseIsoDay(day);
  const year = current.getFullYear();
  const month = current.getMonth();
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const noted = new Set(notedDays);
  const today = isoDay();
  const cells = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" className="h-8 px-1 text-xs text-muted" onClick={() => onShiftMonth(-1)}>
          ‹
        </button>
        <p className="font-display text-sm font-medium">
          {current.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </p>
        <button type="button" className="h-8 px-1 text-xs text-muted" onClick={() => onShiftMonth(1)}>
          ›
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-0.5 text-center font-mono text-[9px] text-faint">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((n, i) => {
          if (!n) return <span key={`e-${i}`} />;
          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
          const active = iso === day;
          const has = noted.has(iso);
          const isToday = iso === today;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onPick(iso)}
              className={cn(
                "relative aspect-square rounded-md font-mono text-[11px]",
                active ? "bg-accent text-accent-fg" : has ? "text-ink" : "text-faint",
                isToday && !active ? "ring-1 ring-accent" : "",
              )}
            >
              {n}
              {has && !active ? (
                <span className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
