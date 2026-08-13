/**
 * Browser audio capture for walkie-talkie (batch) voice notes.
 *
 * FORMAT TRAPS (verified against Deepgram docs + MediaRecorder behavior):
 * - MediaRecorder `timeslice` chunks are NOT independently decodable — only
 *   the first chunk carries the container header. Batch recordings therefore
 *   produce ONE complete Blob per session (no timeslice), never individual
 *   chunks sent to the pre-recorded endpoint.
 * - Safari emits MP4/AAC, not WebM — hence the isTypeSupported fallback
 *   chain below. Every entry is a Deepgram-supported containerized format.
 * - `getUserMedia` requires a secure context: in insecure contexts
 *   `navigator.mediaDevices` is `undefined`.
 */

/** Fallback chain — all Deepgram-supported containerized formats. */
export const MIME_TYPE_FALLBACK_CHAIN = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
] as const;

/**
 * Pick the first MIME type the current browser can record. Pure — the
 * predicate is injected so this is unit-testable without a DOM.
 */
export function pickSupportedMimeType(
  isTypeSupported: (mimeType: string) => boolean,
): string | undefined {
  return MIME_TYPE_FALLBACK_CHAIN.find((mimeType) => {
    try {
      return isTypeSupported(mimeType);
    } catch {
      return false;
    }
  });
}

/** True when mic capture is possible (secure context + API present). */
export function canRecordHere(): boolean {
  return (
    typeof navigator !== "undefined" &&
    navigator.mediaDevices !== undefined &&
    typeof MediaRecorder !== "undefined"
  );
}

export type BatchRecording = {
  /** Stop and resolve ONE complete containerized Blob for the session. */
  stop: () => Promise<Blob>;
  /** Abort without producing a blob (releases the mic). */
  cancel: () => void;
  mimeType: string;
};

/**
 * Start recording a walkie-talkie note. Resolves once the mic is live.
 * The whole session becomes a single Blob — never send timeslice chunks to
 * the pre-recorded endpoint.
 */
export async function startBatchRecording(): Promise<BatchRecording> {
  if (!canRecordHere()) {
    throw new Error(
      "Recording needs a secure (https) page and microphone access. Nothing is wrong with your device.",
    );
  }
  const mimeType = pickSupportedMimeType((t) => MediaRecorder.isTypeSupported(t));
  if (!mimeType) {
    throw new Error("This browser doesn't offer a recordable audio format.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const releaseMic = () => {
    for (const track of stream.getTracks()) {
      track.stop();
    }
  };

  // No timeslice argument: dataavailable fires once, at stop(), with a
  // complete container (header included).
  recorder.start();

  return {
    mimeType,
    stop: () =>
      new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          releaseMic();
          resolve(new Blob(chunks, { type: mimeType }));
        };
        recorder.onerror = () => {
          releaseMic();
          reject(new Error("Recording stopped unexpectedly."));
        };
        recorder.stop();
      }),
    cancel: () => {
      recorder.onstop = null;
      try {
        recorder.stop();
      } catch {
        // already inactive
      }
      releaseMic();
    },
  };
}

/**
 * Upload one complete recording Blob to a Convex storage upload URL.
 * Returns the storage id. (Upload POSTs have a 2-minute server-side window —
 * long recordings on slow links may need chunked upload later.)
 */
export async function uploadRecordingBlob(
  uploadUrl: string,
  blob: Blob,
): Promise<string> {
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": blob.type },
    body: blob,
  });
  if (!response.ok) {
    throw new Error("The upload didn't go through. Try again in a moment?");
  }
  const json = (await response.json()) as { storageId?: string };
  if (typeof json.storageId !== "string") {
    throw new Error("The upload finished but no file id came back.");
  }
  return json.storageId;
}
