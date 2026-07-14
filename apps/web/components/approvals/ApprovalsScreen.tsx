"use client";

import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DecisionStatus = "pending" | "approved" | "rejected";

type PendingApproval = {
  _id?: string;
  id?: string;
  actionSummary?: string;
  summary?: string;
  action?: string;
  estimatedCostUsd?: number;
  costUsd?: number;
  cost?: number;
  breachedPolicyName?: string;
  policyName?: string;
  policy?: {
    name?: string;
  };
  status?: DecisionStatus;
};

type ApprovalRow = Required<Pick<PendingApproval, "id">> & {
  actionSummary: string;
  costUsd: number;
  breachedPolicyName: string;
  status: DecisionStatus;
};

declare global {
  interface Window {
    __approvalsE2e?: {
      getRowStatus: (id: string) => string | null;
    };
  }
}

type DecideArgs = {
  approvalId: string;
  decision: "approved" | "rejected";
};

const pendingApprovalsRef = makeFunctionReference<
  "query",
  Record<string, never>,
  PendingApproval[]
>("approvals:pending");

const decideApprovalRef = makeFunctionReference<"mutation", DecideArgs, { status: DecisionStatus }>(
  "approvals:decide"
);

const fixtureRows: ApprovalRow[] = [
  {
    id: "approval_fixture",
    actionSummary: "Run connector sync",
    costUsd: 0.18,
    breachedPolicyName: "Spend ceiling",
    status: "pending",
  },
];

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fixtureEnabled = process.env.NEXT_PUBLIC_APPROVALS_E2E_FIXTURE === "1";

function getApprovalId(approval: PendingApproval): string {
  return approval.id ?? approval._id ?? "approval";
}

function normalizeApproval(approval: PendingApproval): ApprovalRow {
  return {
    id: getApprovalId(approval),
    actionSummary: approval.actionSummary ?? approval.summary ?? approval.action ?? "Review action",
    costUsd: approval.estimatedCostUsd ?? approval.costUsd ?? approval.cost ?? 0,
    breachedPolicyName:
      approval.breachedPolicyName ??
      approval.policyName ??
      approval.policy?.name ??
      "Policy guardrail",
    status: approval.status ?? "pending",
  };
}

function useApprovalsQueue() {
  const [fixtureState, setFixtureState] = useState<ApprovalRow[]>(fixtureRows);
  const pendingFromConvex = useQuery(pendingApprovalsRef, fixtureEnabled ? "skip" : {});
  const decideInConvex = useMutation(decideApprovalRef);

  useEffect(() => {
    if (!fixtureEnabled) {
      return;
    }

    window.__approvalsE2e = {
      getRowStatus(id: string) {
        return fixtureState.find((row) => row.id === id)?.status ?? null;
      },
    };

    return () => {
      delete window.__approvalsE2e;
    };
  }, [fixtureState]);

  const approvals = fixtureEnabled
    ? fixtureState.filter((row) => row.status === "pending")
    : pendingFromConvex?.map(normalizeApproval);

  async function approve(approvalId: string) {
    if (fixtureEnabled) {
      setFixtureState((current) =>
        current.map((row) => (row.id === approvalId ? { ...row, status: "approved" } : row))
      );
      return;
    }

    await decideInConvex({ approvalId, decision: "approved" });
  }

  return {
    approvals,
    approve,
    isLoading: !fixtureEnabled && approvals === undefined,
  };
}

function EmptyApprovalsState() {
  return (
    <section
      aria-label="No pending approvals"
      className="rounded-3xl border border-dashed border-border bg-card/70 p-10 text-center shadow-sm"
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 aria-hidden="true" className="size-6" />
      </div>
      <h2 className="mt-5 font-serif text-3xl text-foreground">Nothing needs you.</h2>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground text-sm leading-6">
        The queue is clear. Anything that needs a human decision will wait here with its cost and
        guardrail before it resumes.
      </p>
    </section>
  );
}

function ApprovalCard({
  approval,
  onApprove,
}: {
  approval: ApprovalRow;
  onApprove: (approvalId: string) => Promise<void>;
}) {
  const [isApproving, setIsApproving] = useState(false);

  async function handleApprove() {
    setIsApproving(true);
    try {
      await onApprove(approval.id);
    } finally {
      setIsApproving(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="border-border border-b bg-muted/30 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200">
              <ShieldAlert aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="font-medium text-foreground">{approval.actionSummary}</p>
              <p className="text-muted-foreground text-xs">A caller is paused until you decide.</p>
            </div>
          </div>
          <span
            className={cn(
              "rounded-full border px-3 py-1 font-medium text-xs",
              "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
            )}
          >
            {approval.status}
          </span>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
        <div className="rounded-2xl bg-background p-4">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-[0.18em]">
            Estimated cost
          </p>
          <p className="mt-2 font-serif text-3xl text-foreground">
            {moneyFormatter.format(approval.costUsd)}
          </p>
        </div>
        <div className="rounded-2xl bg-background p-4">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-[0.18em]">
            Breached policy
          </p>
          <p className="mt-2 font-serif text-3xl text-foreground">{approval.breachedPolicyName}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-border border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Approving resumes this one action. Policy editing and batch decisions stay separate.
        </p>
        <Button
          aria-label={`Approve ${approval.actionSummary}`}
          disabled={isApproving}
          onClick={handleApprove}
        >
          {isApproving ? "Approving..." : "Approve"}
        </Button>
      </div>
    </article>
  );
}

function LoadingApprovalsState() {
  return (
    <section aria-label="Loading approvals" className="grid gap-4">
      <div className="h-52 animate-pulse rounded-3xl border border-border bg-muted" />
      <div className="h-24 animate-pulse rounded-3xl border border-border bg-muted/70" />
    </section>
  );
}

export function ApprovalsScreen() {
  const { approvals, approve, isLoading } = useApprovalsQueue();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
      <header className="space-y-3">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-[0.22em]">
          Human checkpoint
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-5xl text-foreground tracking-tight">Approvals</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-6">
              A status and a decision waiting. Review the action, the cost, and the guardrail before
              the caller resumes.
            </p>
          </div>
          <div className="rounded-full border border-border bg-card px-4 py-2 text-muted-foreground text-sm">
            {approvals?.length ?? 0} waiting
          </div>
        </div>
      </header>

      {isLoading ? <LoadingApprovalsState /> : null}

      {!isLoading && approvals?.length ? (
        <section aria-label="Pending approvals" className="grid gap-5">
          {approvals.map((approval) => (
            <ApprovalCard approval={approval} key={approval.id} onApprove={approve} />
          ))}
        </section>
      ) : null}

      {!isLoading && approvals?.length === 0 ? <EmptyApprovalsState /> : null}
    </main>
  );
}
