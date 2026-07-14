"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type Ciphertext,
  decryptBytes,
  decryptText,
  derivePassphraseKey,
  encryptText,
  generateMasterKey,
  generateRandomBase64,
  generateRecoveryCode,
  generateTotpSecret,
  hashText,
  importMasterKey,
  wrapMasterKey,
} from "./vault-crypto";

const storageKey = "tempo:vault:v1";
const warningCopy =
  "If you lose both your passphrase and recovery code, your vault is gone. We cannot recover it.";

type StoredSecret = {
  budget: number;
  createdAt: string;
  encryptedValue: Ciphertext;
  id: string;
  label: string;
};

type StoredVault = {
  createdAt: string;
  recoveryCodeHash: string;
  recoveryCodeViewed: boolean;
  salt: string;
  secrets: StoredSecret[];
  totpSecretHash: string;
  updatedAt: string;
  version: 1;
  wrappedMasterKey: Ciphertext;
};

type SetupCodes = {
  recoveryCode: string;
  totpSecret: string;
};

function loadVault(): StoredVault | null {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredVault;
    return parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

function saveVault(vault: StoredVault) {
  window.localStorage.setItem(storageKey, JSON.stringify(vault));
}

function makeSecretId(): string {
  return `secret-${crypto.randomUUID()}`;
}

export function VaultClient() {
  const masterKeyRef = useRef<CryptoKey | null>(null);
  const [vault, setVault] = useState<StoredVault | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [setupCodes, setSetupCodes] = useState<SetupCodes | null>(null);
  const [setupPassphrase, setSetupPassphrase] = useState("");
  const [setupConfirm, setSetupConfirm] = useState("");
  const [unlockPassphrase, setUnlockPassphrase] = useState("");
  const [secretLabel, setSecretLabel] = useState("");
  const [secretValue, setSecretValue] = useState("");
  const [budget, setBudget] = useState("0");
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, string>>({});
  const [setupError, setSetupError] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [secretError, setSecretError] = useState("");

  useEffect(() => {
    setVault(loadVault());
    setIsHydrated(true);
  }, []);

  async function handleCreateVault(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSetupError("");

    if (setupPassphrase.length < 12) {
      setSetupError("Use at least 12 characters for this passphrase.");
      return;
    }

    if (setupPassphrase !== setupConfirm) {
      setSetupError("The passphrases do not match yet.");
      return;
    }

    const salt = generateRandomBase64(16);
    const passphraseKey = await derivePassphraseKey(setupPassphrase, salt);
    const masterKey = await generateMasterKey();
    const recoveryCode = generateRecoveryCode();
    const totpSecret = generateTotpSecret();
    const now = new Date().toISOString();

    const nextVault: StoredVault = {
      createdAt: now,
      recoveryCodeHash: await hashText(recoveryCode),
      recoveryCodeViewed: false,
      salt,
      secrets: [],
      totpSecretHash: await hashText(totpSecret),
      updatedAt: now,
      version: 1,
      wrappedMasterKey: await wrapMasterKey(masterKey, passphraseKey),
    };

    saveVault(nextVault);
    masterKeyRef.current = masterKey;
    setVault(nextVault);
    setIsUnlocked(true);
    setSetupCodes({ recoveryCode, totpSecret });
    setSetupPassphrase("");
    setSetupConfirm("");
  }

  function handleCodesSaved() {
    if (!vault) {
      return;
    }

    const nextVault = {
      ...vault,
      recoveryCodeViewed: true,
      updatedAt: new Date().toISOString(),
    };

    saveVault(nextVault);
    setVault(nextVault);
    setSetupCodes(null);
  }

  async function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUnlockError("");

    if (!vault) {
      return;
    }

    try {
      const passphraseKey = await derivePassphraseKey(unlockPassphrase, vault.salt);
      const rawMasterKey = await decryptBytes(passphraseKey, vault.wrappedMasterKey);
      masterKeyRef.current = await importMasterKey(rawMasterKey);
      setIsUnlocked(true);
      setUnlockPassphrase("");
    } catch {
      masterKeyRef.current = null;
      setIsUnlocked(false);
      setRevealedSecrets({});
      setUnlockError("That passphrase did not unlock the vault.");
    }
  }

  function handleLock() {
    masterKeyRef.current = null;
    setIsUnlocked(false);
    setRevealedSecrets({});
    setUnlockError("");
  }

  async function handleAddSecret(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSecretError("");

    const masterKey = masterKeyRef.current;
    if (!(vault && masterKey)) {
      setSecretError("Unlock the vault before adding a secret.");
      return;
    }

    if (!secretLabel.trim()) {
      setSecretError("Add a label so you can recognize this key later.");
      return;
    }

    if (!secretValue.trim()) {
      setSecretError("Paste the API key before saving.");
      return;
    }

    const numericBudget = Number.parseFloat(budget);
    const nextSecret: StoredSecret = {
      budget: Number.isFinite(numericBudget) ? numericBudget : 0,
      createdAt: new Date().toISOString(),
      encryptedValue: await encryptText(masterKey, secretValue),
      id: makeSecretId(),
      label: secretLabel.trim(),
    };
    const nextVault = {
      ...vault,
      secrets: [...vault.secrets, nextSecret],
      updatedAt: new Date().toISOString(),
    };

    saveVault(nextVault);
    setVault(nextVault);
    setSecretLabel("");
    setSecretValue("");
    setBudget("0");
  }

  async function handleReveal(secret: StoredSecret) {
    const masterKey = masterKeyRef.current;
    if (!masterKey) {
      return;
    }

    const value = await decryptText(masterKey, secret.encryptedValue);
    setRevealedSecrets((current) => ({ ...current, [secret.id]: value }));
  }

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-background px-6 py-10 text-foreground">
        <div className="mx-auto max-w-5xl">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Loading vault</CardTitle>
              <CardDescription>Preparing the browser-only vault workspace.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="grid gap-5 rounded-2xl border border-border bg-card p-8 shadow-card lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-4">
            <p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
              Agentwright vault
            </p>
            <div className="space-y-3">
              <h1 className="font-serif text-4xl tracking-tight md:text-5xl">Browser-only API keys</h1>
              <p className="max-w-2xl text-muted-foreground">
                Create a vault, add an API key, and reveal it only after the master key is
                unlocked in this browser session.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-secondary p-5 text-sm">
            <p className="font-semibold">Zero-knowledge posture</p>
            <p className="mt-2 text-muted-foreground">{warningCopy}</p>
          </div>
        </header>

        {!vault ? (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Create your vault</CardTitle>
              <CardDescription>
                Your passphrase wraps a generated master key. The passphrase is never sent
                anywhere by this screen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-5 md:max-w-xl" onSubmit={handleCreateVault}>
                <div className="grid gap-2">
                  <Label htmlFor="vault-passphrase">Vault passphrase</Label>
                  <Input
                    autoComplete="new-password"
                    id="vault-passphrase"
                    minLength={12}
                    onChange={(event) => setSetupPassphrase(event.target.value)}
                    type="password"
                    value={setupPassphrase}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vault-confirm">Confirm passphrase</Label>
                  <Input
                    autoComplete="new-password"
                    id="vault-confirm"
                    minLength={12}
                    onChange={(event) => setSetupConfirm(event.target.value)}
                    type="password"
                    value={setupConfirm}
                  />
                </div>
                {setupError ? (
                  <p className="text-destructive text-sm" role="alert">
                    {setupError}
                  </p>
                ) : null}
                <Button className="w-fit" type="submit">
                  Create vault
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {setupCodes ? (
          <Card className="border-primary shadow-card">
            <CardHeader>
              <CardTitle>Save these once</CardTitle>
              <CardDescription>
                This is the only time the recovery code and authenticator enrollment seed
                are shown.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-secondary p-4">
                <p className="font-medium text-sm">Recovery code</p>
                <p className="mt-3 select-all font-mono text-lg" data-testid="recovery-code">
                  {setupCodes.recoveryCode}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-secondary p-4">
                <p className="font-medium text-sm">Authenticator enrollment</p>
                <p className="mt-3 select-all font-mono text-lg">{setupCodes.totpSecret}</p>
              </div>
              <Button className="w-fit md:col-span-2" onClick={handleCodesSaved} type="button">
                I've saved these codes
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {vault && !isUnlocked ? (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Vault locked</CardTitle>
              <CardDescription>Unlock with your passphrase to add or reveal API keys.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:max-w-xl" onSubmit={handleUnlock}>
                <div className="grid gap-2">
                  <Label htmlFor="unlock-passphrase">Passphrase</Label>
                  <Input
                    autoComplete="current-password"
                    id="unlock-passphrase"
                    onChange={(event) => setUnlockPassphrase(event.target.value)}
                    type="password"
                    value={unlockPassphrase}
                  />
                </div>
                {unlockError ? (
                  <p className="text-destructive text-sm" role="alert">
                    {unlockError}
                  </p>
                ) : null}
                <Button className="w-fit" type="submit">
                  Unlock vault
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {vault && isUnlocked ? (
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Add API key</CardTitle>
                <CardDescription>
                  Encryption happens before the key is saved in browser storage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4" onSubmit={handleAddSecret}>
                  <div className="grid gap-2">
                    <Label htmlFor="secret-label">Secret label</Label>
                    <Input
                      id="secret-label"
                      onChange={(event) => setSecretLabel(event.target.value)}
                      value={secretLabel}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="secret-value">API key</Label>
                    <Input
                      autoComplete="off"
                      id="secret-value"
                      onChange={(event) => setSecretValue(event.target.value)}
                      type="password"
                      value={secretValue}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="secret-budget">Monthly budget</Label>
                    <Input
                      id="secret-budget"
                      min="0"
                      onChange={(event) => setBudget(event.target.value)}
                      step="1"
                      type="number"
                      value={budget}
                    />
                  </div>
                  {secretError ? (
                    <p className="text-destructive text-sm" role="alert">
                      {secretError}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    <Button type="submit">Add secret</Button>
                    <Button onClick={handleLock} type="button" variant="outline">
                      Lock vault
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Vault secrets</CardTitle>
                <CardDescription>
                  {vault.secrets.length > 0
                    ? "Reveal a key only when you need it."
                    : "No secrets yet. Add one to see the encrypted list state."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {vault.secrets.map((secret) => (
                    <div
                      className="rounded-xl border border-border bg-secondary p-4"
                      key={secret.id}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-semibold">{secret.label}</p>
                          <p className="text-muted-foreground text-sm">
                            Monthly budget: ${secret.budget.toFixed(0)}
                          </p>
                        </div>
                        <Button
                          onClick={() => void handleReveal(secret)}
                          type="button"
                          variant="outline"
                        >
                          Reveal {secret.label}
                        </Button>
                      </div>
                      {revealedSecrets[secret.id] ? (
                        <p className="mt-4 rounded-md bg-background p-3 font-mono text-sm">
                          {revealedSecrets[secret.id]}
                        </p>
                      ) : (
                        <p className="mt-4 text-muted-foreground text-sm">Encrypted at rest.</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </main>
  );
}
