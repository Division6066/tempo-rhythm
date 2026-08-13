/**
 * BYOK encryption at rest — AES-256-GCM via WebCrypto (`crypto.subtle`).
 *
 * Key hierarchy:
 *   BYOK_MASTER_KEY (env, 32 random bytes, base64)
 *     └─ HKDF-SHA256(salt = userId, info = "tempo-byok-v1")
 *          └─ per-user AES-256-GCM key
 *
 * IVs: 12 bytes from `crypto.getRandomValues` per encryption — NEVER
 * `Math.random()` (deterministically seeded in Convex queries/mutations).
 *
 * RUNTIME CAVEAT (why convex/spike_crypto.ts exists): Convex documents
 * `crypto`, `CryptoKey`, and `SubtleCrypto` as available in the default
 * runtime but never enumerates which algorithms SubtleCrypto supports.
 * These helpers must be confirmed on a REAL dev deployment via the spike
 * before this path is trusted in production. If AES-GCM/HKDF turn out to be
 * unsupported, the fallback is `node:crypto` `createCipheriv` inside a
 * single "use node" action (2× compute cost accepted for that operation).
 *
 * Pure module — no Convex imports — so the logic is unit-tested under bun.
 * SECURITY INVARIANT: never log or throw plaintext or key material.
 */

const HKDF_INFO = "tempo-byok-v1";
export const BYOK_KEY_VERSION = 1;
const IV_BYTES = 12;

export type EncryptedSecret = {
  ciphertextB64: string;
  ivB64: string;
  keyVersion: number;
};

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  return btoa(binary);
}

async function deriveUserKey(
  masterKeyB64: string,
  userId: string,
): Promise<CryptoKey> {
  const masterBytes = base64ToBytes(masterKeyB64);
  if (masterBytes.length < 32) {
    // Length only — never the value.
    throw new Error(
      "BYOK_MASTER_KEY must decode to at least 32 bytes of random data (base64-encoded).",
    );
  }
  const encoder = new TextEncoder();
  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    masterBytes as unknown as BufferSource,
    "HKDF",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: encoder.encode(userId),
      info: encoder.encode(HKDF_INFO),
    },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Encrypt a provider API key for storage. */
export async function encryptSecret(
  masterKeyB64: string,
  userId: string,
  plaintext: string,
): Promise<EncryptedSecret> {
  const key = await deriveUserKey(masterKeyB64, userId);
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    new TextEncoder().encode(plaintext),
  );
  return {
    ciphertextB64: bytesToBase64(new Uint8Array(ciphertext)),
    ivB64: bytesToBase64(iv),
    keyVersion: BYOK_KEY_VERSION,
  };
}

/** Decrypt a stored provider API key. Throws on tamper (GCM auth failure). */
export async function decryptSecret(
  masterKeyB64: string,
  userId: string,
  encrypted: Pick<EncryptedSecret, "ciphertextB64" | "ivB64">,
): Promise<string> {
  const key = await deriveUserKey(masterKeyB64, userId);
  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64ToBytes(encrypted.ivB64) as unknown as BufferSource,
    },
    key,
    base64ToBytes(encrypted.ciphertextB64) as unknown as BufferSource,
  );
  return new TextDecoder().decode(plaintext);
}
