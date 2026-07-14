"use client";

import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import {
  canUseCoreApp,
  getBillingNotice,
  getCurrentTierLabel,
  getEntitlementState,
  type EntitlementProfile,
} from "@/lib/entitlement";

const previewTesterProfile: EntitlementProfile = {
  betaAccess: "tester",
  entitlementTier: "none",
  userType: "free",
  isActive: true,
};

const statusCopy = {
  active: "Active",
  inactive: "Inactive",
} as const;

const accessCopy = {
  free: "Free access",
  paid: "Paid access",
  promo: "Promo/free access",
} as const;

function BillingSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-8">
      <div className="h-8 w-44 animate-pulse rounded-full bg-muted" />
      <div className="h-32 animate-pulse rounded-[1.5rem] bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export function BillingScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  const shouldShowSkeleton = isAuthLoading || (isAuthenticated && profile === undefined);

  if (shouldShowSkeleton) {
    return <BillingSkeleton />;
  }

  const isPreview = !isAuthenticated || !profile;
  const entitlementState = getEntitlementState(isPreview ? previewTesterProfile : profile);
  const tierLabel = getCurrentTierLabel(entitlementState);
  const billingNotice = getBillingNotice(entitlementState);
  const coreAccessOpen = canUseCoreApp(entitlementState);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Pill tone="orange">Settings</Pill>
          <Pill tone={entitlementState.accessKind === "paid" ? "moss" : "slate"}>
            {accessCopy[entitlementState.accessKind]}
          </Pill>
          {isPreview ? <Pill tone="amber">Closed beta preview</Pill> : null}
        </div>

        <div className="max-w-3xl space-y-3">
          <h1 className="text-h1 font-serif">Trial &amp; billing</h1>
          <p className="text-body leading-relaxed text-muted-foreground">
            Billing stays visible so you can understand your tier, promo access, and what is not
            connected yet. No checkout or RevenueCat dashboard action is launched from this page.
          </p>
        </div>
      </header>

      <SoftCard padding="lg" className="overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="font-eyebrow">Current tier</p>
              <h2 className="text-h2 font-serif">{tierLabel}</h2>
            </div>
            <p className="max-w-2xl text-body leading-relaxed text-muted-foreground">
              {billingNotice}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <SoftCard tone="sunken" padding="md">
              <p className="font-eyebrow">Billing status</p>
              <p className="mt-2 text-h3 font-serif">{statusCopy[entitlementState.billingStatus]}</p>
              <p className="mt-2 text-small text-muted-foreground">
                {entitlementState.billingStatus === "active"
                  ? "Access is represented as active in Tempo."
                  : "Payable access is not active yet."}
              </p>
            </SoftCard>
            <SoftCard tone="sunken" padding="md">
              <p className="font-eyebrow">Core app access</p>
              <p className="mt-2 text-h3 font-serif">{coreAccessOpen ? "Open" : "Limited"}</p>
              <p className="mt-2 text-small text-muted-foreground">
                Approved beta testers can keep using the core app while billing is inactive.
              </p>
            </SoftCard>
          </div>
        </div>
      </SoftCard>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Billing state details">
        <SoftCard padding="md">
          <h2 className="text-h3 font-serif">Promo/free state</h2>
          <p className="mt-3 text-small leading-relaxed text-muted-foreground">
            Family, founders, and approved testers are represented as promo/free access without
            pretending a paid subscription exists.
          </p>
        </SoftCard>

        <SoftCard padding="md">
          <h2 className="text-h3 font-serif">Payable placeholder</h2>
          <p className="mt-3 text-small leading-relaxed text-muted-foreground">
            Payments are not live yet. Upgrade buttons stay inactive until explicit billing
            approval and provider setup are complete.
          </p>
        </SoftCard>

        <SoftCard padding="md">
          <h2 className="text-h3 font-serif">No hidden billing</h2>
          <p className="mt-3 text-small leading-relaxed text-muted-foreground">
            This page remains available even when checkout is inactive, so account state is never
            tucked away behind a hard paywall.
          </p>
        </SoftCard>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-border-soft bg-surface-sunken p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-eyebrow">Payment launch status</h2>
          <p className="mt-2 text-small text-muted-foreground">
            RevenueCat and live payment changes require human billing approval, so this shell is
            display-only.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPreview ? (
            <Button variant="soft" size="sm" disabled>
              Sign in to manage
            </Button>
          ) : null}
          <Button variant="subtle" size="sm" disabled>
            Checkout inactive
          </Button>
          <Link
            href="/today"
            className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-primary-foreground text-small font-medium transition-colors hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Continue to Today
          </Link>
        </div>
      </section>
    </main>
  );
}
