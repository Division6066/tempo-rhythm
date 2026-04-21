"use client";

import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { mockUser } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

type Tier = {
  id: string;
  name: string;
  price: string;
  bullets: string[];
  highlight?: boolean;
};

const TIERS: Tier[] = [
  {
    id: "basic",
    name: "Basic",
    price: "$0",
    bullets: ["30 voice min/day", "1 coach thread", "Unlimited notes"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9/mo",
    bullets: [
      "90 voice min/day",
      "Unlimited coach threads",
      "Templates + sketch parse",
      "Goals decomposition",
    ],
    highlight: true,
  },
  {
    id: "max",
    name: "Max",
    price: "$19/mo",
    bullets: [
      "180 voice min/day",
      "Family sharing (3 seats)",
      "Priority coach model",
      "Proactive nudges",
    ],
  },
];

/**
 * BillingScreen — trial + subscription page.
 * @source docs/design/claude-export/design-system/screens-6.jsx (ScreenBilling)
 */
export function BillingScreen() {
  const toast = useDemoToast();

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Settings"
        title="Trial & billing"
        lede="You're on Pro trial — 4 days left. No auto-renew until you say so."
        badge={{ label: `${mockUser.tier} tier`, tone: "orange" }}
      />

      <div className="grid gap-5 px-6 py-6 md:grid-cols-3">
        {TIERS.map((tier) => (
          <SoftCard
            key={tier.id}
            tone="default"
            padding="md"
            className={tier.highlight ? "ring-2 ring-primary" : ""}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-h4">{tier.name}</h3>
              {tier.highlight ? <Pill tone="orange">current</Pill> : null}
            </div>
            <div className="mt-1 font-tabular text-h2">{tier.price}</div>
            <ul className="mt-3 flex flex-col gap-1 text-small text-muted-foreground">
              {tier.bullets.map((b) => (
                <li key={b}>✓ {b}</li>
              ))}
            </ul>
            <div className="mt-4">
              {/*
               * @behavior: Change subscription tier via RevenueCat.
               * @convex-action-needed: billing.changeTier
               * @provider-needed: revenuecat
               */}
              <Button
                variant={tier.highlight ? "soft" : "primary"}
                size="md"
                className="w-full"
                onClick={() => toast(`Switched to ${tier.name}. (demo) billing.changeTier.`)}
              >
                {tier.highlight ? "Stay on Pro" : `Switch to ${tier.name}`}
              </Button>
            </div>
          </SoftCard>
        ))}
      </div>

      <div className="grid gap-5 px-6 pb-8 md:grid-cols-2">
        <SoftCard tone="sunken" padding="md">
          <div className="font-eyebrow mb-2">Billing history</div>
          <ul className="flex flex-col divide-y divide-border-soft text-small">
            {[
              { id: "h1", label: "Trial started", date: "Apr 14", price: "$1" },
              { id: "h2", label: "Converted to Pro", date: "—", price: "pending" },
            ].map((h) => (
              <li key={h.id} className="flex items-center justify-between py-2">
                <span>{h.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-tabular text-caption text-muted-foreground">
                    {h.date}
                  </span>
                  <Pill tone="neutral">{h.price}</Pill>
                </div>
              </li>
            ))}
          </ul>
        </SoftCard>
        <SoftCard tone="default" padding="md">
          <div className="font-eyebrow mb-2">Payment method</div>
          <p className="text-small text-muted-foreground">
            Apple Pay / Google Pay / card via RevenueCat. No direct Stripe here.
          </p>
          {/*
           * @behavior: Open RevenueCat customer portal for payment method changes.
           * @convex-action-needed: billing.openCustomerPortal
           * @provider-needed: revenuecat
           */}
          <Button
            variant="soft"
            size="sm"
            className="mt-3"
            onClick={() => toast("Opened portal. (demo) billing.openCustomerPortal.")}
          >
            Update payment method
          </Button>
        </SoftCard>
      </div>
    </div>
  );
}
