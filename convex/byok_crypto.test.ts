/**
 * Unit tests for the BYOK crypto helpers under bun's WebCrypto.
 *
 * NOTE: passing here validates the LOGIC, not the Convex runtime — bun's
 * SubtleCrypto is not Convex's. convex/spike_crypto.ts run on a real dev
 * deployment is the gate for trusting AES-GCM/HKDF inside Convex itself.
 */

import { describe, expect, test } from "bun:test";
import {
  BYOK_KEY_VERSION,
  decryptSecret,
  encryptSecret,
} from "./lib/byok_crypto";

const MASTER_KEY_B64 = btoa("0123456789ABCDEFGHIJKLMNOPQRSTUV"); // 32 bytes
const USER_A = "users|aaaaaaaaaaaaaaaa";
const USER_B = "users|bbbbbbbbbbbbbbbb";
const PLAINTEXT = "dg-key-1234567890abcdef";

describe("encryptSecret / decryptSecret", () => {
  test("round-trips a secret for the same user", async () => {
    const encrypted = await encryptSecret(MASTER_KEY_B64, USER_A, PLAINTEXT);
    expect(encrypted.keyVersion).toBe(BYOK_KEY_VERSION);
    expect(encrypted.ciphertextB64).not.toContain(PLAINTEXT);
    const decrypted = await decryptSecret(MASTER_KEY_B64, USER_A, encrypted);
    expect(decrypted).toBe(PLAINTEXT);
  });

  test("fresh random IV per encryption (same input, different ciphertext)", async () => {
    const first = await encryptSecret(MASTER_KEY_B64, USER_A, PLAINTEXT);
    const second = await encryptSecret(MASTER_KEY_B64, USER_A, PLAINTEXT);
    expect(first.ivB64).not.toBe(second.ivB64);
    expect(first.ciphertextB64).not.toBe(second.ciphertextB64);
  });

  test("another user's derived key cannot decrypt (HKDF salt = userId)", async () => {
    const encrypted = await encryptSecret(MASTER_KEY_B64, USER_A, PLAINTEXT);
    await expect(
      decryptSecret(MASTER_KEY_B64, USER_B, encrypted),
    ).rejects.toThrow();
  });

  test("tampered ciphertext fails GCM authentication", async () => {
    const encrypted = await encryptSecret(MASTER_KEY_B64, USER_A, PLAINTEXT);
    const bytes = Uint8Array.from(atob(encrypted.ciphertextB64), (c) =>
      c.charCodeAt(0),
    );
    bytes[0] = (bytes[0] as number) ^ 0xff;
    const tampered = {
      ...encrypted,
      ciphertextB64: btoa(String.fromCharCode(...bytes)),
    };
    await expect(
      decryptSecret(MASTER_KEY_B64, USER_A, tampered),
    ).rejects.toThrow();
  });

  test("rejects a master key shorter than 32 bytes, naming length only", async () => {
    const shortKey = btoa("too-short");
    try {
      await encryptSecret(shortKey, USER_A, PLAINTEXT);
      throw new Error("expected encryptSecret to throw");
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain("32 bytes");
      expect(message).not.toContain("too-short");
    }
  });
});
