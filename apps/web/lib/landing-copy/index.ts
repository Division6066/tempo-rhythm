import { en } from "./en";
import { he } from "./he";
import type { LandingCopy } from "./types";

export type LandingLanguage = "en" | "he";

const dictionaries: Record<LandingLanguage, LandingCopy> = { en, he };

export function getLandingCopy(language: LandingLanguage): LandingCopy {
  return dictionaries[language];
}

export type { LandingCopy } from "./types";
