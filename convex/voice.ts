/**
 * Voice capture — batch (walkie-talkie) transcription and streaming token
 * grants. Decided architecture: AUDIO NEVER PASSES THROUGH CONVEX COMPUTE.
 *
 * Batch: client records → uploads the complete blob to Convex storage →
 * `startTranscription` → internal action does ONE fetch handing Deepgram the
 * signed storage URL + a callback URL → Deepgram fetches the audio itself →
 * POSTs the transcript to the `/api/deepgram-callback` httpAction → reactive
 * queries push it to the client. No polling. The audio file is deleted the
 * moment the transcript lands (storage URLs are public and unrevocable).
 *
 * Streaming: `getStreamingToken` mints a short-lived Deepgram JWT
 * (`/v1/auth/grant`); the CLIENT holds the WebSocket. Convex cannot hold an
 * outbound socket — `WebSocket` is absent from the default runtime's
 * enumerated network APIs. Only finalized transcript text is persisted.
 *
 * Memory rule: always `ctx.storage.getUrl()`, never `ctx.storage.get()`,
 * for audio — actions get 64 MB and a long recording OOMs.
 *
 * DEVIATION FROM THE DECIDED ARCHITECTURE (flagged, not silent): retries use
 * `ctx.scheduler` with bounded attempts instead of the Workpool component.
 * Installing a Convex component requires `convex.config.ts` + regenerated
 * `_generated/` code, and `npx convex codegen` is banned in this environment
 * (it deploys). Swap to Workpool in a follow-up once codegen can run.
 */

import {
  AiEnvError,
  mintStreamingToken,
  parseTranscriptionCallback,
  ProviderAuthError,
  requireEnv,
  submitTranscription,
} from "@tempo/ai";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  action,
  httpAction,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { byokRefs, voiceRefs } from "./lib/fn_refs";
import { getDecryptedByokKey } from "./byok";
import { requireUser } from "./lib/requireUser";
import {
  buildCallbackUrl,
  clampSessionDurationMs,
  isValidLocalDay,
  streamingCapMinutes,
  timingSafeEqualStrings,
  usedStreamingMs,
} from "./lib/voice_helpers";

const MAX_TRANSCRIBE_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = 30_000;
const MAX_OPEN_SESSIONS = 3;
const STREAM_TOKEN_TTL_SECONDS = 300;

const voiceNoteView = v.object({
  _id: v.id("voiceNotes"),
  _creationTime: v.number(),
  status: v.union(
    v.literal("uploaded"),
    v.literal("transcribing"),
    v.literal("done"),
    v.literal("failed"),
  ),
  source: v.union(v.literal("batch"), v.literal("stream")),
  transcript: v.optional(v.string()),
  durationSeconds: v.optional(v.number()),
  errorMessage: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

// ---------------------------------------------------------------------------
// Batch (walkie-talkie) flow
// ---------------------------------------------------------------------------

/** Step 1: mint a short-lived storage upload URL for the recorded blob. */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireUser(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

/** Step 2: register the uploaded blob as a voice note. */
export const createVoiceNote = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.id("voiceNotes"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    return ctx.db.insert("voiceNotes", {
      userId: user._id,
      storageId: args.storageId,
      status: "uploaded",
      source: "batch",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Step 3: kick off async transcription (walkie-talkie is tier-universal). */
export const startTranscription = action({
  args: { voiceNoteId: v.id("voiceNotes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId: Id<"users"> = await ctx.runQuery(byokRefs.meForAction, {});
    const note = await ctx.runQuery(voiceRefs.getNoteForTranscription, {
      voiceNoteId: args.voiceNoteId,
      userId,
    });
    if (!note) {
      throw new Error("That recording isn't available to transcribe.");
    }
    await ctx.runMutation(voiceRefs.markTranscribing, {
      voiceNoteId: args.voiceNoteId,
    });
    await ctx.scheduler.runAfter(0, voiceRefs.transcribeAttempt, {
      voiceNoteId: args.voiceNoteId,
      userId,
      attempt: 1,
    });
    return null;
  },
});

export const getNoteForTranscription = internalQuery({
  args: { voiceNoteId: v.id("voiceNotes"), userId: v.id("users") },
  returns: v.union(v.object({ storageId: v.id("_storage") }), v.null()),
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.voiceNoteId);
    if (
      !note ||
      note.userId !== args.userId ||
      note.deletedAt !== undefined ||
      note.storageId === undefined ||
      (note.status !== "uploaded" && note.status !== "failed")
    ) {
      return null;
    }
    return { storageId: note.storageId };
  },
});

export const markTranscribing = internalMutation({
  args: { voiceNoteId: v.id("voiceNotes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.voiceNoteId, {
      status: "transcribing",
      errorMessage: undefined,
      updatedAt: Date.now(),
    });
    return null;
  },
});

/**
 * The single provider POST, with bounded scheduler retries (Convex actions
 * are at-most-once and never retried by the platform).
 */
export const transcribeAttempt = internalAction({
  args: {
    voiceNoteId: v.id("voiceNotes"),
    userId: v.id("users"),
    attempt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const note = await ctx.runQuery(voiceRefs.getNoteState, {
      voiceNoteId: args.voiceNoteId,
    });
    if (!note || note.status !== "transcribing" || note.storageId === undefined) {
      return null; // completed / cancelled / audio gone — nothing to do
    }

    // ALWAYS getUrl, never get(): storage.get() pulls the whole blob into
    // the action's 64 MB memory budget.
    const audioUrl = await ctx.storage.getUrl(note.storageId);
    if (!audioUrl) {
      await ctx.runMutation(voiceRefs.markFailed, {
        voiceNoteId: args.voiceNoteId,
        errorMessage: "The audio file is no longer in storage.",
      });
      return null;
    }

    try {
      const byokKey = await getDecryptedByokKey(ctx, args.userId, "deepgram");
      const callbackUrl = buildCallbackUrl({
        // CONVEX_SITE_URL is auto-populated by Convex on every deployment.
        siteUrl: requireEnv("CONVEX_SITE_URL", { deployment: "convex" }),
        secret: requireEnv("DEEPGRAM_CALLBACK_SECRET", { deployment: "convex" }),
        noteId: args.voiceNoteId,
      });
      const { requestId } = await submitTranscription({
        audioUrl,
        callbackUrl,
        byokKey: byokKey ?? undefined,
      });
      await ctx.runMutation(voiceRefs.recordRequestId, {
        voiceNoteId: args.voiceNoteId,
        deepgramRequestId: requestId,
      });
    } catch (err) {
      // Auth/config problems are permanent — retrying cannot fix them.
      const permanent = err instanceof ProviderAuthError || err instanceof AiEnvError;
      if (!permanent && args.attempt < MAX_TRANSCRIBE_ATTEMPTS) {
        await ctx.scheduler.runAfter(
          RETRY_BACKOFF_MS * args.attempt,
          voiceRefs.transcribeAttempt,
          {
            voiceNoteId: args.voiceNoteId,
            userId: args.userId,
            attempt: args.attempt + 1,
          },
        );
        return null;
      }
      // Typed provider/env errors carry sanitized messages (never a key).
      const message =
        err instanceof Error ? err.message : "Transcription could not start.";
      await ctx.runMutation(voiceRefs.markFailed, {
        voiceNoteId: args.voiceNoteId,
        errorMessage: message,
      });
    }
    return null;
  },
});

export const getNoteState = internalQuery({
  args: { voiceNoteId: v.id("voiceNotes") },
  returns: v.union(
    v.object({
      status: v.union(
        v.literal("uploaded"),
        v.literal("transcribing"),
        v.literal("done"),
        v.literal("failed"),
      ),
      storageId: v.optional(v.id("_storage")),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.voiceNoteId);
    if (!note || note.deletedAt !== undefined) return null;
    return { status: note.status, storageId: note.storageId };
  },
});

export const recordRequestId = internalMutation({
  args: { voiceNoteId: v.id("voiceNotes"), deepgramRequestId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.voiceNoteId, {
      deepgramRequestId: args.deepgramRequestId,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const markFailed = internalMutation({
  args: { voiceNoteId: v.id("voiceNotes"), errorMessage: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.voiceNoteId, {
      status: "failed",
      errorMessage: args.errorMessage,
      updatedAt: Date.now(),
    });
    return null;
  },
});

/**
 * Deepgram POSTs the finished transcript here (async callback). Registered
 * at POST /api/deepgram-callback in convex/http.ts.
 *
 * Auth: shared secret in the query string, constant-time compared against
 * DEEPGRAM_CALLBACK_SECRET. Deepgram retries non-2xx responses up to 10
 * times with 30 s delays, so anything past auth returns 200 even when the
 * payload is unusable (a retry cannot fix a malformed payload).
 */
export const deepgramCallback = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret") ?? "";
  const noteId = url.searchParams.get("noteId") ?? "";

  let expectedSecret: string;
  try {
    expectedSecret = requireEnv("DEEPGRAM_CALLBACK_SECRET", {
      deployment: "convex",
    });
  } catch {
    console.error(
      "[voice] DEEPGRAM_CALLBACK_SECRET is not configured; rejecting transcription callback (fail closed).",
    );
    return new Response("Unauthorized", { status: 401 });
  }
  if (!timingSafeEqualStrings(secret, expectedSecret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ ignored: "invalid JSON" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = parseTranscriptionCallback(payload);
  if (!result) {
    return new Response(JSON.stringify({ ignored: "not a transcript payload" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  await ctx.runMutation(voiceRefs.completeFromCallback, {
    noteIdRaw: noteId,
    deepgramRequestId: result.requestId,
    transcript: result.transcript,
    durationSeconds: result.durationSeconds,
  });

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

export const completeFromCallback = internalMutation({
  args: {
    noteIdRaw: v.string(),
    deepgramRequestId: v.string(),
    transcript: v.string(),
    durationSeconds: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const noteId = ctx.db.normalizeId("voiceNotes", args.noteIdRaw);
    if (!noteId) {
      console.warn("[voice] callback carried an unparseable noteId; ignored.");
      return null;
    }
    const note = await ctx.db.get(noteId);
    if (!note || note.deletedAt !== undefined) {
      console.warn("[voice] callback for a missing/deleted note; ignored.");
      return null;
    }
    // Correlate on the persisted request_id — a stale or replayed callback
    // for a different submission must not overwrite the note.
    if (note.deepgramRequestId !== args.deepgramRequestId) {
      console.warn("[voice] callback request_id mismatch; ignored.");
      return null;
    }
    if (note.status === "done") {
      return null; // idempotent — Deepgram may retry after a slow 2xx
    }

    const now = Date.now();
    await ctx.db.patch(noteId, {
      status: "done",
      transcript: args.transcript,
      durationSeconds: args.durationSeconds,
      errorMessage: undefined,
      updatedAt: now,
    });

    // Mint late, delete early: the signed URL is public and unrevocable, so
    // the audio file is removed the moment the transcript is safe.
    if (note.storageId !== undefined) {
      await ctx.storage.delete(note.storageId);
      await ctx.db.patch(noteId, {
        storageId: undefined,
        audioDeletedAt: now,
        updatedAt: now,
      });
    }
    return null;
  },
});

/** Reactive list the client subscribes to — transcripts arrive via this. */
export const listMine = query({
  args: {},
  returns: v.array(voiceNoteView),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const rows = await ctx.db
      .query("voiceNotes")
      .withIndex("by_userId_deletedAt", (q) =>
        q.eq("userId", user._id).eq("deletedAt", undefined),
      )
      .order("desc")
      .take(50);
    return rows.map((note) => ({
      _id: note._id,
      _creationTime: note._creationTime,
      status: note.status,
      source: note.source,
      transcript: note.transcript,
      durationSeconds: note.durationSeconds,
      errorMessage: note.errorMessage,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));
  },
});

// ---------------------------------------------------------------------------
// Streaming flow (client-held socket)
// ---------------------------------------------------------------------------

/**
 * Mint a short-lived Deepgram JWT for a client-held streaming socket.
 *
 * Budget (HARD_RULES §9): live voice is minute-capped per tier per user-local
 * day — basic 30 / pro 90 / max 180, god unlimited, tier "none" gets live
 * voice only with a personal key. A BYOK Deepgram key bypasses the cap (the
 * user streams on their own account). Walkie-talkie stays universal.
 */
export const getStreamingToken = action({
  args: { localDay: v.string() },
  returns: v.object({
    accessToken: v.string(),
    expiresIn: v.number(),
    sessionId: v.id("voiceSessions"),
  }),
  handler: async (ctx, args) => {
    if (!isValidLocalDay(args.localDay)) {
      throw new Error("localDay must be a YYYY-MM-DD string.");
    }
    const userId: Id<"users"> = await ctx.runQuery(byokRefs.meForAction, {});
    const byokKey = await getDecryptedByokKey(ctx, userId, "deepgram");

    const { sessions, entitlementTier } = await ctx.runQuery(
      voiceRefs.getStreamingBudgetInputs,
      { userId, localDay: args.localDay },
    );

    const openSessions = sessions.filter((s) => s.endedAt === undefined).length;
    if (openSessions >= MAX_OPEN_SESSIONS) {
      throw new Error(
        "A few live sessions are still marked open. Close one and try again.",
      );
    }

    if (byokKey === null) {
      const capMinutes = streamingCapMinutes(entitlementTier);
      if (capMinutes !== null) {
        const usedMs = usedStreamingMs(sessions, Date.now());
        const remainingMs = capMinutes * 60_000 - usedMs;
        if (remainingMs < 60_000) {
          // Anti-shame copy (HARD_RULES §1) — never "you ran out / failed".
          throw new Error(
            "Live voice has used its minutes for today on this plan. Walkie-talkie notes are always available, or add your own Deepgram key in Settings for unlimited live voice.",
          );
        }
      }
    }

    const grant = await mintStreamingToken({
      ttlSeconds: STREAM_TOKEN_TTL_SECONDS,
      byokKey: byokKey ?? undefined,
    });

    const sessionId: Id<"voiceSessions"> = await ctx.runMutation(
      voiceRefs.openStreamingSession,
      { userId, localDay: args.localDay, usedByok: byokKey !== null },
    );

    // ONLY the short-lived JWT leaves the server. Never the API key.
    return {
      accessToken: grant.accessToken,
      expiresIn: grant.expiresIn,
      sessionId,
    };
  },
});

export const getStreamingBudgetInputs = internalQuery({
  args: { userId: v.id("users"), localDay: v.string() },
  returns: v.object({
    sessions: v.array(
      v.object({
        startedAt: v.number(),
        endedAt: v.optional(v.number()),
        durationMs: v.optional(v.number()),
      }),
    ),
    entitlementTier: v.optional(
      v.union(
        v.literal("none"),
        v.literal("basic"),
        v.literal("pro"),
        v.literal("max"),
        v.literal("god"),
      ),
    ),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    const rows = await ctx.db
      .query("voiceSessions")
      .withIndex("by_userId_localDay", (q) =>
        q.eq("userId", args.userId).eq("localDay", args.localDay),
      )
      .collect();
    return {
      sessions: rows
        .filter((row) => row.deletedAt === undefined)
        .map((row) => ({
          startedAt: row.startedAt,
          endedAt: row.endedAt,
          durationMs: row.durationMs,
        })),
      entitlementTier: user?.entitlementTier,
    };
  },
});

export const openStreamingSession = internalMutation({
  args: {
    userId: v.id("users"),
    localDay: v.string(),
    usedByok: v.boolean(),
  },
  returns: v.id("voiceSessions"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("voiceSessions", {
      userId: args.userId,
      localDay: args.localDay,
      startedAt: now,
      usedByok: args.usedByok,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Close a streaming session; duration is clamped to [0, 2 h]. */
export const endStreamingSession = mutation({
  args: { sessionId: v.id("voiceSessions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id || session.deletedAt !== undefined) {
      throw new Error("That session isn't yours to close.");
    }
    if (session.endedAt !== undefined) return null; // idempotent
    const now = Date.now();
    await ctx.db.patch(args.sessionId, {
      endedAt: now,
      durationMs: clampSessionDurationMs(now - session.startedAt),
      updatedAt: now,
    });
    return null;
  },
});

/** Persist a FINALIZED streaming transcript (text only — never audio). */
export const saveStreamTranscript = mutation({
  args: { transcript: v.string() },
  returns: v.id("voiceNotes"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const transcript = args.transcript.trim();
    if (transcript === "") {
      throw new Error("Nothing was heard in that take — try again when ready.");
    }
    const now = Date.now();
    return ctx.db.insert("voiceNotes", {
      userId: user._id,
      status: "done",
      source: "stream",
      transcript,
      createdAt: now,
      updatedAt: now,
    });
  },
});
