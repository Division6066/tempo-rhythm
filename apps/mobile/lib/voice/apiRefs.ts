/**
 * Typed Convex function references for the voice module, built with the
 * public `makeFunctionReference` API.
 *
 * WHY: `convex/_generated/api.d.ts` is codegen-owned and codegen is banned in
 * this environment (it deploys), so the generated `api` object does not know
 * about the new `voice` module yet. Once `convex dev` regenerates it, replace
 * these with `api.voice.*` and delete this file. The string names must stay
 * in sync with the exported function names.
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
} as const;
