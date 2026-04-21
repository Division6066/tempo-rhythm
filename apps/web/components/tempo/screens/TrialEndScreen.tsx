"use client";

import { useRouter } from "next/navigation";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * TrialEndScreen — bare route shown after trial ends.
 * @source docs/design/claude-export/design-system/screens-6.jsx (ScreenTrialEnd)
 */
export function TrialEndScreen() {
  const router = useRouter();
  const toast = useDemoToast();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-20">
      <ScreenHeader
        eyebrow="Trial"
        title="Your 7-day walk is done."
        lede="No shame in the timing. Here's what to do next — your data is safe either way."
        badge={{ label: "Trial ended", tone: "amber" }}
      />

      <SoftCard tone="default" padding="lg">
        <h3 className="font-serif text-h3">Keep going on Pro — $9/month</h3>
        <ul className="mt-3 flex flex-col gap-1 text-small text-muted-foreground">
          <li>✓ 90 voice min/day</li>
          <li>✓ Templates + sketch parse</li>
          <li>✓ Goals decomposition by coach</li>
          <li>✓ Cancel anytime from Settings → Billing</li>
        </ul>
        <div className="mt-4 flex items-center gap-2">
          {/*
           * @behavior: Start the Pro subscription via RevenueCat.
           * @convex-action-needed: billing.subscribePro
           * @provider-needed: revenuecat
           */}
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              toast("Subscribed. (demo) billing.subscribePro.");
              router.push("/today");
            }}
          >
            Continue on Pro — $9/mo
          </Button>
          {/*
           * @behavior: Stay on Basic. Tempo downgrades voice minutes and hides templates.
           * @convex-mutation-needed: billing.downgradeToBasic
           */}
          <Button
            variant="soft"
            size="lg"
            onClick={() => {
              toast("Stayed on Basic. (demo) billing.downgradeToBasic.");
              router.push("/today");
            }}
          >
            Stay on Basic (free)
          </Button>
        </div>
      </SoftCard>

      <SoftCard tone="sunken" padding="md">
        <div className="font-eyebrow mb-2">Your data</div>
        <p className="text-small text-muted-foreground">
          Notes, tasks, habits, journal stay yours. You can export any time.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Pill tone="neutral">7 days of journal</Pill>
          <Pill tone="neutral">12 notes</Pill>
          <Pill tone="neutral">3 habits</Pill>
        </div>
        {/*
         * @behavior: Download a zip of all data for offline keeping.
         * @convex-action-needed: account.exportAllData
         */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-3"
          onClick={() => toast("Export queued. (demo) account.exportAllData.")}
        >
          Export everything
        </Button>
      </SoftCard>
    </div>
  );
}
