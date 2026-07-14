"use client";

import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type SkillManifest = {
  id: string;
  name: string;
  summary: string;
  author: string;
  tags: string[];
};

type ScanVerdict = "allow" | "warn" | "block";

type SkillScan = {
  skillId: string;
  verdict: ScanVerdict;
  summary: string;
  findings: string[];
};

type DaemonResponse<T> = {
  id: number;
  result?: T;
  error?: string;
};

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

const daemonUrl = process.env.NEXT_PUBLIC_AGENTWRIGHT_DAEMON_WS ?? "ws://127.0.0.1:3210";

const verdictCopy: Record<
  ScanVerdict,
  { label: string; tone: "moss" | "amber" | "brick"; action: string }
> = {
  allow: {
    label: "Allowed",
    tone: "moss",
    action: "Install",
  },
  warn: {
    label: "Needs review",
    tone: "amber",
    action: "Review & install",
  },
  block: {
    label: "Blocked",
    tone: "brick",
    action: "Unavailable",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item): item is string => typeof item === "string");
}

function isSkillList(value: unknown): value is SkillManifest[] {
  return (
    Array.isArray(value) &&
    value.every(
      (skill): skill is SkillManifest =>
        isRecord(skill) &&
        typeof skill.id === "string" &&
        typeof skill.name === "string" &&
        typeof skill.summary === "string" &&
        typeof skill.author === "string" &&
        isStringArray(skill.tags)
    )
  );
}

function isScanList(value: unknown): value is SkillScan[] {
  return (
    Array.isArray(value) &&
    value.every(
      (scan): scan is SkillScan =>
        isRecord(scan) &&
        typeof scan.skillId === "string" &&
        (scan.verdict === "allow" || scan.verdict === "warn" || scan.verdict === "block") &&
        typeof scan.summary === "string" &&
        isStringArray(scan.findings)
    )
  );
}

export function SkillLibrary() {
  const [skills, setSkills] = useState<SkillManifest[]>([]);
  const [scans, setScans] = useState<Record<string, SkillScan>>({});
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"connecting" | "ready" | "error">("connecting");
  const [message, setMessage] = useState<string | null>(null);
  const [reviewSkillId, setReviewSkillId] = useState<string | null>(null);
  const [installedSkillIds, setInstalledSkillIds] = useState<Set<string>>(() => new Set());

  const socketRef = useRef<WebSocket | null>(null);
  const requestIdRef = useRef(0);
  const pendingRef = useRef(new Map<number, PendingRequest>());

  const requestDaemon = useCallback(
    async <T,>(method: string, params: Record<string, unknown> = {}) => {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        throw new Error("Skill daemon is not connected");
      }

      const id = requestIdRef.current + 1;
      requestIdRef.current = id;

      const response = new Promise<T>((resolve, reject) => {
        pendingRef.current.set(id, {
          resolve: (value) => resolve(value as T),
          reject,
        });
      });

      socket.send(JSON.stringify({ id, method, params }));
      return await response;
    },
    []
  );

  const loadLibrary = useCallback(async () => {
    const [nextSkills, nextScans] = await Promise.all([
      requestDaemon<unknown>("skills.list"),
      requestDaemon<unknown>("skillScans"),
    ]);

    if (!isSkillList(nextSkills) || !isScanList(nextScans)) {
      throw new Error("Skill daemon returned an unexpected library shape");
    }

    setSkills(nextSkills);
    setScans(Object.fromEntries(nextScans.map((scan) => [scan.skillId, scan])));
  }, [requestDaemon]);

  useEffect(() => {
    const socket = new WebSocket(daemonUrl);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setStatus("ready");
      void loadLibrary().catch(() => setStatus("error"));
    });

    socket.addEventListener("message", (event) => {
      const parsed = JSON.parse(String(event.data)) as DaemonResponse<unknown>;
      const pending = pendingRef.current.get(parsed.id);
      if (!pending) return;

      pendingRef.current.delete(parsed.id);
      if (parsed.error) {
        pending.reject(new Error(parsed.error));
        return;
      }

      pending.resolve(parsed.result);
    });

    socket.addEventListener("error", () => setStatus("error"));
    socket.addEventListener("close", () => {
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    });

    return () => {
      pendingRef.current.forEach((pending) => {
        pending.reject(new Error("Skill daemon connection closed"));
      });
      pendingRef.current.clear();
      socket.close();
    };
  }, [loadLibrary]);

  useEffect(() => {
    if (status !== "ready") return;

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      void requestDaemon<unknown>("skills.list")
        .then((nextSkills) => {
          if (isSkillList(nextSkills)) setSkills(nextSkills);
        })
        .catch(() => setStatus("error"));
      return;
    }

    void requestDaemon<unknown>("skills.search", { query: trimmedQuery })
      .then((nextSkills) => {
        if (isSkillList(nextSkills)) setSkills(nextSkills);
      })
      .catch(() => setStatus("error"));
  }, [query, requestDaemon, status]);

  const reviewSkill = useMemo(
    () => skills.find((skill) => skill.id === reviewSkillId) ?? null,
    [reviewSkillId, skills]
  );
  const reviewScan = reviewSkill ? scans[reviewSkill.id] : undefined;

  const installSkill = useCallback(
    async (skill: SkillManifest) => {
      await requestDaemon("skill_install", { skillId: skill.id });
      setInstalledSkillIds((current) => {
        const next = new Set(current);
        next.add(skill.id);
        return next;
      });
      setMessage(`${skill.name} installed.`);
      setReviewSkillId(null);
    },
    [requestDaemon]
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-[var(--container-tempo)] flex-col gap-8 px-6 py-10">
        <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="orange">Agentwright</Pill>
              <Pill tone="slate">Web app skills</Pill>
            </div>
            <div className="space-y-3">
              <h1 className="text-h1 font-serif leading-tight">Skill library</h1>
              <p className="max-w-2xl text-body leading-relaxed text-muted-foreground">
                Browse installable skills with scan verdicts before anything reaches your local
                daemon. Warned skills pause for a consent check; blocked skills stay unavailable.
              </p>
            </div>
          </div>

          <SoftCard tone="sunken" padding="md">
            <p className="font-eyebrow">Daemon status</p>
            <p className="mt-2 text-small text-muted-foreground">
              {status === "ready"
                ? "Connected to the Agentwright daemon."
                : status === "connecting"
                  ? "Connecting to the Agentwright daemon..."
                  : "We could not reach the skill daemon. Check that it is running, then refresh."}
            </p>
          </SoftCard>
        </header>

        <section aria-label="Skill search and install status" className="grid gap-4">
          <label className="grid gap-2 text-small font-medium" htmlFor="skill-search">
            Search skills
            <Input
              id="skill-search"
              aria-label="Search skills"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, tag, author, or purpose"
            />
          </label>

          {message ? (
            <SoftCard padding="sm" className="border-[color:var(--color-moss)]">
              <p className="text-small text-[color:var(--color-moss)]">{message}</p>
            </SoftCard>
          ) : null}
        </section>

        <section
          aria-label="Skill results"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          data-testid="skill-grid"
        >
          {skills.map((skill) => {
            const scan = scans[skill.id] ?? {
              skillId: skill.id,
              verdict: "warn" as const,
              summary: "Scan pending. Review before installing.",
              findings: ["Scan result has not arrived yet."],
            };
            const isInstalled = installedSkillIds.has(skill.id);
            const copy = isInstalled
              ? {
                  label: "Installed",
                  tone: "slate" as const,
                  action: "Done",
                }
              : verdictCopy[scan.verdict];
            const actionLabel =
              isInstalled
                ? `${skill.name} installed`
                : scan.verdict === "block"
                  ? `${skill.name} blocked`
                  : `${copy.action} ${skill.name}`;

            return (
              <SoftCard
                as="article"
                className="flex min-h-[280px] flex-col gap-4"
                data-testid="skill-card"
                key={skill.id}
                padding="md"
              >
                <div className="flex h-full flex-col gap-4" data-testid={`skill-card-${skill.id}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h2 className="text-h3 font-serif">{skill.name}</h2>
                      <p className="text-caption text-muted-foreground">by {skill.author}</p>
                    </div>
                    <Pill tone={copy.tone}>{copy.label}</Pill>
                  </div>

                  <p className="text-small leading-relaxed text-muted-foreground">
                    {skill.summary}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {skill.tags.map((tag) => (
                      <span
                        className="rounded-full bg-surface-sunken px-2.5 py-1 text-caption text-muted-foreground"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto space-y-3">
                    <p className="text-small leading-relaxed">{scan.summary}</p>
                    <Button
                      aria-label={actionLabel}
                      disabled={isInstalled || scan.verdict === "block"}
                      onClick={() => {
                        if (isInstalled) return;
                        if (scan.verdict === "warn") {
                          setReviewSkillId(skill.id);
                          return;
                        }
                        void installSkill(skill);
                      }}
                      size="sm"
                      variant={
                        isInstalled || scan.verdict === "block" ? "subtle" : "primary"
                      }
                    >
                      {copy.action}
                    </Button>
                  </div>
                </div>
              </SoftCard>
            );
          })}
        </section>
      </section>

      <Dialog
        open={reviewSkill !== null}
        onOpenChange={(open) => {
          if (!open) setReviewSkillId(null);
        }}
      >
        <DialogContent>
          {reviewSkill && reviewScan ? (
            <>
              <DialogHeader>
                <DialogTitle>Review {reviewSkill.name}</DialogTitle>
                <DialogDescription>{reviewScan.summary}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <p className="text-small font-medium">Findings to review before install</p>
                <ul className="list-disc space-y-2 pl-5 text-small text-muted-foreground">
                  {reviewScan.findings.map((finding) => (
                    <li key={finding}>{finding}</li>
                  ))}
                </ul>
              </div>

              <DialogFooter>
                <Button onClick={() => setReviewSkillId(null)} size="sm" variant="ghost">
                  Cancel
                </Button>
                <Button onClick={() => void installSkill(reviewSkill)} size="sm">
                  Confirm install
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}
