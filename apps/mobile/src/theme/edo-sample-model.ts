import { edoTheme } from "../../../../packages/theme/src/edo";

export type EdoLanguage = "en" | "he";
export type EdoDirection = "ltr" | "rtl";

export const edoSampleCopy = {
  kanji: "道",
  romaji: "Michi",
  title: "Edo rhythm tokens",
  body: "A quiet sumi-e system for planning without pressure.",
} as const;

export const getEdoDirection = (language: EdoLanguage): EdoDirection =>
  language === "he" ? "rtl" : "ltr";

export const createEdoSampleModel = (language: EdoLanguage) => ({
  copy: edoSampleCopy,
  direction: getEdoDirection(language),
  theme: edoTheme,
});

export { edoTheme };
