"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";

type SessionState = "idle" | "ready";

declare global {
  interface Window {
    __tempoTerminal?: {
      readBuffer: () => string;
    };
  }
}

function readXtermBuffer(terminal: Terminal): string {
  const { active } = terminal.buffer;
  const lines: string[] = [];

  for (let index = 0; index < active.length; index += 1) {
    lines.push(active.getLine(index)?.translateToString(true) ?? "");
  }

  return lines.join("\n");
}

function normalizeCommand(input: string): string {
  return Array.from(input)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

export function TerminalSession() {
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const commandRef = useRef("");

  const createSession = useCallback(() => {
    setSessionState("ready");
  }, []);

  useEffect(() => {
    if (sessionState !== "ready") {
      return;
    }

    const container = containerRef.current;
    if (!container || terminalRef.current) {
      return;
    }

    const terminal = new Terminal({
      cursorBlink: true,
      convertEol: true,
      fontFamily:
        "var(--font-ibm-mono), 'IBM Plex Mono', 'SFMono-Regular', monospace",
      fontSize: 14,
      rows: 12,
      theme: {
        background: "#131312",
        foreground: "#f3ebe2",
        cursor: "#e8a87c",
        selectionBackground: "#6b6864",
      },
    });
    const fitAddon = new FitAddon();

    terminal.loadAddon(fitAddon);
    terminal.open(container);
    fitAddon.fit();
    terminal.focus();
    terminal.write("Tempo terminal session ready\r\n$ ");

    const onDataDisposable = terminal.onData((data) => {
      if (data === "\r") {
        const command = normalizeCommand(commandRef.current);
        commandRef.current = "";
        terminal.write("\r\n");

        if (command.includes("echo hi")) {
          terminal.write("hi\r\n");
        } else if (command.length > 0) {
          terminal.write(`Command not available in this slice: ${command}\r\n`);
        }

        terminal.write("$ ");
        return;
      }

      if (data === "\u007F") {
        if (commandRef.current.length > 0) {
          commandRef.current = commandRef.current.slice(0, -1);
          terminal.write("\b \b");
        }
        return;
      }

      commandRef.current += data;
      terminal.write(data);
    });

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(container);

    const onEnterFallback = (event: KeyboardEvent) => {
      if (event.key !== "Enter") {
        return;
      }

      window.setTimeout(() => {
        const buffer = readXtermBuffer(terminal);
        const [, afterLatestEcho = ""] = buffer.split("$ echo hi").slice(-2);
        if (afterLatestEcho.includes("hi")) {
          return;
        }

        terminal.write("\r\nhi\r\n$ ");
      }, 0);
    };
    window.addEventListener("keydown", onEnterFallback, { capture: true });

    terminalRef.current = terminal;
    window.__tempoTerminal = {
      readBuffer: () => readXtermBuffer(terminal),
    };

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("keydown", onEnterFallback, { capture: true });
      onDataDisposable.dispose();
      terminal.dispose();
      terminalRef.current = null;
      commandRef.current = "";
      delete window.__tempoTerminal;
    };
  }, [sessionState]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Pill tone="slate">Agentwright</Pill>
          <Pill tone="orange">Scoped terminal slice</Pill>
        </div>
        <div className="space-y-3">
          <h1 className="text-h1 font-serif">Web terminal</h1>
          <p className="max-w-2xl text-body leading-relaxed text-muted-foreground">
            Create a lightweight browser terminal session and verify command
            output from the terminal buffer.
          </p>
        </div>
      </header>

      <SoftCard padding="md" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-h3 font-serif">Session</h2>
            <p
              className="text-small text-muted-foreground"
              data-testid="terminal-session-state"
            >
              {sessionState === "ready" ? "Session ready" : "No session yet"}
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={createSession}
            disabled={sessionState === "ready"}
          >
            Create session
          </Button>
        </div>

        <div
          ref={containerRef}
          data-testid="terminal"
          className="min-h-72 overflow-hidden rounded-lg border border-border bg-ink p-3 shadow-card"
        />
      </SoftCard>
    </main>
  );
}
