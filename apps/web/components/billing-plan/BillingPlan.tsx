"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PlanCard, type CurrentPlan } from "./PlanCard";

const PRICE_PLACEHOLDER = "—";

function Placeholders() {
  return (
    <dl className="flex flex-col gap-2">
      <div>
        <dt>Plan</dt>
        <dd>{PRICE_PLACEHOLDER}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>{PRICE_PLACEHOLDER}</dd>
      </div>
      <div>
        <dt>Beta access</dt>
        <dd>{PRICE_PLACEHOLDER}</dd>
      </div>
      <div>
        <dt>Price</dt>
        <dd>{PRICE_PLACEHOLDER}</dd>
      </div>
    </dl>
  );
}

export function BillingPlan() {
  const plan = useQuery(api.users.getMyPlan, {});

  if (plan === undefined) {
    return (
      <section aria-busy="true" aria-label="Current plan" aria-live="polite">
        <Placeholders />
      </section>
    );
  }

  if (plan === null) {
    return (
      <section aria-label="Current plan">
        <p>Sign in to see your plan.</p>
      </section>
    );
  }

  const current: CurrentPlan = plan;

  return (
    <section aria-label="Current plan">
      <PlanCard plan={current} />
    </section>
  );
}
