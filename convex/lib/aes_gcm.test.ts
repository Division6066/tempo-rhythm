import { describe, expect, test } from "bun:test";
import {
  bytesEqual,
  decryptBytes,
  encryptBytes,
  exportRawKey,
  generateAesGcmKey,
  importRawKey,
} from "./aes_gcm";

describe("AES-256-GCM spike", () => {
  test("round-trips a small audio-like payload", async () => {
    const key = await generateAesGcmKey();
    const plaintext = new Uint8Array(2048);
    for (let i = 0; i < plaintext.length; i++) {
      plaintext[i] = i % 256;
    }

    const box = await encryptBytes(key, plaintext);
    expect(box.iv.byteLength).toBe(12);
    expect(box.ciphertext.byteLength).toBeGreaterThan(plaintext.byteLength);
    expect(bytesEqual(box.ciphertext, plaintext)).toBe(false);

    const recovered = await decryptBytes(key, box);
    expect(bytesEqual(recovered, plaintext)).toBe(true);
  });

  test("exported raw key can decrypt on a fresh import", async () => {
    const key = await generateAesGcmKey();
    const raw = await exportRawKey(key);
    expect(raw.byteLength).toBe(32);

    const plaintext = new TextEncoder().encode("walkie-talkie spike");
    const box = await encryptBytes(key, plaintext);
    const imported = await importRawKey(raw);
    const recovered = await decryptBytes(imported, box);
    expect(new TextDecoder().decode(recovered)).toBe("walkie-talkie spike");
  });

  test("wrong key fails closed", async () => {
    const keyA = await generateAesGcmKey();
    const keyB = await generateAesGcmKey();
    const box = await encryptBytes(keyA, new TextEncoder().encode("secret"));
    await expect(decryptBytes(keyB, box)).rejects.toThrow();
  });
});
