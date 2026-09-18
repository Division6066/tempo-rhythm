import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/tempo-graft/auth/middleware";

type StudyPayload = {
  notesMd: string;
  cards: { front: string; back: string }[];
  quiz: { question: string; choices: string[]; answer: number }[];
  cloze?: { prompt: string; answer: string }[];
  guideMd?: string;
};

async function chat(system: string, user: string, maxTokens: number): Promise<string | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      max_tokens: maxTokens,
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return body.choices?.[0]?.message?.content ?? null;
}

function parseJson<T>(text: string): T | null {
  try {
    const json = text.replace(/^```json\s*|\s*```$/g, "").trim();
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

const VOICE = `You are Tempo, a calm executive-function coach. Warm, specific, never shaming.
Uncle Iroh with a notebook. Short paragraphs. No hustle, grind, failed, champ, or trophies.
Do not name any model or provider. If the source material doesn't contain the answer, say so.`;

export const enhanceMarkdown = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { raw: string }) => input)
  .handler(async ({ data }) => {
    const text = await chat(
      `${VOICE}
Turn the raw dump or lecture capture into structured markdown:
# title
## headers
* [ ] tasks with @time, #tags, !! priority, >YYYY-MM-DD when a date is obvious
**term** — definition for study
==highlight== on one key phrase
Keep the author's words. Don't invent facts. 400 words max.`,
      data.raw.slice(0, 8000),
      900,
    );
    return { ok: Boolean(text), markdown: text ?? "" };
  });

export const makeStudySetAi = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { markdown: string; title?: string }) => input)
  .handler(async ({ data }): Promise<{ ok: boolean; set?: StudyPayload; error?: string }> => {
    const text = await chat(
      `${VOICE}
Return ONLY JSON with this shape:
{"notesMd":"markdown summary","cards":[{"front":"","back":""}],"quiz":[{"question":"","choices":["a","b","c","d"],"answer":0}],"cloze":[{"prompt":"______ is …","answer":""}],"guideMd":"markdown study guide"}
5 to 8 cards. 3 quiz questions. 4 cloze. ADHD-friendly: short stems, one idea each. Grounded only in the source.`,
      data.markdown.slice(0, 8000),
      1400,
    );
    if (!text) return { ok: false, error: "quiet" };
    const parsed = parseJson<StudyPayload>(text);
    if (!parsed || !Array.isArray(parsed.cards)) return { ok: false, error: "shape" };
    return { ok: true, set: parsed };
  });

export const makeStudyGuide = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { markdown: string; title?: string }) => input)
  .handler(async ({ data }) => {
    const text = await chat(
      `${VOICE}
Write a one-page study guide in markdown from the source. Sections:
# title
## Terms (**term** — definition)
## Try without looking (3 short questions)
## Park (one open question)
No shame. 250 words max. Grounded only in the source.`,
      data.markdown.slice(0, 8000),
      700,
    );
    return { ok: Boolean(text), markdown: text ?? "" };
  });

export const makeClozeAi = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { markdown: string }) => input)
  .handler(async ({ data }): Promise<{ ok: boolean; items?: { prompt: string; answer: string }[] }> => {
    const text = await chat(
      `${VOICE}
Return ONLY JSON: {"items":[{"prompt":"A sentence with ______ for the missing term","answer":"term"}]}
4 to 6 cloze items. One blank each. ADHD-friendly short sentences. Grounded only in the source.`,
      data.markdown.slice(0, 6000),
      700,
    );
    if (!text) return { ok: false };
    const parsed = parseJson<{ items: { prompt: string; answer: string }[] }>(text);
    if (!parsed?.items?.length) return { ok: false };
    return { ok: true, items: parsed.items.slice(0, 8) };
  });

export const tutorAsk = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { question: string; context: string }) => input)
  .handler(async ({ data }) => {
    const text = await chat(
      `${VOICE}
Tutor from the provided notes only. Prefer a 4-6 sentence answer. If it's a worked example, show steps.
End with one small next question the student could try.`,
      `SOURCE:\n${data.context.slice(0, 6000)}\n\nQUESTION:\n${data.question.slice(0, 500)}`,
      500,
    );
    return { ok: Boolean(text), text: text ?? "" };
  });

export const explainAnswer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { question: string; picked: string; correct: string; context: string }) => input)
  .handler(async ({ data }) => {
    const text = await chat(
      `${VOICE}
The student picked an answer. Explain why the correct one is right, and why theirs missed, in 3-5 short sentences.
Never shame. If they were right, say what they noticed. Grounded only in the notes.`,
      `NOTES:\n${data.context.slice(0, 4000)}\n\nQUESTION: ${data.question}\nTHEY PICKED: ${data.picked}\nCORRECT: ${data.correct}`,
      280,
    );
    return { ok: Boolean(text), text: text ?? "" };
  });

export const tutorLesson = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { markdown: string; title?: string }) => input)
  .handler(async ({ data }): Promise<{ ok: boolean; lesson?: { title: string; steps: { heading: string; body: string; question: string }[] } }> => {
    const text = await chat(
      `${VOICE}
Return ONLY JSON:
{"title":"","steps":[{"heading":"","body":"","question":""}]}
Four short steps. One idea each. 40-80 words of body. A tiny question after each step.
ADHD-friendly. Grounded only in the source. This is a 12-minute lesson.`,
      data.markdown.slice(0, 6000),
      900,
    );
    if (!text) return { ok: false };
    const parsed = parseJson<{ title: string; steps: { heading: string; body: string; question: string }[] }>(text);
    if (!parsed?.steps?.length) return { ok: false };
    return { ok: true, lesson: { title: parsed.title || data.title || "Lesson", steps: parsed.steps.slice(0, 4) } };
  });

export const clusterMap = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { cards: { id: string; title: string; body: string }[] }) => input)
  .handler(async ({ data }): Promise<{ ok: boolean; positions?: { id: string; x: number; y: number }[] }> => {
    const text = await chat(
      `${VOICE}
Return ONLY JSON: {"positions":[{"id":"","x":0,"y":0}]}
Place related cards near each other on a 960×640 dotted canvas. Leave 24px gaps. x,y are top-left of 200px-wide cards.
Do not invent ids.`,
      JSON.stringify(data.cards.slice(0, 24)),
      600,
    );
    if (!text) return { ok: false };
    const parsed = parseJson<{ positions: { id: string; x: number; y: number }[] }>(text);
    if (!Array.isArray(parsed?.positions)) return { ok: false };
    return { ok: true, positions: parsed.positions };
  });

export const askAboutSource = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { question: string; context: string }) => input)
  .handler(async ({ data }) => {
    const text = await chat(
      `${VOICE}
Explain, take notes, or organize from the provided source only. 4-6 short sentences.
If asked to organize, suggest 2-4 [[wiki]] links and one #tag. Never invent facts.`,
      `SOURCE:\n${data.context.slice(0, 5000)}\n\nASK:\n${data.question.slice(0, 400)}`,
      420,
    );
    return { ok: Boolean(text), text: text ?? "" };
  });
