/** Preview AI helpers are dropped at graft. Local fallbacks in the views still run. */

type StudySet = {
  cards: { front: string; back: string }[];
  quiz: { question: string; choices: string[]; answer: number }[];
  notesMd: string;
  cloze?: { prompt: string; answer: string }[];
  guideMd?: string;
};

export const enhanceMarkdown = async (_input?: unknown): Promise<{ ok: boolean; markdown: string }> => ({
  ok: false,
  markdown: "",
});

export const makeStudySetAi = async (
  _input?: unknown,
): Promise<{ ok: boolean; set?: StudySet; error?: string }> => ({ ok: false });

export const makeStudyGuide = async (_input?: unknown): Promise<{ ok: boolean; markdown: string }> => ({
  ok: false,
  markdown: "",
});

export const makeClozeAi = async (
  _input?: unknown,
): Promise<{ ok: boolean; items?: { prompt: string; answer: string }[] }> => ({ ok: false });

export const tutorAsk = async (_input?: unknown): Promise<{ ok: boolean; text: string }> => ({
  ok: false,
  text: "",
});

export const explainAnswer = async (_input?: unknown): Promise<{ ok: boolean; text: string }> => ({
  ok: false,
  text: "",
});

export const tutorLesson = async (
  _input?: unknown,
): Promise<{
  ok: boolean;
  lesson?: { title: string; steps: { heading: string; body: string; question: string }[] };
}> => ({ ok: false });

export const clusterMap = async (
  _input?: unknown,
): Promise<{ ok: boolean; positions?: { id: string; x: number; y: number }[] }> => ({ ok: false });

export const askAboutSource = async (_input?: unknown): Promise<{ ok: boolean; text: string }> => ({
  ok: false,
  text: "",
});
