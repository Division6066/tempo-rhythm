"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type PeriodType = "daily" | "weekly" | "monthly" | "none";

export function ProposalBanner({ periodType, title }: { periodType: PeriodType; title: string }) {
  const trimmed = title.trim();
  const proposal = useQuery(
    api.templates.proposeForPage,
    trimmed.length > 0 ? { periodType, title: trimmed } : { periodType }
  );

  if (proposal === undefined) {
    return <p aria-live="polite">Checking which outline fits…</p>;
  }
  if (proposal === null) {
    return null;
  }

  return (
    <aside aria-label="Proposal" className="rounded-lg border bg-secondary px-4 py-3">
      <p className="font-eyebrow text-muted-foreground">Why this outline</p>
      <p className="mt-1 text-foreground">{proposal.reason}</p>
    </aside>
  );
}
