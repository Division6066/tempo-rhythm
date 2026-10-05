"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NameStep({
  name,
  onNameChange,
  onNext,
  onSkip,
  pending = false,
}: {
  name: string;
  onNameChange: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  pending?: boolean;
}) {
  return (
    <section className="flex flex-col gap-6" aria-label="Your name">
      <header className="flex flex-col gap-2">
        <p className="font-eyebrow text-muted-foreground">Step 1 of 2</p>
        <h1 className="font-heading text-4xl text-foreground">What should we call you?</h1>
      </header>
      <div className="flex flex-col gap-2">
        <Label htmlFor="onboarding-name">Your name</Label>
        <Input
          id="onboarding-name"
          value={name}
          placeholder="Optional"
          autoComplete="name"
          onChange={(event) => onNameChange(event.target.value)}
        />
      </div>
      <div className="flex items-center gap-4">
        <Button type="button" onClick={onNext}>
          Next
        </Button>
        <button
          type="button"
          className="text-primary underline"
          disabled={pending}
          onClick={onSkip}
        >
          Skip
        </button>
      </div>
    </section>
  );
}
