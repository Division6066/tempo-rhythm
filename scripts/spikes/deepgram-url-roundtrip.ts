/**
 * TASK 1 SPIKE — validate the signed-URL round trip. THROWAWAY SCRIPT.
 *
 * Tests the ONE inference in the voice architecture: that Deepgram's fetcher
 * can retrieve audio from a public Convex storage signed URL handed over as
 * `{"url": ...}` (documented at developers.deepgram.com/reference/pre-recorded).
 * The URL is public and needs no auth header, so this should work — but it
 * was reasoned, not documented. If it fails, STOP: the fallback is streaming
 * bytes with --data-binary, which reintroduces the 64 MB action-memory limit
 * and changes the design.
 *
 * HOW TO RUN (no deploy needed):
 *   1. Convex dashboard → DEV deployment (ceaseless-dog-617) → Files →
 *      upload a small audio file (a 5–10 s .m4a/.webm/.mp3) → copy its URL.
 *      (Dashboard steps are human-amit/twin work per HARD_RULES §14.)
 *   2. With DEEPGRAM_API_KEY present in the environment (e.g. exported from
 *      your local shell — NEVER pasted into chat or committed):
 *        bun scripts/spikes/deepgram-url-roundtrip.ts "<convex-file-url>"
 *
 * Expected on success: HTTP 200 + a transcript excerpt printed.
 * This script never prints the API key — presence only.
 */

const SENTINEL = "__DUMMY_PASTE_ME__";

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(2);
}

const fileUrl = process.argv[2];
if (!fileUrl || !fileUrl.startsWith("https://")) {
  fail(
    "Usage: bun scripts/spikes/deepgram-url-roundtrip.ts <convex-storage-file-url>\n" +
      "  Get the URL from the Convex dashboard → dev deployment → Files.",
  );
}

const apiKeyRaw = process.env.DEEPGRAM_API_KEY ?? "";
const apiKey = apiKeyRaw.trim();
if (apiKey === "" || apiKey === SENTINEL) {
  fail(
    "DEEPGRAM_API_KEY is not set in this shell (missing, empty, or placeholder).\n" +
      "  Get a key from console.deepgram.com → API Keys and export it locally.\n" +
      "  Never paste the value into chat, a file, or a commit.",
  );
}
console.log("• DEEPGRAM_API_KEY: present (value not shown)");
console.log(`• Audio URL host: ${new URL(fileUrl).host}`);

const params = new URLSearchParams({
  model: "nova-3",
  smart_format: "true",
  punctuate: "true",
});

console.log("• POSTing {\"url\": ...} to api.deepgram.com/v1/listen (sync, no callback)…");
const response = await fetch(`https://api.deepgram.com/v1/listen?${params}`, {
  method: "POST",
  headers: {
    Authorization: `Token ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ url: fileUrl }),
});

if (!response.ok) {
  const body = await response.text().catch(() => "");
  console.error(`✗ Deepgram returned HTTP ${response.status}`);
  console.error(`  Body (truncated): ${body.slice(0, 300)}`);
  console.error(
    "  If the error says the audio could not be fetched, the signed-URL " +
      "assumption FAILED — stop and report; the fallback design (--data-binary) " +
      "changes the architecture.",
  );
  process.exit(1);
}

type SyncResponse = {
  metadata?: { request_id?: string; duration?: number };
  results?: {
    channels?: Array<{ alternatives?: Array<{ transcript?: string }> }>;
  };
};
const json = (await response.json()) as SyncResponse;
const transcript = json.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

console.log("✓ Deepgram fetched the Convex signed URL and transcribed it.");
console.log(`  request_id: ${json.metadata?.request_id ?? "(none)"}`);
console.log(`  duration:   ${json.metadata?.duration ?? "?"} s`);
console.log(`  transcript: ${transcript.slice(0, 200) || "(empty — silent audio?)"}`);
console.log("\nTask 1 result: SIGNED-URL ROUND TRIP CONFIRMED.");
