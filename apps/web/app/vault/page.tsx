"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CipherPayload = {
  ciphertext: string;
  iv: string;
  salt: string;
};

type StoredSecret = CipherPayload & {
  id: string;
  label: string;
};

type StoredVault = {
  secrets: StoredSecret[];
  verifier: CipherPayload;
  version: 1;
};

const vaultStorageKey = "agentwright:vault:v1";
const verifierPlaintext = "vault-unlocked";
const keyIterations = 120_000;

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
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

async function deriveVaultKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(new TextEncoder().encode(passphrase)),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      hash: "SHA-256",
      iterations: keyIterations,
      name: "PBKDF2",
      salt: toArrayBuffer(salt),
    },
    keyMaterial,
    { length: 256, name: "AES-GCM" },
    false,
    ["decrypt", "encrypt"]
  );
}

async function encryptWithPassphrase(passphrase: string, plaintext: string): Promise<CipherPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveVaultKey(passphrase, salt);
  const encrypted = await crypto.subtle.encrypt(
    { iv: toArrayBuffer(iv), name: "AES-GCM" },
    key,
    toArrayBuffer(new TextEncoder().encode(plaintext))
  );

  return {
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
    salt: bytesToBase64(salt),
  };
}

async function decryptWithPassphrase(passphrase: string, payload: CipherPayload): Promise<string> {
  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);
  const key = await deriveVaultKey(passphrase, salt);
  const decrypted = await crypto.subtle.decrypt(
    { iv: toArrayBuffer(iv), name: "AES-GCM" },
    key,
    toArrayBuffer(base64ToBytes(payload.ciphertext))
  );

  return new TextDecoder().decode(decrypted);
}

function readStoredVault(): StoredVault | null {
  const stored = window.localStorage.getItem(vaultStorageKey);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as StoredVault;
  } catch {
    window.localStorage.removeItem(vaultStorageKey);
    return null;
  }
}

function saveStoredVault(vault: StoredVault): void {
  window.localStorage.setItem(vaultStorageKey, JSON.stringify(vault));
}

export default function VaultPage() {
  const [vault, setVault] = useState<StoredVault | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [unlockedPassphrase, setUnlockedPassphrase] = useState<string | null>(null);
  const [createPassphrase, setCreatePassphrase] = useState("");
  const [unlockPassphrase, setUnlockPassphrase] = useState("");
  const [secretLabel, setSecretLabel] = useState("");
  const [secretValue, setSecretValue] = useState("");
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState("Vault locked");
  const [errorMessage, setErrorMessage] = useState("");

  const isUnlocked = unlockedPassphrase !== null;
  const sortedSecrets = useMemo(() => vault?.secrets ?? [], [vault]);

  useEffect(() => {
    setVault(readStoredVault());
    setIsLoaded(true);
  }, []);

  async function handleCreateVault(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const passphrase = createPassphrase.trim();
    if (!passphrase) {
      setErrorMessage("Add a passphrase before creating the vault.");
      return;
    }

    const nextVault: StoredVault = {
      secrets: [],
      verifier: await encryptWithPassphrase(passphrase, verifierPlaintext),
      version: 1,
    };

    saveStoredVault(nextVault);
    setVault(nextVault);
    setUnlockedPassphrase(passphrase);
    setCreatePassphrase("");
    setStatusMessage("Vault unlocked");
  }

  async function handleUnlockVault(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!vault) {
      setErrorMessage("Create a vault before unlocking it.");
      return;
    }

    try {
      const verifier = await decryptWithPassphrase(unlockPassphrase, vault.verifier);
      if (verifier !== verifierPlaintext) {
        throw new Error("Verifier mismatch");
      }
      setUnlockedPassphrase(unlockPassphrase);
      setUnlockPassphrase("");
      setStatusMessage("Vault unlocked");
    } catch {
      setErrorMessage("That passphrase did not unlock the vault.");
    }
  }

  async function handleAddSecret(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!vault || !unlockedPassphrase) {
      setErrorMessage("Unlock the vault before adding a secret.");
      return;
    }

    const label = secretLabel.trim();
    if (!label || !secretValue) {
      setErrorMessage("Add both a label and a value for this secret.");
      return;
    }

    const encryptedSecret = await encryptWithPassphrase(unlockedPassphrase, secretValue);
    const nextVault: StoredVault = {
      ...vault,
      secrets: [
        ...vault.secrets,
        {
          ...encryptedSecret,
          id: crypto.randomUUID(),
          label,
        },
      ],
    };

    saveStoredVault(nextVault);
    setVault(nextVault);
    setSecretLabel("");
    setSecretValue("");
    setStatusMessage("Secret added while plaintext stayed in this browser session.");
  }

  function handleLockVault() {
    setUnlockedPassphrase(null);
    setRevealedSecrets({});
    setStatusMessage("Vault locked");
    setErrorMessage("");
  }

  async function handleRevealSecret(secret: StoredSecret) {
    setErrorMessage("");

    if (!unlockedPassphrase) {
      setErrorMessage("Unlock the vault before revealing a secret.");
      return;
    }

    try {
      const plaintext = await decryptWithPassphrase(unlockedPassphrase, secret);
      setRevealedSecrets((current) => ({
        ...current,
        [secret.id]: plaintext,
      }));
    } catch {
      setErrorMessage("Could not reveal that secret. Lock and unlock the vault, then try again.");
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-muted-foreground text-sm uppercase tracking-[0.2em]">
            Local zero-knowledge vault
          </span>
          <h1 className="font-serif text-4xl">Create, unlock, and reveal safely.</h1>
          <p className="max-w-2xl text-muted-foreground">
            This vault demo keeps plaintext in browser memory only. Stored secrets are encrypted before
            they touch local storage.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>
              {isLoaded ? statusMessage : "Loading vault from this browser..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <span
              className="rounded-full border border-border bg-secondary px-3 py-1 font-medium text-sm"
              data-testid="vault-status"
            >
              {isUnlocked ? "Vault unlocked" : "Vault locked"}
            </span>
            {isUnlocked ? (
              <Button onClick={handleLockVault} type="button" variant="outline">
                Lock vault
              </Button>
            ) : null}
          </CardContent>
        </Card>

        {errorMessage ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-destructive">
            {errorMessage}
          </p>
        ) : null}

        {!vault ? (
          <Card>
            <CardHeader>
              <CardTitle>Create vault</CardTitle>
              <CardDescription>
                Pick a passphrase. It is used locally to encrypt a vault verifier.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4" onSubmit={handleCreateVault}>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="vault-passphrase">Vault passphrase</Label>
                  <Input
                    id="vault-passphrase"
                    minLength={8}
                    onChange={(event) => setCreatePassphrase(event.target.value)}
                    type="password"
                    value={createPassphrase}
                  />
                </div>
                <Button className="self-start" type="submit">
                  Create vault
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {vault && !isUnlocked ? (
          <Card>
            <CardHeader>
              <CardTitle>Unlock vault</CardTitle>
              <CardDescription>Use your passphrase to unlock this browser's encrypted vault.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4" onSubmit={handleUnlockVault}>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="unlock-passphrase">Unlock passphrase</Label>
                  <Input
                    id="unlock-passphrase"
                    onChange={(event) => setUnlockPassphrase(event.target.value)}
                    type="password"
                    value={unlockPassphrase}
                  />
                </div>
                <Button className="self-start" type="submit">
                  Unlock vault
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {vault && isUnlocked ? (
          <Card>
            <CardHeader>
              <CardTitle>Add secret</CardTitle>
              <CardDescription>The value is encrypted before it is saved to local storage.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleAddSecret}>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="secret-label">Secret label</Label>
                  <Input
                    id="secret-label"
                    onChange={(event) => setSecretLabel(event.target.value)}
                    value={secretLabel}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="secret-value">Secret value</Label>
                  <Input
                    id="secret-value"
                    onChange={(event) => setSecretValue(event.target.value)}
                    type="password"
                    value={secretValue}
                  />
                </div>
                <Button className="self-end" type="submit">
                  Add secret
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Secrets</CardTitle>
            <CardDescription>Reveal only what you need, when the vault is unlocked.</CardDescription>
          </CardHeader>
          <CardContent>
            {sortedSecrets.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {sortedSecrets.map((secret) => (
                  <li
                    className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 md:flex-row md:items-center md:justify-between"
                    key={secret.id}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{secret.label}</span>
                      {revealedSecrets[secret.id] ? (
                        <code className="rounded bg-secondary px-2 py-1 font-mono text-sm">
                          {revealedSecrets[secret.id]}
                        </code>
                      ) : (
                        <span className="text-muted-foreground text-sm">Encrypted at rest</span>
                      )}
                    </div>
                    <Button
                      disabled={!isUnlocked}
                      onClick={() => void handleRevealSecret(secret)}
                      type="button"
                      variant="outline"
                    >
                      Reveal {secret.label}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No secrets here yet. Add one when you're ready.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
