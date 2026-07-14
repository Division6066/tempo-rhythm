"use client";

import { useMutation } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ConsentPoint, getConsentCopy } from "./copy";

const acknowledgeConsent = makeFunctionReference<
  "mutation",
  { point: ConsentPoint },
  {
    consentLogId: string;
    point: ConsentPoint;
    version: string;
    acknowledgedAt: number;
  }
>("consent:acknowledge");

type ConsentAcknowledgmentProps = {
  point: ConsentPoint;
  className?: string;
  onAcknowledged?: (result: {
    point: ConsentPoint;
    version: string;
    acknowledgedAt: number;
  }) => void;
};

export function ConsentAcknowledgment({
  point,
  className,
  onAcknowledged,
}: ConsentAcknowledgmentProps) {
  const acknowledge = useMutation(acknowledgeConsent);
  const copy = getConsentCopy(point);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleAcknowledge = useCallback(async () => {
    setStatus("saving");
    setMessage("");
    try {
      const result = await acknowledge({ point });
      setStatus("saved");
      setMessage("Acknowledged. We saved this consent note to your account.");
      onAcknowledged?.(result);
    } catch {
      setStatus("error");
      setMessage("Could not save this acknowledgment yet. You can try again when you are ready.");
    }
  }, [acknowledge, onAcknowledged, point]);

  const isSaving = status === "saving";
  const isSaved = status === "saved";

  return (
    <section
      className={cn(
        "rounded-[1.5rem] border border-border bg-card p-5 text-card-foreground shadow-sm",
        className
      )}
      aria-labelledby={`${point}-consent-title`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {copy.eyebrow}
            </p>
            <h2 id={`${point}-consent-title`} className="font-heading text-xl text-foreground">
              {copy.title}
            </h2>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">{copy.body}</p>

          <div className="rounded-[1rem] border border-border bg-muted/35 px-4 py-3">
            <p className="text-sm font-medium text-foreground">{copy.acknowledgment}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => void handleAcknowledge()}
              disabled={isSaving || isSaved}
              className="rounded-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  Acknowledged
                </>
              ) : (
                copy.buttonLabel
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              No blanket consent; this saves this point only.
            </p>
          </div>

          {message ? (
            <p
              className={cn(
                "text-sm",
                status === "error" ? "text-destructive" : "text-muted-foreground"
              )}
              role={status === "error" ? "alert" : "status"}
            >
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
