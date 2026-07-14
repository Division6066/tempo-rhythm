"use client";

export type Ciphertext = {
  data: string;
  iv: string;
};

const keyUsages: KeyUsage[] = ["encrypt", "decrypt"];
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export function generateRandomBase64(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToBase64(bytes);
}

export function generateRecoveryCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const chunks: string[] = [];

  for (let chunkIndex = 0; chunkIndex < 4; chunkIndex += 1) {
    let chunk = "";
    for (let offset = 0; offset < 5; offset += 1) {
      const byte = bytes[chunkIndex * 5 + offset] ?? 0;
      chunk += alphabet[byte % alphabet.length];
    }
    chunks.push(chunk);
  }

  return `TEMPO-${chunks.join("-")}`;
}

export function generateTotpSecret(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  let secret = "";

  for (const byte of bytes) {
    secret += alphabet[byte % alphabet.length];
  }

  return secret.match(/.{1,4}/g)?.join(" ") ?? secret;
}

export async function hashText(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return bytesToBase64(new Uint8Array(digest));
}

export async function derivePassphraseKey(passphrase: string, saltBase64: string): Promise<CryptoKey> {
  const passphraseKey = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      hash: "SHA-256",
      iterations: 210_000,
      name: "PBKDF2",
      salt: toArrayBuffer(base64ToBytes(saltBase64)),
    },
    passphraseKey,
    { length: 256, name: "AES-GCM" },
    false,
    keyUsages,
  );
}

export async function generateMasterKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ length: 256, name: "AES-GCM" }, true, keyUsages);
}

export async function importMasterKey(rawKey: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, true, keyUsages);
}

export async function encryptBytes(key: CryptoKey, bytes: Uint8Array): Promise<Ciphertext> {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const encrypted = await crypto.subtle.encrypt(
    { iv: toArrayBuffer(iv), name: "AES-GCM" },
    key,
    toArrayBuffer(bytes),
  );

  return {
    data: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
  };
}

export async function decryptBytes(key: CryptoKey, ciphertext: Ciphertext): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt(
    { iv: toArrayBuffer(base64ToBytes(ciphertext.iv)), name: "AES-GCM" },
    key,
    toArrayBuffer(base64ToBytes(ciphertext.data)),
  );
}

export async function encryptText(key: CryptoKey, value: string): Promise<Ciphertext> {
  return encryptBytes(key, textEncoder.encode(value));
}

export async function decryptText(key: CryptoKey, ciphertext: Ciphertext): Promise<string> {
  const decrypted = await decryptBytes(key, ciphertext);
  return textDecoder.decode(decrypted);
}

export async function wrapMasterKey(masterKey: CryptoKey, passphraseKey: CryptoKey): Promise<Ciphertext> {
  const rawMasterKey = await crypto.subtle.exportKey("raw", masterKey);
  return encryptBytes(passphraseKey, new Uint8Array(rawMasterKey));
}
