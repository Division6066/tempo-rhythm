// TEMPORARY SPIKE — Task 3 gate. Delete after the result is recorded.
//
// Confirms that the REAL Convex default runtime supports the SubtleCrypto
// algorithms convex/lib/byok_crypto.ts relies on (HKDF-SHA256 derivation +
// AES-256-GCM encrypt/decrypt with a crypto.getRandomValues IV). Convex
// documents `crypto` / `CryptoKey` / `SubtleCrypto` as available but never
// enumerates supported algorithms, so this must be observed, not assumed.
//
// Run against DEV ONLY (never prod):
//   npx convex@1.43.0 run spike_crypto:roundtrip
//
// Expected on success: { ok: true, roundtrip: "match", ... }
// On failure: the thrown error names the unsupported operation — fall back
// to node:crypto createCipheriv in a single "use node" action.
//
// Uses only throwaway constants — no user data, no env secrets.
// Precedent for spike modules in convex/: ai_smoke.ts.

import { internalAction } from "./_generated/server";
import { decryptSecret, encryptSecret } from "./lib/byok_crypto";

export const roundtrip = internalAction({
  args: {},
  handler: async () => {
    // Throwaway 32-byte master key (base64 of "0123...UV" — NOT a secret).
    const throwawayMasterKeyB64 = btoa("0123456789ABCDEFGHIJKLMNOPQRSTUV");
    const fakeUserId = "spike-user-id";
    const plaintext = "spike-plaintext-value";

    const ivProbe = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await encryptSecret(
      throwawayMasterKeyB64,
      fakeUserId,
      plaintext,
    );
    const decrypted = await decryptSecret(
      throwawayMasterKeyB64,
      fakeUserId,
      encrypted,
    );

    return {
      ok: decrypted === plaintext,
      roundtrip: decrypted === plaintext ? "match" : "MISMATCH",
      ivBytes: ivProbe.length,
      keyVersion: encrypted.keyVersion,
      ciphertextLength: encrypted.ciphertextB64.length,
    };
  },
});
