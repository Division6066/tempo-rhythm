/**
 * Live (streaming) transcription — the CLIENT holds the WebSocket.
 *
 * Convex mints a short-lived JWT (`voice:getStreamingToken` →
 * Deepgram `/v1/auth/grant`); this module opens
 * `wss://api.deepgram.com/v1/listen` directly via `@deepgram/sdk` v5, which
 * handles the WebSocket auth handshake for browsers. Browser REST calls to
 * Deepgram are CORS-blocked, but WebSocket from a browser is fine.
 *
 * Feeding MediaRecorder `start(250)` chunks into ONE continuous socket is
 * safe (the decoder consumes a single uninterrupted container stream) —
 * treating those chunks as standalone files is not. Because the audio is
 * containerized (WebM/MP4/Ogg), NO `encoding` and NO `sample_rate` params
 * are sent.
 *
 * Only FINALIZED transcript text is persisted to Convex. Never audio.
 */

import { DeepgramClient } from "@deepgram/sdk";
import { pickSupportedMimeType } from "./recorder";

const STREAM_CHUNK_MS = 250;

type ResultsMessage = {
  type: "Results";
  is_final?: boolean;
  channel: { alternatives: Array<{ transcript: string }> };
};

function isResultsMessage(message: unknown): message is ResultsMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as { type?: unknown }).type === "Results"
  );
}

export type LiveTranscriptionHandlers = {
  /** Interim (non-final) hypothesis for the current utterance. */
  onInterim?: (text: string) => void;
  /** A finalized segment (is_final === true). */
  onFinalSegment?: (text: string) => void;
  onError?: (error: Error) => void;
};

export type LiveTranscriptionSession = {
  /** Stop the mic + socket; resolves the full finalized transcript. */
  stop: () => Promise<string>;
};

/** Open the mic and a Deepgram streaming socket with a short-lived token. */
export async function startLiveTranscription(
  accessToken: string,
  handlers: LiveTranscriptionHandlers = {},
): Promise<LiveTranscriptionSession> {
  if (typeof navigator === "undefined" || navigator.mediaDevices === undefined) {
    throw new Error(
      "Live voice needs a secure (https) page and microphone access.",
    );
  }
  const mimeType = pickSupportedMimeType((t) => MediaRecorder.isTypeSupported(t));
  if (!mimeType) {
    throw new Error("This browser doesn't offer a recordable audio format.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const client = new DeepgramClient({ accessToken });
  // Containerized audio: no encoding, no sample_rate (raw PCM only would
  // need encoding=linear16&sample_rate=...).
  const socket = await client.listen.v1.connect({
    model: "nova-3",
    interim_results: "true",
    punctuate: "true",
  });

  const finalSegments: string[] = [];

  socket.on("message", (message) => {
    if (!isResultsMessage(message)) return;
    const transcript = message.channel.alternatives[0]?.transcript ?? "";
    if (transcript === "") return;
    if (message.is_final) {
      finalSegments.push(transcript);
      handlers.onFinalSegment?.(transcript);
    } else {
      handlers.onInterim?.(transcript);
    }
  });
  socket.on("error", (error) => {
    handlers.onError?.(error);
  });

  await socket.waitForOpen();

  const recorder = new MediaRecorder(stream, { mimeType });
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      try {
        socket.sendMedia(event.data);
      } catch {
        // Socket closed mid-flight; stop() will clean up.
      }
    }
  };
  // ONE continuous socket consumes the timeslice chunks — safe here, unsafe
  // for the batch endpoint.
  recorder.start(STREAM_CHUNK_MS);

  const releaseMic = () => {
    for (const track of stream.getTracks()) {
      track.stop();
    }
  };

  return {
    stop: () =>
      new Promise<string>((resolve) => {
        recorder.onstop = () => {
          releaseMic();
          // Ask Deepgram to flush + finish, then give final Results a
          // moment to arrive before closing.
          try {
            socket.sendCloseStream({ type: "CloseStream" });
          } catch {
            // socket already closed
          }
          setTimeout(() => {
            socket.close();
            resolve(finalSegments.join(" ").trim());
          }, 1200);
        };
        try {
          recorder.stop();
        } catch {
          recorder.onstop?.(new Event("stop"));
        }
      }),
  };
}
