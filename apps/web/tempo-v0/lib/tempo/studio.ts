import { useSyncExternalStore } from "react";
import { isoWeekKey, monthKey, yearKey, parseTasks, markTaskMoved, appendCarriedTasks, shiftIsoDay } from "./note-syntax";

export type NoteDoc = {
  id: string;
  title: string;
  body: string;
  tag: string;
  updatedAt: number;
  wordCount: number;
};

export type JournalEntry = {
  id: string;
  day: string;
  title: string;
  body: string;
  mood: string;
  createdAt: number;
};

export type ChatRole = "user" | "coach";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  at: number;
  via?: "text" | "voice";
  durationSec?: number;
};

export type DumpItemKind = "task" | "note" | "worry" | "journal";
export type DumpItemStatus = "pending" | "accepted" | "skipped" | "tweaked";

export type DumpItem = {
  id: string;
  kind: DumpItemKind;
  text: string;
  status: DumpItemStatus;
};

export type OnboardingState = {
  step: number;
  tags: string[];
  energy: "morning" | "evening" | "variable";
  work: "deep" | "sprint" | "mixed";
  template: "Student" | "Builder" | "Daily Life" | "Blank";
  dump: string;
  completed: boolean;
};

export type FlashCard = {
  id: string;
  front: string;
  back: string;
  ease: number;
  dueAt: number;
};

export type QuizItem = {
  id: string;
  question: string;
  choices: string[];
  answer: number;
};

export type ClozeItem = {
  id: string;
  prompt: string;
  answer: string;
};

export type StudySet = {
  id: string;
  title: string;
  sourceNoteId?: string;
  sourceDay?: string;
  notesMd: string;
  cards: FlashCard[];
  quiz: QuizItem[];
  cloze: ClozeItem[];
  guideMd: string;
  createdAt: number;
};

export type MapCard = {
  id: string;
  noteId?: string;
  title: string;
  body: string;
  x: number;
  y: number;
};

export type StudioState = {
  onboarding: OnboardingState;
  notes: NoteDoc[];
  journal: JournalEntry[];
  dailyNotes: Record<string, string>;
  weeklyNotes: Record<string, string>;
  monthlyNotes: Record<string, string>;
  yearlyNotes: Record<string, string>;
  chat: ChatMessage[];
  dumpItems: DumpItem[];
  dumpRaw: string;
  warmth: number;
  theme: "light" | "dark";
  dyslexia: boolean;
  readingRuler: boolean;
  focusMode: boolean;
  voiceMode: "closed" | "walkie" | "handsfree";
  selectedDay: string;
  studySets: StudySet[];
  mapCards: MapCard[];
};

const KEY = "tempo-studio-v2";

function words(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function isoToday(now = Date.now()) {
  const d = new Date(now);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function defaultDaily(now = Date.now()) {
  const d = new Date(now);
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  const month = d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
  return `# ${weekday} · ${month}

## Intentions
Ship one honest paragraph. Protect the afternoon.

## Tasks
* [ ] Morning pages — [[Journal]] @08:30 #body
* [ ] !! Draft the next small thing @09:30 #writing
* [ ] Ten-minute walk @12:30 #body
* [ ] Physics chapter — 8 pages @15:00 #study low energy
* [ ] Shutdown: park tomorrow @16:30

## Notes
The dump from this morning is sitting in [[Brain dump]]. Three things look doable. The worry can wait until tomorrow.

==Protect the afternoon== is the only rule.

See also: [[Schema notes]] · [[Coach warmth]] · [[Review]]
`;
}

function defaultWeekly(now = Date.now()) {
  return `# Week ${isoWeekKey(now)}

## What actually happened
Two of three most days. The email is still open. That's allowed.

## Waiting on
* [ ] Lecturer reply #waiting @Sam

## Next week, small
* [ ] Send the extension email @09:30
* [ ] Ten-minute walk after lunch
* [ ] One page of the lab draft
`;
}

function defaultYesterday(now = Date.now()) {
  const y = isoToday(now - 864e5);
  const d = new Date(now - 864e5);
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  return `# ${weekday} · ${y}

## Tasks
* [ ] !! Extension email #admin
* [ ] Call the clinic @14:00 @remind(14:00)
* [ ] Buy oats #home >tomorrow
* [x] Morning pages
* [>] Parked: ask Sam about the schema
`;
}

function seed(): StudioState {
  const now = Date.now();
  const today = isoToday(now);
  const yesterday = isoToday(now - 864e5);
  const week = isoWeekKey(now);
  const month = monthKey(now);
  const year = yearKey(now);
  const notes: NoteDoc[] = [
    {
      id: "note_landing",
      title: "Landing manifesto",
      tag: "writing",
      updatedAt: now - 36e5,
      body: `# Landing manifesto

A planner that won't *shame* your nervous system.

## The promise
Dump your thoughts. We'll help you find the next doable thing.

**Shame** — the feeling a streak banner gives you on a missed Tuesday.
**Tempo** — a friend who asks what today could look like.

See also: [[Journal]] · [[Today]]
`,
      wordCount: 62,
    },
    {
      id: "note_schema",
      title: "Schema notes",
      tag: "build",
      updatedAt: now - 864e5,
      body: `# Schema notes

Keep the day as one markdown page. Tasks live as checkboxes. Memories are facts Tempo volunteered to keep.

## Open questions
- How much of yesterday should auto-carry?
- Where do parked items go if the week is already full?

**Daily note** — one file per day, tasks as \`* [ ]\`, times as \`@09:30\`, tags as \`#writing\`.
**Wiki link** — \`[[Schema notes]]\` is bidirectional.

> [!tip] Type /carry to move yesterday's open tasks onto today as [>] on the old page.

Linked from [[Daily note]].
`,
      wordCount: 88,
    },
    {
      id: "note_physics",
      title: "Physics — kinematics",
      tag: "study",
      updatedAt: now - 2 * 864e5,
      body: `# Physics — kinematics

**Displacement** — net change in position. Not the same as distance.
**Velocity** — rate of change of displacement. Vector.
**Acceleration** — rate of change of velocity.

## Equations
- v = u + at
- s = ut + ½at²
- v² = u² + 2as

A body starting from rest (u = 0) with constant acceleration travels s = ½at².

==Displacement is not distance== — that's the exam trap.

See also: [[Study session]]
`,
      wordCount: 90,
    },
    {
      id: "note_coach",
      title: "Coach warmth",
      tag: "coach",
      updatedAt: now - 3 * 864e5,
      body: `# Coach warmth

Default is 6 — gentle, not saccharine.

> Three doable things. The rest can wait.

Never: hustle, grind, failed, champ.
`,
      wordCount: 28,
    },
  ];

  return {
    onboarding: {
      step: 0,
      tags: ["ADHD"],
      energy: "morning",
      work: "mixed",
      template: "Builder",
      dump: "Finish the landing copy. Book dentist. Walk at noon. Worry: am I shipping fast enough?",
      completed: false,
    },
    notes,
    journal: [
      {
        id: "j_yest",
        day: yesterday,
        title: "Yesterday",
        mood: "steady",
        createdAt: now - 864e5,
        body: `Two of three got done. The third was the email I keep opening. That's allowed.

I protected the afternoon. Noting it.`,
      },
    ],
    dailyNotes: { [today]: defaultDaily(now), [yesterday]: defaultYesterday(now) },
    weeklyNotes: { [week]: defaultWeekly(now) },
    monthlyNotes: {
      [month]: `# ${new Date(now).toLocaleDateString(undefined, { month: "long", year: "numeric" })}\n\nOne aim: keep the mornings small.\n`,
    },
    yearlyNotes: {
      [year]: `# ${year}\n\nOne sentence: keep the mornings small, keep the week human.\n`,
    },
    chat: [
      {
        id: "c1",
        role: "coach",
        text: "You finished two of three yesterday. That counts. Want to start with the unfinished one, or a lighter warm-up?",
        at: now - 9e5,
      },
    ],
    dumpItems: [],
    dumpRaw: "",
    warmth: 6,
    theme: "light",
    dyslexia: false,
    readingRuler: false,
    focusMode: false,
    voiceMode: "closed",
    selectedDay: today,
    studySets: [
      {
        id: "study_kin",
        title: "Physics — kinematics",
        sourceNoteId: "note_physics",
        notesMd: notes[2].body,
        createdAt: now - 2 * 864e5,
        guideMd: `# Physics — kinematics

## Terms
- **Displacement** — net change in position. Not the same as distance.
- **Velocity** — rate of change of displacement. A vector.
- **Acceleration** — rate of change of velocity.

## Try without looking
1. What is displacement?
2. From rest, s = ?
3. Is velocity a scalar?

## Park
One question I still can't answer:
`,
        cloze: [
          { id: "z1", prompt: "______ — net change in position. Not the same as distance.", answer: "Displacement" },
          { id: "z2", prompt: "______ — rate of change of displacement. Vector.", answer: "Velocity" },
          { id: "z3", prompt: "______ — rate of change of velocity.", answer: "Acceleration" },
          { id: "z4", prompt: "A body from rest travels s = ______", answer: "½at²" },
        ],
        cards: [
          {
            id: "fc1",
            front: "Displacement",
            back: "Net change in position. Not the same as distance.",
            ease: 2.3,
            dueAt: now,
          },
          {
            id: "fc2",
            front: "Velocity",
            back: "Rate of change of displacement. A vector.",
            ease: 2.1,
            dueAt: now,
          },
          {
            id: "fc3",
            front: "Acceleration",
            back: "Rate of change of velocity.",
            ease: 2.5,
            dueAt: now,
          },
          {
            id: "fc4",
            front: "v = u + at  — what does u mean?",
            back: "Initial velocity.",
            ease: 1.8,
            dueAt: now,
          },
          {
            id: "fc5",
            front: "From rest, s = ?",
            back: "½ a t²  (because u = 0).",
            ease: 1.6,
            dueAt: now,
          },
        ],
        quiz: [
          {
            id: "q1",
            question: "Displacement is the same as distance.",
            choices: ["True", "False"],
            answer: 1,
          },
          {
            id: "q2",
            question: "A body from rest with constant a travels",
            choices: ["s = ut", "s = ½at²", "s = vt", "s = u²"],
            answer: 1,
          },
          {
            id: "q3",
            question: "Velocity is a",
            choices: ["Scalar", "Vector", "Unit", "Constant"],
            answer: 1,
          },
        ],
      },
    ],
    mapCards: [
      { id: "mc1", noteId: "note_physics", title: "Kinematics", body: "Displacement ≠ distance. See [[Daily note]].", x: 80, y: 90 },
      { id: "mc2", noteId: "note_schema", title: "Daily note", body: "One markdown page per day.", x: 340, y: 70 },
      { id: "mc3", noteId: "note_coach", title: "Warmth 6", body: "Gentle, not saccharine.", x: 220, y: 240 },
      { id: "mc4", noteId: "note_landing", title: "Manifesto", body: "Won't shame your nervous system.", x: 480, y: 200 },
    ],
  };
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function withStudyDefaults(set: Partial<StudySet> & Pick<StudySet, "id" | "title" | "notesMd" | "cards" | "quiz" | "createdAt">): StudySet {
  const { cloze, guideMd, ...rest } = set;
  return {
    ...rest,
    cloze: cloze ?? [],
    guideMd: guideMd ?? "",
  };
}

class StudioStore {
  private state: StudioState;
  private listeners = new Set<() => void>();
  private hydrated = false;

  constructor() {
    this.state = seed();
  }

  hydrate = () => {
    if (this.hydrated) return;
    this.hydrated = true;
    if (!canUseStorage()) return;
    try {
      const raw = window.localStorage.getItem(KEY) ?? window.localStorage.getItem("tempo-studio-v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<StudioState>;
      if (!parsed?.notes || !parsed.onboarding) return;
      const base = seed();
      this.state = {
        ...base,
        ...parsed,
        notes: parsed.notes,
        weeklyNotes: parsed.weeklyNotes ?? base.weeklyNotes,
        monthlyNotes: parsed.monthlyNotes ?? base.monthlyNotes,
        yearlyNotes: parsed.yearlyNotes ?? base.yearlyNotes,
        studySets: (parsed.studySets ?? base.studySets).map((s) => withStudyDefaults(s)),
        mapCards: parsed.mapCards ?? base.mapCards,
        selectedDay: parsed.selectedDay ?? base.selectedDay,
        readingRuler: parsed.readingRuler ?? false,
        focusMode: parsed.focusMode ?? false,
      };
    } catch {
      /* ignore */
    }
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  get = (): StudioState => this.state;

  private emit() {
    if (canUseStorage()) {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(this.state));
      } catch {
        /* quota */
      }
    }
    for (const l of this.listeners) l();
  }

  private patch(partial: Partial<StudioState>) {
    this.state = { ...this.state, ...partial };
    this.emit();
  }

  setOnboarding(next: Partial<OnboardingState>) {
    this.patch({ onboarding: { ...this.state.onboarding, ...next } });
  }

  completeOnboarding() {
    this.setOnboarding({ completed: true, step: 4 });
  }

  setWarmth(warmth: number) {
    this.patch({ warmth: Math.max(0, Math.min(10, warmth)) });
  }

  setTheme(theme: "light" | "dark") {
    this.patch({ theme });
  }

  setDyslexia(dyslexia: boolean) {
    this.patch({ dyslexia });
  }

  setReadingRuler(readingRuler: boolean) {
    this.patch({ readingRuler });
  }

  setFocusMode(focusMode: boolean) {
    this.patch({ focusMode });
  }

  setVoiceMode(voiceMode: StudioState["voiceMode"]) {
    this.patch({ voiceMode });
  }

  setSelectedDay(selectedDay: string) {
    this.patch({ selectedDay });
  }

  upsertDaily(day: string, body: string) {
    this.patch({ dailyNotes: { ...this.state.dailyNotes, [day]: body } });
  }

  upsertWeekly(week: string, body: string) {
    this.patch({ weeklyNotes: { ...this.state.weeklyNotes, [week]: body } });
  }

  upsertMonthly(month: string, body: string) {
    this.patch({ monthlyNotes: { ...this.state.monthlyNotes, [month]: body } });
  }

  upsertYearly(year: string, body: string) {
    this.patch({ yearlyNotes: { ...this.state.yearlyNotes, [year]: body } });
  }

  carryOpen(fromDay: string, toDay: string) {
    const from = this.state.dailyNotes[fromDay] ?? "";
    const to = this.state.dailyNotes[toDay] ?? "";
    const open = parseTasks(from, toDay).filter((t) => t.status === "open");
    if (!open.length) return 0;
    let nextFrom = from;
    for (const t of [...open].sort((a, b) => b.lineIndex - a.lineIndex)) {
      nextFrom = markTaskMoved(nextFrom, t.lineIndex);
    }
    const nextTo = appendCarriedTasks(to, open, toDay);
    this.patch({ dailyNotes: { ...this.state.dailyNotes, [fromDay]: nextFrom, [toDay]: nextTo } });
    return open.length;
  }

  addNote(title: string, body = "") {
    const note: NoteDoc = {
      id: `note_${Date.now()}`,
      title: title.trim() || "Untitled",
      body,
      tag: "note",
      updatedAt: Date.now(),
      wordCount: words(body),
    };
    this.patch({ notes: [note, ...this.state.notes] });
    return note;
  }

  updateNote(id: string, patch: Partial<Pick<NoteDoc, "title" | "body" | "tag">>) {
    this.patch({
      notes: this.state.notes.map((n) =>
        n.id === id
          ? { ...n, ...patch, updatedAt: Date.now(), wordCount: words(patch.body ?? n.body) }
          : n,
      ),
    });
  }

  addJournal(body: string, mood = "steady") {
    const now = Date.now();
    const entry: JournalEntry = {
      id: `j_${now}`,
      day: isoToday(now),
      title: "Today",
      body,
      mood,
      createdAt: now,
    };
    this.patch({ journal: [entry, ...this.state.journal] });
    return entry;
  }

  pushChat(role: ChatRole, text: string, extra?: Partial<ChatMessage>) {
    const msg: ChatMessage = {
      id: `m_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      role,
      text,
      at: Date.now(),
      ...extra,
    };
    this.patch({ chat: [...this.state.chat, msg] });
    return msg;
  }

  setDumpRaw(dumpRaw: string) {
    this.patch({ dumpRaw });
  }

  setDumpItems(dumpItems: DumpItem[]) {
    this.patch({ dumpItems });
  }

  setDumpItem(id: string, status: DumpItemStatus, text?: string) {
    this.patch({
      dumpItems: this.state.dumpItems.map((item) =>
        item.id === id ? { ...item, status, text: text ?? item.text } : item,
      ),
    });
  }

  addStudySet(set: Omit<StudySet, "id" | "createdAt">) {
    const { cloze, guideMd, ...rest } = set;
    const full: StudySet = {
      ...rest,
      cloze: cloze ?? [],
      guideMd: guideMd ?? "",
      id: `study_${Date.now()}`,
      createdAt: Date.now(),
    };
    this.patch({ studySets: [full, ...this.state.studySets] });
    return full;
  }

  patchStudySet(id: string, patch: Partial<Pick<StudySet, "notesMd" | "cards" | "quiz" | "cloze" | "guideMd" | "title">>) {
    this.patch({
      studySets: this.state.studySets.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  rateCard(setId: string, cardId: string, grade: 0 | 1 | 2 | 3) {
    const intervals = [10 * 60e3, 4 * 3600e3, 864e5, 3 * 864e5];
    this.patch({
      studySets: this.state.studySets.map((s) =>
        s.id !== setId
          ? s
          : {
              ...s,
              cards: s.cards.map((c) =>
                c.id !== cardId
                  ? c
                  : {
                      ...c,
                      ease: Math.max(1.3, c.ease + (grade - 2) * 0.15),
                      dueAt: Date.now() + intervals[grade],
                    },
              ),
            },
      ),
    });
  }

  moveMapCard(id: string, x: number, y: number) {
    this.patch({
      mapCards: this.state.mapCards.map((c) => (c.id === id ? { ...c, x, y } : c)),
    });
  }

  addMapCard(card: Omit<MapCard, "id">) {
    const full = { ...card, id: `mc_${Date.now()}` };
    this.patch({ mapCards: [...this.state.mapCards, full] });
    return full;
  }

  updateMapCard(id: string, patch: Partial<Omit<MapCard, "id">>) {
    this.patch({
      mapCards: this.state.mapCards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  }

  removeMapCard(id: string) {
    this.patch({ mapCards: this.state.mapCards.filter((c) => c.id !== id) });
  }

  layoutMapCards(positions: { id: string; x: number; y: number }[]) {
    const byId = new Map(positions.map((p) => [p.id, p]));
    this.patch({
      mapCards: this.state.mapCards.map((c) => {
        const p = byId.get(c.id);
        return p ? { ...c, x: p.x, y: p.y } : c;
      }),
    });
  }
}

export const studioStore = new StudioStore();

export function useStudio(): StudioState {
  return useSyncExternalStore(studioStore.subscribe, studioStore.get, studioStore.get);
}

export function isoDay(now = Date.now()) {
  return isoToday(now);
}

export function countWords(text: string) {
  return words(text);
}

export function parseIsoDay(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export { shiftIsoDay };
