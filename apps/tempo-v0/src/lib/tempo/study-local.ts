/** Local extraction when the coach is quiet — never invents facts. */

export type LocalCard = { front: string; back: string };
export type LocalQuiz = { question: string; choices: string[]; answer: number };
export type LocalCloze = { prompt: string; answer: string };

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[j], a[i]] = [a[i], a[j]];
  }
  return a;
}

export function cardsFromMarkdown(md: string): LocalCard[] {
  const cards: LocalCard[] = [];
  const def = /^\*\*([^*]+)\*\*\s+[—–:-]\s+(.+)$/;
  for (const line of md.split("\n")) {
    const m = line.trim().match(def);
    if (m) cards.push({ front: m[1].trim(), back: m[2].trim() });
  }
  const marks = [...md.matchAll(/==([^=]+)==/g)].map((m) => m[1].trim());
  for (const mark of marks) {
    if (!cards.some((c) => c.front.toLowerCase() === mark.toLowerCase())) {
      cards.push({ front: mark, back: `Highlighted on the page. Open the notes tab to reread the sentence.` });
    }
  }
  const headings = [...md.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]);
  if (cards.length < 3) {
    for (const h of headings.slice(0, 4)) {
      cards.push({ front: h, back: `From your notes: ${h}. Open the page to reread the section.` });
    }
  }
  return cards.slice(0, 8);
}

export function quizFromCards(cards: LocalCard[]): LocalQuiz[] {
  return cards.slice(0, 3).map((c, i) => {
    const distractors = cards.filter((_, n) => n !== i).slice(0, 3).map((d) => d.back);
    const choices = shuffle([c.back, ...distractors].slice(0, 4));
    return {
      question: `What is ${c.front}?`,
      choices,
      answer: Math.max(0, choices.indexOf(c.back)),
    };
  });
}

export function clozeFromMarkdown(md: string): LocalCloze[] {
  const out: LocalCloze[] = [];
  const def = /^\*\*([^*]+)\*\*\s+[—–:-]\s+(.+)$/;
  for (const line of md.split("\n")) {
    const m = line.trim().match(def);
    if (m) out.push({ prompt: `______ — ${m[2].trim()}`, answer: m[1].trim() });
  }
  for (const m of md.matchAll(/==([^=]+)==/g)) {
    const term = m[1].trim();
    const sentence = md
      .split("\n")
      .find((l) => l.includes(`==${term}==`))
      ?.replace(/==([^=]+)==/g, "______");
    if (sentence && !out.some((c) => c.answer.toLowerCase() === term.toLowerCase())) {
      out.push({ prompt: sentence.replace(/^[-*]\s+/, "").trim(), answer: term });
    }
  }
  return out.slice(0, 8);
}

export function studyGuideLocal(md: string, title = "Study guide"): string {
  const cards = cardsFromMarkdown(md);
  const terms = cards.map((c) => `- **${c.front}** — ${c.back}`).join("\n");
  const questions = cards.slice(0, 4).map((c, i) => `${i + 1}. What is ${c.front}?`).join("\n");
  return `# ${title}

> [!note] Twelve minutes is a full session. Stopping on time is the point.

## Terms on this page
${terms || "- Nothing extracted yet. Write **term** — definition lines."}

## Try without looking
${questions || "1. What is the one idea on this page?"}

## Park
One question I still can't answer:
`;
}

export function materializeCards(
  cards: { front: string; back: string }[],
  now = Date.now(),
): { id: string; front: string; back: string; ease: number; dueAt: number }[] {
  return cards.map((c, i) => ({
    id: `c${now}_${i}`,
    front: c.front,
    back: c.back,
    ease: 2.3,
    dueAt: now,
  }));
}

export function materializeQuiz(
  quiz: LocalQuiz[],
  now = Date.now(),
): { id: string; question: string; choices: string[]; answer: number }[] {
  return quiz.map((q, i) => ({ id: `q${now}_${i}`, ...q }));
}

export function materializeCloze(
  items: LocalCloze[],
  now = Date.now(),
): { id: string; prompt: string; answer: string }[] {
  return items.map((c, i) => ({ id: `z${now}_${i}`, ...c }));
}
