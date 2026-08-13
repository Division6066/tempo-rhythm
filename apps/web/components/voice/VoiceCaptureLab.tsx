"use client";

/**
 * Voice capture lab — minimal surface exercising both decided flows:
 *  - Walkie-talkie (batch): record → upload ONE complete blob to Convex
 *    storage → async Deepgram transcription → transcript arrives via the
 *    reactive `voice:listMine` query. No polling.
 *  - Live (streaming): short-lived token from Convex → client-held Deepgram
 *    WebSocket → only FINALIZED text is persisted.
 *
 * Mounted at /labs/voice until a product surface (brain dump / coach) is
 * chosen for it.
 */

import { useAction, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { localDayKey, voiceApi, type VoiceNoteView } from "@/lib/voice/api-refs";
import {
  canRecordHere,
  startBatchRecording,
  uploadRecordingBlob,
  type BatchRecording,
} from "@/lib/voice/recorder";
import {
  startLiveTranscription,
  type LiveTranscriptionSession,
} from "@/lib/voice/streaming";

type Phase = "idle" | "recording" | "uploading" | "live";

function statusLabel(note: VoiceNoteView): string {
  switch (note.status) {
    case "uploaded":
      return "Saved — ready to transcribe";
    case "transcribing":
      return "Transcribing…";
    case "done":
      return note.source === "stream" ? "Live session" : "Transcript ready";
    case "failed":
      return "That one didn't transcribe — the recording is safe to retry";
    default: {
      const exhaustive: never = note.status;
      return exhaustive;
    }
  }
}

export function VoiceCaptureLab() {
  const notes = useQuery(voiceApi.listMine, {});
  const generateUploadUrl = useMutation(voiceApi.generateUploadUrl);
  const createVoiceNote = useMutation(voiceApi.createVoiceNote);
  const startTranscription = useAction(voiceApi.startTranscription);
  const getStreamingToken = useAction(voiceApi.getStreamingToken);
  const endStreamingSession = useMutation(voiceApi.endStreamingSession);
  const saveStreamTranscript = useMutation(voiceApi.saveStreamTranscript);

  const [phase, setPhase] = useState<Phase>("idle");
  const [notice, setNotice] = useState<string | null>(null);
  const [interim, setInterim] = useState("");
  const [liveSegments, setLiveSegments] = useState<string[]>([]);

  const batchRef = useRef<BatchRecording | null>(null);
  const liveRef = useRef<LiveTranscriptionSession | null>(null);
  const sessionIdRef = useRef<Id<"voiceSessions"> | null>(null);

  useEffect(() => {
    // Release the mic if the lab unmounts mid-take.
    return () => {
      batchRef.current?.cancel();
      void liveRef.current?.stop();
    };
  }, []);

  const supported = canRecordHere();

  const startBatch = useCallback(async () => {
    setNotice(null);
    try {
      batchRef.current = await startBatchRecording();
      setPhase("recording");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "The mic didn't open.");
    }
  }, []);

  const stopBatch = useCallback(async () => {
    const recording = batchRef.current;
    if (!recording) return;
    batchRef.current = null;
    setPhase("uploading");
    try {
      const blob = await recording.stop();
      const uploadUrl = await generateUploadUrl({});
      const storageId = (await uploadRecordingBlob(
        uploadUrl,
        blob,
      )) as Id<"_storage">;
      const voiceNoteId = await createVoiceNote({ storageId });
      await startTranscription({ voiceNoteId });
      setNotice("Got it — transcribing now. The text will appear below.");
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "That take didn't save. Try again?",
      );
    } finally {
      setPhase("idle");
    }
  }, [createVoiceNote, generateUploadUrl, startTranscription]);

  const cancelBatch = useCallback(() => {
    batchRef.current?.cancel();
    batchRef.current = null;
    setPhase("idle");
    setNotice("Recording discarded. Whenever you're ready.");
  }, []);

  const startLive = useCallback(async () => {
    setNotice(null);
    setInterim("");
    setLiveSegments([]);
    try {
      const grant = await getStreamingToken({ localDay: localDayKey() });
      sessionIdRef.current = grant.sessionId;
      liveRef.current = await startLiveTranscription(grant.accessToken, {
        onInterim: (text) => setInterim(text),
        onFinalSegment: (segment) => {
          setInterim("");
          setLiveSegments((previous) => [...previous, segment]);
        },
        onError: () =>
          setNotice("The live connection hiccuped. Your words so far are kept."),
      });
      setPhase("live");
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Live voice couldn't start.",
      );
      setPhase("idle");
    }
  }, [getStreamingToken]);

  const stopLive = useCallback(async () => {
    const session = liveRef.current;
    liveRef.current = null;
    setPhase("idle");
    setInterim("");
    try {
      const transcript = session ? await session.stop() : "";
      if (sessionIdRef.current) {
        await endStreamingSession({ sessionId: sessionIdRef.current });
        sessionIdRef.current = null;
      }
      if (transcript !== "") {
        await saveStreamTranscript({ transcript });
        setNotice("Live session saved.");
      } else {
        setNotice("Nothing was heard in that take — no worries.");
      }
      setLiveSegments([]);
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Closing the session hit a snag.",
      );
    }
  }, [endStreamingSession, saveStreamTranscript]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Voice lab</h1>
        <p className="text-sm opacity-70">
          Walkie-talkie notes are always available. Live voice uses your plan's
          daily minutes — or your own Deepgram key, unlimited.
        </p>
      </header>

      {!supported ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          Recording needs a secure (https) page with microphone access — nothing
          is wrong on your end.
        </p>
      ) : null}

      <section className="flex flex-wrap gap-3">
        {phase === "idle" ? (
          <>
            <button
              type="button"
              onClick={() => void startBatch()}
              disabled={!supported}
              className="rounded-lg bg-[#D97757] px-4 py-2 font-medium text-white disabled:opacity-50"
            >
              Record a note
            </button>
            <button
              type="button"
              onClick={() => void startLive()}
              disabled={!supported}
              className="rounded-lg border border-current px-4 py-2 font-medium disabled:opacity-50"
            >
              Start live voice
            </button>
          </>
        ) : null}
        {phase === "recording" ? (
          <>
            <button
              type="button"
              onClick={() => void stopBatch()}
              className="rounded-lg bg-[#D97757] px-4 py-2 font-medium text-white"
            >
              Stop &amp; transcribe
            </button>
            <button
              type="button"
              onClick={cancelBatch}
              className="rounded-lg border border-current px-4 py-2 font-medium"
            >
              Discard
            </button>
          </>
        ) : null}
        {phase === "uploading" ? (
          <span className="px-2 py-2 text-sm opacity-70">Saving your note…</span>
        ) : null}
        {phase === "live" ? (
          <button
            type="button"
            onClick={() => void stopLive()}
            className="rounded-lg bg-[#D97757] px-4 py-2 font-medium text-white"
          >
            End live session
          </button>
        ) : null}
      </section>

      {notice ? <p className="text-sm opacity-80">{notice}</p> : null}

      {phase === "live" ? (
        <section className="rounded-lg border border-current/20 p-4">
          <h2 className="mb-2 text-sm font-medium opacity-70">Hearing you…</h2>
          <p className="text-sm">
            {liveSegments.join(" ")}
            {interim !== "" ? (
              <span className="opacity-50"> {interim}</span>
            ) : null}
          </p>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium opacity-70">Your voice notes</h2>
        {notes === undefined ? (
          <p className="text-sm opacity-60">Loading…</p>
        ) : notes.length === 0 ? (
          <p className="text-sm opacity-60">
            No voice notes yet — the first one can be ten seconds of anything.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notes.map((note) => (
              <li
                key={note._id}
                className="rounded-lg border border-current/15 p-3 text-sm"
              >
                <div className="mb-1 flex items-center justify-between gap-2 text-xs opacity-60">
                  <span>{statusLabel(note)}</span>
                  <span>{new Date(note.createdAt).toLocaleString()}</span>
                </div>
                {note.transcript ? <p>{note.transcript}</p> : null}
                {note.errorMessage ? (
                  <p className="opacity-70">{note.errorMessage}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
