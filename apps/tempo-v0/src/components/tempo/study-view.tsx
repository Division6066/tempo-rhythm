import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/lib/markdown";
import { explainAnswer, makeClozeAi, makeStudyGuide, makeStudySetAi, tutorAsk, tutorLesson } from "@/lib/tempo/ai";
import {
  cardsFromMarkdown,
  clozeFromMarkdown,
  materializeCards,
  materializeCloze,
  materializeQuiz,
  quizFromCards,
  shuffle,
  studyGuideLocal,
} from "@/lib/tempo/study-local";
import { studioStore, useStudio, type StudySet } from "@/lib/tempo/studio";
import { cn } from "@/lib/utils";

export function StudyView() {
  const { studySets, notes, dailyNotes, selectedDay } = useStudio();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [sourceId, setSourceId] = useState<"today" | string>("today");

  const sources = useMemo(
    () => [
      { id: "today", title: `Today · ${selectedDay}`, body: dailyNotes[selectedDay] ?? "" },
      ...notes.map((n) => ({ id: n.id, title: n.title, body: n.body })),
    ],
    [notes, dailyNotes, selectedDay],
  );

  async function fromSource() {
    const src = sources.find((s) => s.id === sourceId) ?? sources[0];
    const md = src.body;
    if (!md.trim()) {
      toast("Nothing to study yet. Write a daily note first.");
      return;
    }
    setBusy(true);
    try {
      const res = await makeStudySetAi({ data: { markdown: md, title: src.title } });
      const cards = res.ok && res.set ? res.set.cards : cardsFromMarkdown(md);
      const quiz = res.ok && res.set ? res.set.quiz : quizFromCards(cards);
      const notesMd = res.ok && res.set ? res.set.notesMd : md;
      const cloze = res.ok && res.set?.cloze?.length ? res.set.cloze : clozeFromMarkdown(md);
      const guideMd = res.ok && res.set?.guideMd ? res.set.guideMd : studyGuideLocal(md, src.title);
      const set = studioStore.addStudySet({
        title: src.title,
        sourceNoteId: src.id === "today" ? undefined : src.id,
        sourceDay: src.id === "today" ? selectedDay : undefined,
        notesMd,
        cards: materializeCards(cards),
        quiz: materializeQuiz(quiz),
        cloze: materializeCloze(cloze),
        guideMd,
      });
      toast(res.ok ? "Study set ready." : "Coach was quiet — I pulled terms from the page.");
      navigate({ to: "/study/$id", params: { id: set.id } });
    } catch {
      const cards = cardsFromMarkdown(md);
      const set = studioStore.addStudySet({
        title: src.title,
        sourceDay: src.id === "today" ? selectedDay : undefined,
        notesMd: md,
        cards: materializeCards(cards),
        quiz: materializeQuiz(quizFromCards(cards)),
        cloze: materializeCloze(clozeFromMarkdown(md)),
        guideMd: studyGuideLocal(md, src.title),
      });
      toast("Sorted locally. Five cards, no timer.");
      navigate({ to: "/study/$id", params: { id: set.id } });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <p className="text-sm text-muted">Study</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">Short sessions. Honest ratings.</h1>
        <p className="mt-2 max-w-xl font-display text-muted">
          Flashcards, a three-question quiz, fill-in blanks, a matching round, a tutor grounded in your page. Twelve
          minutes is a full session. Stopping on time is the point.
        </p>
      </header>
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          className="h-11 flex-1 rounded-md border border-border bg-surface px-3 text-sm"
        >
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        <Button onClick={() => void fromSource()} disabled={busy} variant="gradient">
          {busy ? "Sorting the page…" : "Make a set"}
        </Button>
      </div>
      <ul className="space-y-2">
        {studySets.map((s) => (
          <li key={s.id}>
            <Link
              to="/study/$id"
              params={{ id: s.id }}
              className="flex items-baseline justify-between rounded-xl border border-border bg-surface px-4 py-3 hover:border-accent"
            >
              <span className="font-display text-lg">{s.title}</span>
              <span className="font-mono text-[11px] text-faint">
                {s.cards.length} cards · {s.quiz.length} quiz · {(s.cloze ?? []).length} blanks
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {studySets.length === 0 ? (
        <p className="text-sm text-muted">
          Nothing here yet. Open a daily note with **term** — definition lines, then make a set.
        </p>
      ) : null}
    </div>
  );
}

type Tab = "notes" | "cards" | "quiz" | "match" | "blank" | "guide" | "tutor";

export function StudySetView({ id }: { id: string }) {
  const { studySets } = useStudio();
  const set = studySets.find((s) => s.id === id);
  const [tab, setTab] = useState<Tab>("cards");
  if (!set) {
    return (
      <p className="text-sm text-muted">
        That set isn't here.{" "}
        <Link to="/study" className="text-accent">
          Back
        </Link>
      </p>
    );
  }
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <p className="text-sm text-muted">
        <Link to="/study" className="hover:text-ink">
          Study
        </Link>{" "}
        · {set.title}
      </p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-4xl font-medium tracking-tight">{set.title}</h1>
        <SessionTimer />
      </div>
      <div className="flex flex-wrap gap-1">
        {(["notes", "cards", "quiz", "blank", "match", "guide", "tutor"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "h-9 rounded-full px-3 text-xs font-medium capitalize",
              tab === t ? "bg-ink text-bg" : "text-muted hover:text-ink",
            )}
          >
            {t === "blank" ? "Fill-in" : t}
          </button>
        ))}
      </div>
      {tab === "notes" ? (
        <div className="rounded-xl border border-border bg-surface p-5">
          <Markdown source={set.notesMd} />
        </div>
      ) : null}
      {tab === "cards" ? <Cards set={set} /> : null}
      {tab === "quiz" ? <Quiz set={set} /> : null}
      {tab === "blank" ? <Cloze set={set} /> : null}
      {tab === "match" ? <Match set={set} /> : null}
      {tab === "guide" ? <Guide set={set} /> : null}
      {tab === "tutor" ? <Tutor set={set} /> : null}
    </div>
  );
}

function SessionTimer() {
  const [left, setLeft] = useState(12 * 60);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run || left <= 0) return;
    const id = window.setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearInterval(id);
  }, [run, left]);
  const m = Math.floor(left / 60);
  const s = String(left % 60).padStart(2, "0");
  return (
    <div className="flex items-center gap-2">
      <p className={cn("font-mono text-sm tabular-nums", left === 0 ? "text-accent" : "text-muted")}>
        {m}:{s}
      </p>
      <Button size="sm" variant="outline" onClick={() => (left === 0 ? setLeft(12 * 60) : setRun((v) => !v))}>
        {left === 0 ? "Again" : run ? "Pause" : "12 min"}
      </Button>
      {left === 0 ? <p className="text-xs text-muted">That's a full session. You're allowed to stop.</p> : null}
    </div>
  );
}

function Cards({ set }: { set: StudySet }) {
  const due = set.cards.filter((c) => c.dueAt <= Date.now());
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = due[i] ?? set.cards[0];
  if (!card) return <p className="text-sm text-muted">No cards in this set.</p>;
  const remaining = Math.max(0, due.length - i);
  const done = i >= due.length && due.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1">
        {due.map((_, n) => (
          <span key={n} className={cn("h-1 flex-1 rounded-full", n < i ? "bg-ok" : n === i ? "bg-accent" : "bg-border")} />
        ))}
      </div>
      <p className="font-mono text-[11px] text-faint">{remaining} due · rate honestly · no streak banner</p>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="min-h-48 rounded-2xl border border-border bg-surface p-8 text-left shadow-(--shadow-soft)"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{flipped ? "Back" : "Front"}</p>
        <p className="mt-3 font-display text-2xl leading-snug hyphens-none">{flipped ? card.back : card.front}</p>
        <p className="mt-6 text-xs text-faint">Tap to flip</p>
      </button>
      {flipped && !done ? (
        <div className="grid grid-cols-4 gap-2">
          {["Again", "Hard", "Good", "Easy"].map((label, grade) => (
            <Button
              key={label}
              variant={grade === 0 ? "outline" : grade === 3 ? "default" : "secondary"}
              onClick={() => {
                studioStore.rateCard(set.id, card.id, grade as 0 | 1 | 2 | 3);
                setFlipped(false);
                setI((n) => n + 1);
              }}
            >
              {label}
            </Button>
          ))}
        </div>
      ) : null}
      {done ? (
        <p className="font-display text-muted">That's the pile for now. The hard ones will come back later.</p>
      ) : null}
    </div>
  );
}

function Quiz({ set }: { set: StudySet }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [why, setWhy] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const q = set.quiz[i];
  if (!q) {
    return (
      <p className="font-display text-muted">
        {score} of {set.quiz.length} without shame. That's information, not a grade.
      </p>
    );
  }

  async function explain() {
    if (picked === null) return;
    setAsking(true);
    try {
      const res = await explainAnswer({
        data: {
          question: q.question,
          picked: q.choices[picked],
          correct: q.choices[q.answer],
          context: set.notesMd,
        },
      });
      setWhy(res.ok && res.text ? res.text : "The cards already hold the reason. Flip that term again.");
    } catch {
      setWhy("Couldn't reach the tutor. The correct line is highlighted — that's enough for now.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="font-mono text-[11px] text-faint">
        {i + 1} / {set.quiz.length}
      </p>
      <h2 className="font-display text-2xl hyphens-none">{q.question}</h2>
      <ul className="space-y-2">
        {q.choices.map((c, n) => {
          const show = picked !== null;
          const ok = n === q.answer;
          return (
            <li key={n}>
              <button
                type="button"
                disabled={picked !== null}
                onClick={() => {
                  setPicked(n);
                  setWhy(null);
                  if (n === q.answer) setScore((s) => s + 1);
                }}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left text-sm",
                  !show && "border-border bg-surface hover:border-accent",
                  show && ok && "border-ok bg-ok-soft",
                  show && picked === n && !ok && "border-overdue bg-overdue-soft",
                  show && picked !== n && !ok && "border-border bg-surface",
                )}
              >
                {c}
              </button>
            </li>
          );
        })}
      </ul>
      {picked !== null ? (
        <div className="space-y-3">
          {why ? <p className="rounded-xl bg-accent-soft px-4 py-3 font-display text-[15px] leading-relaxed">{why}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void explain()} disabled={asking}>
              {asking ? "Looking…" : "Why?"}
            </Button>
            <Button
              onClick={() => {
                setPicked(null);
                setWhy(null);
                setI((n) => n + 1);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Cloze({ set }: { set: StudySet }) {
  const items = set.cloze ?? [];
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const item = items[i];

  async function fillFromPage() {
    setBusy(true);
    try {
      const res = await makeClozeAi({ data: { markdown: set.notesMd } });
      const next = res.ok && res.items?.length ? res.items : clozeFromMarkdown(set.notesMd);
      studioStore.patchStudySet(set.id, { cloze: materializeCloze(next) });
      toast(next.length ? "Blanks from the page." : "No terms yet.");
    } catch {
      studioStore.patchStudySet(set.id, { cloze: materializeCloze(clozeFromMarkdown(set.notesMd)) });
    } finally {
      setBusy(false);
    }
  }

  if (!item) {
    return (
      <div className="space-y-3">
        <p className="font-display text-muted">No fill-in items yet. Terms look like **Displacement** — definition, or ==highlights==.</p>
        <Button onClick={() => void fillFromPage()} disabled={busy}>
          {busy ? "Pulling…" : "Make blanks from this page"}
        </Button>
      </div>
    );
  }

  function check() {
    const guess = value.trim().toLowerCase();
    const answer = item.answer.trim().toLowerCase();
    const hit = guess.length > 0 && (guess === answer || answer.includes(guess) || guess.includes(answer));
    setOk(hit);
    setRevealed(true);
  }

  return (
    <div className="space-y-4">
      <p className="font-mono text-[11px] text-faint">
        {i + 1} / {items.length} · type the missing word
      </p>
      <p className="font-display text-2xl leading-snug hyphens-none">{item.prompt}</p>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && check()}
        placeholder="The missing word"
        className="h-12 w-full rounded-md border border-border bg-surface px-3 font-display text-lg"
        autoCapitalize="off"
        autoCorrect="off"
      />
      {revealed ? (
        <p className={cn("rounded-xl px-4 py-3 font-display text-[15px]", ok ? "bg-ok-soft text-ok" : "bg-amber-soft text-ink")}>
          {ok ? "That's the one." : `It's "${item.answer}". No shame — the hard ones come back.`}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {!revealed ? (
          <Button onClick={check}>Check</Button>
        ) : (
          <Button
            onClick={() => {
              setI((n) => n + 1);
              setValue("");
              setRevealed(false);
              setOk(null);
            }}
          >
            Next
          </Button>
        )}
        <Button variant="ghost" onClick={() => void fillFromPage()} disabled={busy}>
          Refresh blanks
        </Button>
      </div>
    </div>
  );
}

function Guide({ set }: { set: StudySet }) {
  const [busy, setBusy] = useState(false);
  const [lesson, setLesson] = useState<{ title: string; steps: { heading: string; body: string; question: string }[] } | null>(null);
  const [step, setStep] = useState(0);

  async function writeGuide() {
    setBusy(true);
    try {
      const res = await makeStudyGuide({ data: { markdown: set.notesMd, title: set.title } });
      studioStore.patchStudySet(set.id, {
        guideMd: res.ok && res.markdown ? res.markdown : studyGuideLocal(set.notesMd, set.title),
      });
      toast(res.ok ? "Guide rewritten from the page." : "Local guide from the terms.");
    } catch {
      studioStore.patchStudySet(set.id, { guideMd: studyGuideLocal(set.notesMd, set.title) });
    } finally {
      setBusy(false);
    }
  }

  async function startLesson() {
    setBusy(true);
    try {
      const res = await tutorLesson({ data: { markdown: set.notesMd, title: set.title } });
      if (res.ok && res.lesson) {
        setLesson(res.lesson);
        setStep(0);
      } else {
        toast("Coach was quiet. The guide below is enough for twelve minutes.");
      }
    } catch {
      toast("Couldn't start the lesson. The guide still works.");
    } finally {
      setBusy(false);
    }
  }

  const current = lesson?.steps[step];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => void writeGuide()} disabled={busy}>
          {busy ? "Writing…" : "Rewrite guide"}
        </Button>
        <Button onClick={() => void startLesson()} disabled={busy}>
          Start a 12-min lesson
        </Button>
      </div>
      {current ? (
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
            Step {step + 1} / {lesson!.steps.length} · {lesson!.title}
          </p>
          <h2 className="mt-2 font-display text-2xl">{current.heading}</h2>
          <p className="mt-3 font-display text-[16px] leading-relaxed">{current.body}</p>
          <p className="mt-4 text-sm text-muted">{current.question}</p>
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStep((n) => Math.max(0, n - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < lesson!.steps.length - 1 ? (
              <Button size="sm" onClick={() => setStep((n) => n + 1)}>
                Next step
              </Button>
            ) : (
              <p className="self-center text-sm text-muted">That's the lesson. You're allowed to stop.</p>
            )}
          </div>
        </div>
      ) : null}
      <div className="rounded-xl border border-border bg-surface p-5">
        <Markdown source={set.guideMd || studyGuideLocal(set.notesMd, set.title)} />
      </div>
    </div>
  );
}

type Tile = { key: string; cardId: string; text: string; side: "front" | "back" };

function Match({ set }: { set: StudySet }) {
  const [tiles, setTiles] = useState<Tile[]>(() => {
    const slice = set.cards.slice(0, 6);
    return shuffle(
      slice.flatMap((c) => [
        { key: `${c.id}-f`, cardId: c.id, text: c.front, side: "front" as const },
        { key: `${c.id}-b`, cardId: c.id, text: c.back, side: "back" as const },
      ]),
    );
  });
  const [picked, setPicked] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [miss, setMiss] = useState<string[]>([]);

  function tap(tile: Tile) {
    if (matched.has(tile.cardId)) return;
    if (!picked) {
      setPicked(tile.key);
      setMiss([]);
      return;
    }
    if (picked === tile.key) {
      setPicked(null);
      return;
    }
    const other = tiles.find((t) => t.key === picked);
    if (!other) return;
    if (other.cardId === tile.cardId && other.side !== tile.side) {
      setMatched((s) => new Set([...s, tile.cardId]));
      setPicked(null);
    } else {
      setMiss([picked, tile.key]);
      setPicked(null);
    }
  }

  const done = matched.size >= Math.min(6, set.cards.length);

  return (
    <div className="space-y-3">
      <p className="font-mono text-[11px] text-faint">Pair the term with its line. No timer on this round.</p>
      <div className="grid grid-cols-2 gap-2">
        {tiles.map((t) => {
          const on = matched.has(t.cardId);
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => tap(t)}
              className={cn(
                "min-h-16 rounded-xl border px-3 py-3 text-left text-sm leading-snug",
                on && "border-ok bg-ok-soft text-ok",
                !on && picked === t.key && "border-accent bg-accent-soft",
                !on && miss.includes(t.key) && "border-overdue bg-overdue-soft",
                !on && picked !== t.key && !miss.includes(t.key) && "border-border bg-surface hover:border-accent",
              )}
            >
              {t.text}
            </button>
          );
        })}
      </div>
      {done ? (
        <p className="font-display text-muted">
          All pairs found. That's enough for now.{" "}
          <button
            type="button"
            className="text-accent"
            onClick={() => {
              setMatched(new Set());
              setTiles(shuffle(tiles));
            }}
          >
            Shuffle again
          </button>
        </p>
      ) : null}
    </div>
  );
}

function Tutor({ set }: { set: StudySet }) {
  const [q, setQ] = useState("");
  const [log, setLog] = useState<{ role: "you" | "coach"; text: string }[]>([
    { role: "coach", text: "Ask anything that's on this page. I'll stay inside the notes." },
  ]);
  const [busy, setBusy] = useState(false);
  const context = useMemo(() => `${set.notesMd}\n\n${set.cards.map((c) => `${c.front} — ${c.back}`).join("\n")}`, [set]);

  async function send() {
    const question = q.trim();
    if (!question) return;
    setQ("");
    setLog((l) => [...l, { role: "you", text: question }]);
    setBusy(true);
    try {
      const res = await tutorAsk({ data: { question, context } });
      setLog((l) => [
        ...l,
        {
          role: "coach",
          text: res.ok && res.text ? res.text : "I'm quiet just now. Flip the cards — the answers are already on the page.",
        },
      ]);
    } catch {
      setLog((l) => [...l, { role: "coach", text: "Couldn't reach the tutor. The cards still work." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-3">
        {log.map((m, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl px-4 py-3 font-display text-[15px] leading-relaxed",
              m.role === "coach" ? "bg-accent-soft" : "ml-8 border border-border bg-surface",
            )}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void send()}
          placeholder="What did the page say about…"
          className="h-11 flex-1 rounded-md border border-border bg-surface px-3 text-sm"
        />
        <Button onClick={() => void send()} disabled={busy}>
          Ask
        </Button>
      </div>
    </div>
  );
}
