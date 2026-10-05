"use client";

import { useQuery } from "convex/react";
import { useRef } from "react";
import { api } from "@/convex/_generated/api";

type PeriodType = "daily" | "weekly" | "monthly" | "none";
type Proposal = { templateId: string; name: string; reason: string };

export function ProposalBanner({ periodType, title }: { periodType: PeriodType; title: string }) {
  const trimmed = title.trim();
  const proposal = useQuery(
    api.templates.proposeForPage,
    trimmed.length > 0 ? { periodType, title: trimmed } : { periodType }
  );
  const kept = useRef<{ periodType: PeriodType; proposal: Proposal | null } | null>(null);
  if (proposal !== undefined) {
    kept.current = { periodType, proposal };
  }
  const visible =
    proposal !== undefined
      ? proposal
      : kept.current?.periodType === periodType
        ? kept.current.proposal
        : undefined;

  if (visible === undefined) {
    return <p aria-live="polite">Checking which outline fits…</p>;
  }
  if (visible === null) {
    return null;
  }

  return (
    <aside aria-label="Proposal" className="rounded-lg border bg-secondary px-4 py-3">
      <p className="font-eyebrow text-muted-foreground">Why this outline</p>
      <p className="mt-1 text-foreground">{visible.reason}</p>
    </aside>
  );
}
