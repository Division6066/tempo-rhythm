"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { KeyRound, PlugZap } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import {
  buildByokProviderRequest,
  maskProviderKey,
  type ByokProvider,
} from "@/lib/byok";

const provider: ByokProvider = "mistral";
const defaultPrompt = "Please answer with one calm sentence.";

export default function Page() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const savedKey = useQuery(
    api.byok.getProviderKey,
    isAuthenticated ? { provider } : "skip"
  );
  const saveProviderKey = useMutation(api.byok.saveProviderKey);
  const [apiKey, setApiKey] = useState("");
  const [testPrompt, setTestPrompt] = useState(defaultPrompt);
  const [saveStatus, setSaveStatus] = useState("");
  const [testStatus, setTestStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (savedKey?.apiKey) {
      setApiKey(savedKey.apiKey);
    }
  }, [savedKey?.apiKey]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSaveStatus("");
    try {
      const saved = await saveProviderKey({ provider, apiKey });
      setApiKey(saved?.apiKey ?? apiKey.trim());
      setSaveStatus("Provider key saved to Convex.");
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : "We could not save that key yet.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMockedProviderCall() {
    const keyFromConvex = savedKey?.apiKey;
    if (!keyFromConvex) {
      setTestStatus("Save a provider key first, then send the test call.");
      return;
    }

    setIsTesting(true);
    setTestStatus("");
    try {
      const request = buildByokProviderRequest({
        apiKey: keyFromConvex,
        message: testPrompt.trim() || defaultPrompt,
        provider,
      });
      const response = await fetch(request.url, request.init);
      if (!response.ok) {
        throw new Error("The mocked provider did not accept the request.");
      }
      const json = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      setTestStatus(json.choices?.[0]?.message?.content ?? "Mock provider call completed.");
    } catch (error) {
      setTestStatus(
        error instanceof Error
          ? error.message
          : "We could not send the mocked provider call yet."
      );
    } finally {
      setIsTesting(false);
    }
  }

  if (isAuthLoading || (isAuthenticated && savedKey === undefined)) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="h-80 animate-pulse rounded-2xl bg-muted" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
        <Card>
          <CardHeader>
            <CardTitle>Sign in to manage provider keys</CardTitle>
            <CardDescription>
              Your keys are saved to your account so model calls can use the provider you choose.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/sign-in?next=/settings/integrations">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <PlugZap className="h-4 w-4" aria-hidden="true" />
          Settings / Integrations
        </div>
        <div>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            Provider keys
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Bring your own model key and keep Tempo connected to the provider
            you already trust. This saves the key to Convex for your account and
            uses it for the test request below.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" aria-hidden="true" />
            Mistral-compatible key
          </CardTitle>
          <CardDescription>
            Paste a test or production key from your provider. The field reloads
            from Convex after refresh so you can verify it persisted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="space-y-2">
              <Label htmlFor="mistral-api-key">Mistral-compatible API key</Label>
              <Input
                id="mistral-api-key"
                autoComplete="off"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Paste your provider key"
                type="password"
              />
              {savedKey ? (
                <p className="text-muted-foreground text-sm">
                  Saved key: {maskProviderKey(savedKey.apiKey)}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No provider key saved yet. Add one when you are ready.
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save provider key"}
              </Button>
              {saveStatus ? (
                <output className="text-sm">
                  {saveStatus}
                </output>
              ) : null}
            </div>
          </form>

          <div className="rounded-2xl border border-border bg-surface-sunken/60 p-4">
            <div className="space-y-2">
              <Label htmlFor="byok-test-prompt">Test prompt</Label>
              <Input
                id="byok-test-prompt"
                value={testPrompt}
                onChange={(event) => setTestPrompt(event.target.value)}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleMockedProviderCall}
                disabled={isTesting || !savedKey?.apiKey}
              >
                {isTesting ? "Sending..." : "Send mocked provider call"}
              </Button>
              {testStatus ? (
                <output className="text-sm">
                  {testStatus}
                </output>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
