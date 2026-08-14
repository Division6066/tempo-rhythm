/**
 * AES-256-GCM spike — encrypt / decrypt arbitrary bytes (voice payloads).
 *
 * Uses Web Crypto so the same helpers run in bun tests and Convex V8.
 * IV is 96-bit (12 bytes). Tag is appended by SubtleCrypto (not stored separately).
 *
 * This is a transport spike only. No UI, no Convex table, no key-management
 * product yet. Do not persist raw keys next to ciphertext.
 */

const IV_BYTES = 12;
const KEY_BITS = 256;

function getSubtle(): SubtleCrypto {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.subtle) {
    throw new Error("Web Crypto SubtleCrypto is not available");
  }
  return cryptoApi.subtle;
}

export async function generateAesGcmKey(): Promise<CryptoKey> {
  return getSubtle().generateKey({ name: "AES-GCM", length: KEY_BITS }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export async function exportRawKey(key: CryptoKey): Promise<Uint8Array> {
  const raw = await getSubtle().exportKey("raw", key);
  return new Uint8Array(raw);
}

export async function importRawKey(raw: Uint8Array): Promise<CryptoKey> {
  return getSubtle().importKey("raw", raw, { name: "AES-GCM" }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export type AesGcmBox = {
  iv: Uint8Array;
  ciphertext: Uint8Array;
};

export async function encryptBytes(key: CryptoKey, plaintext: Uint8Array): Promise<AesGcmBox> {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipherBuf = await getSubtle().encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return { iv, ciphertext: new Uint8Array(cipherBuf) };
}

export async function decryptBytes(
  key: CryptoKey,
  box: AesGcmBox,
): Promise<Uint8Array> {
  const plainBuf = await getSubtle().decrypt(
    { name: "AES-GCM", iv: box.iv },
    key,
    box.ciphertext,
  );
  return new Uint8Array(plainBuf);
}

export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.byteLength; i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}
