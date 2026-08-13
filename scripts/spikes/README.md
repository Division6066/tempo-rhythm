# Spikes — throwaway validation scripts

Delete each file here once its result is recorded in the task/PR write-up.
Nothing in this directory is product code.

Both spikes need credentials or a dev deployment that the cloud agent
environment does not have; they are ready to run and blocked on that. Rules
honored: no `convex dev` / `codegen` / `deploy` was run by the agent; nothing
touches prod (`precious-wildcat-890`).

## 1. `deepgram-url-roundtrip.ts` — Task 1 (signed-URL round trip)

Validates that Deepgram's fetcher can pull audio from a public Convex
storage signed URL (`{"url": ...}` body form). See the header comment for
exact steps. Summary:

1. Upload a small audio file via the Convex dashboard → **dev**
   (`ceaseless-dog-617`) → Files, copy the file URL (dashboard clicks are
   human/twin work).
2. `DEEPGRAM_API_KEY` exported in your local shell (never in chat/commits):

   ```sh
   bun scripts/spikes/deepgram-url-roundtrip.ts "<convex-file-url>"
   ```

Success ⇒ the architecture stands. Failure to fetch ⇒ STOP; the fallback
(`--data-binary` byte streaming) reintroduces the 64 MB action-memory wall
and must be decided explicitly.

## 2. `convex/spike_crypto.ts` — Task 3 gate (SubtleCrypto in Convex)

Convex documents `crypto`/`SubtleCrypto` as available but never enumerates
algorithms; AES-256-GCM + HKDF must be observed on a real deployment before
the BYOK encryption path is trusted. After the next `convex dev` push to
**dev only**:

```sh
npx convex@1.43.0 run spike_crypto:roundtrip
```

Expected: `{ ok: true, roundtrip: "match", ... }`. On failure, fall back to
`node:crypto` `createCipheriv` in a single `"use node"` action (accepted 2×
compute for that operation) — see `convex/lib/byok_crypto.ts` header.

Delete `convex/spike_crypto.ts` after recording the result.
