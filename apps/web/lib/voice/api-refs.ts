/**
 * Typed Convex function references for the voice + BYOK modules, built with
 * the public `makeFunctionReference` API.
 *
 * WHY: `convex/_generated/api.d.ts` is codegen-owned and codegen is banned in
 * this environment (it deploys), so the generated `api` object does not know
 * about the new `voice` / `byok` modules yet. Once `convex dev` regenerates
 * it, replace these with `api.voice.*` / `api.byok.*` and delete this file.
 * The string names must stay in sync with the exported function names.
 */

import type { Id } from "@/convex/_generated/dataModel";
import { makeFunctionReference } from "convex/server";

export type VoiceNoteView = {
  _id: Id<"voiceNotes">;
  _creationTime: number;
  status: "uploaded" | "transcribing" | "done" | "failed";
  source: "batch" | "stream";
  transcript?: string;
  durationSeconds?: number;
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
};

export const voiceApi = {
  generateUploadUrl: makeFunctionReference<
    "mutation",
    Record<string, never>,
    string
  >("voice:generateUploadUrl"),
  createVoiceNote: makeFunctionReference<
    "mutation",
    { storageId: Id<"_storage"> },
    Id<"voiceNotes">
  >("voice:createVoiceNote"),
  startTranscription: makeFunctionReference<
    "action",
    { voiceNoteId: Id<"voiceNotes"> },
    null
  >("voice:startTranscription"),
  listMine: makeFunctionReference<
    "query",
    Record<string, never>,
    VoiceNoteView[]
  >("voice:listMine"),
  getStreamingToken: makeFunctionReference<
    "action",
    { localDay: string },
    { accessToken: string; expiresIn: number; sessionId: Id<"voiceSessions"> }
  >("voice:getStreamingToken"),
  endStreamingSession: makeFunctionReference<
    "mutation",
    { sessionId: Id<"voiceSessions"> },
    null
  >("voice:endStreamingSession"),
  saveStreamTranscript: makeFunctionReference<
    "mutation",
    { transcript: string },
    Id<"voiceNotes">
  >("voice:saveStreamTranscript"),
} as const;

export const byokApi = {
  myKeys: makeFunctionReference<
    "query",
    Record<string, never>,
    Array<{
      provider: "deepgram" | "mistral";
      createdAt: number;
      updatedAt: number;
      lastValidatedAt?: number;
    }>
  >("byok:myKeys"),
  setKey: makeFunctionReference<
    "action",
    { provider: "deepgram" | "mistral"; apiKey: string },
    { provider: "deepgram" | "mistral"; validated: boolean }
  >("byok:setKey"),
  deleteKey: makeFunctionReference<
    "mutation",
    { provider: "deepgram" | "mistral" },
    boolean
  >("byok:deleteKey"),
} as const;

/** "YYYY-MM-DD" for the user's local calendar day (HARD_RULES §9 budgets). */
export function localDayKey(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
