/**
 * Typed function references for the NEW modules (byok, voice), built with
 * Convex's public `makeFunctionReference` API.
 *
 * WHY THIS FILE EXISTS: `convex/_generated/api.d.ts` is codegen-owned and
 * `npx convex codegen` is banned in this environment (it deploys). Until the
 * next `convex dev` run regenerates the api object, the generated `internal`
 * type does not know about `byok` / `voice`, so cross-function calls inside
 * those modules reference functions by name here instead.
 *
 * FOLLOW-UP after codegen runs again: replace usages of these refs with
 * `internal.byok.*` / `internal.voice.*` and delete this file. The string
 * names below must stay in sync with the exported function names.
 */

import { makeFunctionReference } from "convex/server";
import type { Id } from "../_generated/dataModel";

export const byokRefs = {
  /** internalQuery byok:meForAction */
  meForAction: makeFunctionReference<"query", Record<string, never>, Id<"users">>(
    "byok:meForAction",
  ),
  /** internalMutation byok:storeEncryptedKey */
  storeEncryptedKey: makeFunctionReference<
    "mutation",
    {
      userId: Id<"users">;
      provider: "deepgram" | "mistral";
      ciphertextB64: string;
      ivB64: string;
      keyVersion: number;
    },
    null
  >("byok:storeEncryptedKey"),
  /** internalQuery byok:getEncryptedKeyRow */
  getEncryptedKeyRow: makeFunctionReference<
    "query",
    { userId: Id<"users">; provider: "deepgram" | "mistral" },
    { ciphertextB64: string; ivB64: string } | null
  >("byok:getEncryptedKeyRow"),
} as const;

export const voiceRefs = {
  /** internalQuery voice:getNoteForTranscription */
  getNoteForTranscription: makeFunctionReference<
    "query",
    { voiceNoteId: Id<"voiceNotes">; userId: Id<"users"> },
    { storageId: Id<"_storage"> } | null
  >("voice:getNoteForTranscription"),
  /** internalMutation voice:markTranscribing */
  markTranscribing: makeFunctionReference<
    "mutation",
    { voiceNoteId: Id<"voiceNotes"> },
    null
  >("voice:markTranscribing"),
  /** internalAction voice:transcribeAttempt */
  transcribeAttempt: makeFunctionReference<
    "action",
    { voiceNoteId: Id<"voiceNotes">; userId: Id<"users">; attempt: number },
    null
  >("voice:transcribeAttempt"),
  /** internalQuery voice:getNoteState */
  getNoteState: makeFunctionReference<
    "query",
    { voiceNoteId: Id<"voiceNotes"> },
    {
      status: "uploaded" | "transcribing" | "done" | "failed";
      storageId?: Id<"_storage">;
    } | null
  >("voice:getNoteState"),
  /** internalMutation voice:recordRequestId */
  recordRequestId: makeFunctionReference<
    "mutation",
    { voiceNoteId: Id<"voiceNotes">; deepgramRequestId: string },
    null
  >("voice:recordRequestId"),
  /** internalMutation voice:markFailed */
  markFailed: makeFunctionReference<
    "mutation",
    { voiceNoteId: Id<"voiceNotes">; errorMessage: string },
    null
  >("voice:markFailed"),
  /** internalMutation voice:completeFromCallback */
  completeFromCallback: makeFunctionReference<
    "mutation",
    {
      noteIdRaw: string;
      deepgramRequestId: string;
      transcript: string;
      durationSeconds?: number;
    },
    null
  >("voice:completeFromCallback"),
  /** internalQuery voice:getStreamingBudgetInputs */
  getStreamingBudgetInputs: makeFunctionReference<
    "query",
    { userId: Id<"users">; localDay: string },
    {
      sessions: Array<{ startedAt: number; endedAt?: number; durationMs?: number }>;
      entitlementTier?: "none" | "basic" | "pro" | "max" | "god";
    }
  >("voice:getStreamingBudgetInputs"),
  /** internalMutation voice:openStreamingSession */
  openStreamingSession: makeFunctionReference<
    "mutation",
    { userId: Id<"users">; localDay: string; usedByok: boolean },
    Id<"voiceSessions">
  >("voice:openStreamingSession"),
} as const;
