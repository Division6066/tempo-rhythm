/**
 * Walkie-talkie voice capture for mobile — batch flow only.
 *
 * Uses `expo-audio` (expo-av is deprecated and will be removed in SDK 55)
 * with `RecordingPresets.HIGH_QUALITY`, which produces .m4a / MPEG4AAC on
 * BOTH platforms — a format Deepgram accepts directly, no transcoding.
 * Never use LOW_QUALITY on Android: it emits .3gp / AMR-NB, which is not on
 * Deepgram's supported-format list.
 *
 * The complete file uploads to Convex storage; transcription happens
 * server-side via the async callback flow (audio never passes through
 * Convex compute), and the transcript arrives through the reactive
 * `voice:listMine` query.
 *
 * Live STREAMING capture is intentionally NOT implemented on mobile yet:
 * expo-audio's recorder does not expose a live PCM buffer stream, so a
 * client-held Deepgram socket would need an additional native module.
 * Flagged as a follow-up rather than silently substituted.
 */

import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import { useAction, useMutation } from "convex/react";
import { useCallback, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { voiceApi } from "./apiRefs";

export type VoiceRecorderPhase = "idle" | "recording" | "uploading";

export type VoiceNoteRecorder = {
  phase: VoiceRecorderPhase;
  /** Anti-shame status/notice copy for the UI. Never blames the user. */
  notice: string | null;
  startRecording: () => Promise<void>;
  /** Stop, upload the complete file, and kick off transcription. */
  stopAndTranscribe: () => Promise<void>;
};

export function useVoiceNoteRecorder(): VoiceNoteRecorder {
  // HIGH_QUALITY → .m4a/AAC on iOS and Android alike (Deepgram-supported).
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const generateUploadUrl = useMutation(voiceApi.generateUploadUrl);
  const createVoiceNote = useMutation(voiceApi.createVoiceNote);
  const startTranscription = useAction(voiceApi.startTranscription);

  const [phase, setPhase] = useState<VoiceRecorderPhase>("idle");
  const [notice, setNotice] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    setNotice(null);
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setNotice(
        "Tempo needs microphone access for voice notes. You can enable it in system settings whenever you like.",
      );
      return;
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setPhase("recording");
  }, [recorder]);

  const stopAndTranscribe = useCallback(async () => {
    setPhase("uploading");
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        setNotice("That take didn't produce audio — happy to try again.");
        setPhase("idle");
        return;
      }

      // Read the finished file and POST the COMPLETE blob (never chunks) to
      // the Convex storage upload URL.
      const fileResponse = await fetch(uri);
      const blob = await fileResponse.blob();

      const uploadUrl = await generateUploadUrl({});
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type || "audio/mp4" },
        body: blob,
      });
      if (!uploadResponse.ok) {
        throw new Error("upload failed");
      }
      const { storageId } = (await uploadResponse.json()) as {
        storageId: Id<"_storage">;
      };

      const voiceNoteId = await createVoiceNote({ storageId });
      await startTranscription({ voiceNoteId });
      setNotice("Got it — transcribing now.");
    } catch {
      setNotice("That note didn't send. It's safe to record again.");
    } finally {
      setPhase("idle");
    }
  }, [createVoiceNote, generateUploadUrl, recorder, startTranscription]);

  return { phase, notice, startRecording, stopAndTranscribe };
}
