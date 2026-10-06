"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { buildExecutorSetup } from "./executorSetup";

export const MCP_PENDING_COPY =
  "Your account is waiting for approval. You can create MCP tokens once it is approved.";
export const MCP_ONCE_COPY = "You won't see this again. Copy it now.";

function formatDate(ms: number | undefined): string {
  if (ms === undefined) return "never";
  return new Date(ms).toLocaleString();
}

export function McpTokensCard() {
  const { isAuthenticated } = useConvexAuth();
  const tokens = useQuery(api.mcp.listTokens, isAuthenticated ? {} : "skip");
  const createToken = useMutation(api.mcp.createToken);
  const revokeToken = useMutation(api.mcp.revokeToken);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [executorCopied, setExecutorCopied] = useState(false);
  const [showExecutorFallback, setShowExecutorFallback] = useState(false);

  const endpoint = typeof window === "undefined" ? "/api/mcp" : `${window.location.origin}/api/mcp`;
  const executorSetup = buildExecutorSetup(endpoint);
  const active = (tokens ?? []).filter((t) => t.revokedAt === undefined);

  const handleCreate = async () => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    setCopied(false);
    try {
      const result = await createToken({ name });
      setFresh(result.token);
      setName("");
    } catch (error) {
      const text = error instanceof Error ? error.message : "";
      if (text.includes("ACCOUNT_PENDING_APPROVAL")) {
        setPending(true);
      } else if (text.includes("active tokens")) {
        setMessage("You already have 10 active tokens. Revoke one first.");
      } else if (text.includes("name")) {
        setMessage("Give the token a name first.");
      } else {
        setMessage("We couldn't create that token. Try again in a moment.");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!fresh) return;
    try {
      await navigator.clipboard.writeText(fresh);
      setCopied(true);
    } catch {
      setMessage("Copy didn't work. Select the token and copy it by hand.");
    }
  };

  const handleRevoke = async (tokenId: (typeof active)[number]["_id"]) => {
    setMessage(null);
    try {
      await revokeToken({ tokenId });
    } catch {
      setMessage("We couldn't revoke that token. Try again in a moment.");
    }
  };

  const handleExecutorCopy = async () => {
    setExecutorCopied(false);
    if (!navigator.clipboard?.writeText) {
      setShowExecutorFallback(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(executorSetup);
      setExecutorCopied(true);
      setShowExecutorFallback(false);
    } catch {
      setShowExecutorFallback(true);
    }
  };

  return (
    <section
      aria-labelledby="mcp-heading"
      data-testid="mcp-tokens-card"
      className="rounded-2xl border border-border bg-card p-6 shadow-card"
    >
      <h2 id="mcp-heading" className="font-heading text-xl font-semibold text-foreground">
        Connect an AI assistant (MCP)
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Let an assistant such as Executor read and add your tasks, notes and calendar. Each token is
        personal and can be revoked at any time.
      </p>

      {pending ? (
        <output className="mt-4 block text-sm text-muted-foreground">{MCP_PENDING_COPY}</output>
      ) : (
        <>
          <form
            className="mt-4 flex flex-wrap items-end gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void handleCreate();
            }}
          >
            <label className="flex flex-col gap-1 text-sm text-foreground">
              Token name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                placeholder="Executor"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <Button type="submit" disabled={busy || !isAuthenticated}>
              Create token
            </Button>
          </form>

          {fresh ? (
            <output className="mt-4 block space-y-2 rounded-xl border border-border p-4">
              <p className="text-sm font-medium text-foreground">{MCP_ONCE_COPY}</p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  readOnly
                  aria-label="New MCP token"
                  data-testid="mcp-new-token"
                  value={fresh}
                  onFocus={(event) => event.currentTarget.select()}
                  className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
                />
                <Button type="button" variant="outline" onClick={() => void handleCopy()}>
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setFresh(null)}>
                  Done
                </Button>
              </div>
            </output>
          ) : null}
        </>
      )}

      {message ? (
        <p role="alert" className="mt-3 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}

      <div className="mt-6">
        <h3 className="text-sm font-medium text-foreground">Your tokens</h3>
        {active.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {tokens === undefined && isAuthenticated ? "Loading your tokens." : "No tokens yet."}
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {active.map((token) => (
              <li
                key={token._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{token.name}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-mono">{token.prefix}…</span> · created{" "}
                    {formatDate(token.createdAt)} · last used {formatDate(token.lastUsedAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleRevoke(token._id)}
                >
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 space-y-2 text-sm text-muted-foreground">
        <h3 className="font-medium text-foreground">Connect Executor</h3>
        <p>Copy a ready-to-paste MCP source setup, then replace the token placeholder.</p>
        <pre className="overflow-x-auto rounded-xl bg-muted p-3 font-mono text-xs text-foreground">
          {executorSetup}
        </pre>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={() => void handleExecutorCopy()}>
            {executorCopied ? "Copied" : "Copy Executor setup"}
          </Button>
          <a
            href="https://github.com/Levidavidspublic/tempo-rhythm/blob/integration/docs/ops/EXECUTOR.md"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Full guide
          </a>
        </div>
        {showExecutorFallback ? (
          <label className="block space-y-1">
            <span>Clipboard access is unavailable. Select and copy this setup:</span>
            <textarea
              readOnly
              aria-label="Executor setup"
              value={executorSetup}
              onFocus={(event) => event.currentTarget.select()}
              rows={4}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground"
            />
          </label>
        ) : null}
      </div>
    </section>
  );
}
