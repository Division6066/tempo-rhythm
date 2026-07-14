"use client";

import { ArrowRight, CheckCircle2, MessageCircle, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { conversationStarters } from "./starters";
import { track, type OnboardingFunnelEvent, type OnboardingStep } from "./track";

const stepEvents: Record<OnboardingStep, OnboardingFunnelEvent> = {
  "age-gate": {
    name: "onboarding_age_gate_viewed",
    step: "age-gate",
  },
  preset: {
    name: "onboarding_preset_viewed",
    step: "preset",
  },
  "chat-preview": {
    name: "onboarding_chat_preview_viewed",
    step: "chat-preview",
  },
  starter: {
    name: "onboarding_starter_viewed",
    step: "starter",
  },
  "first-chat": {
    name: "onboarding_first_chat_viewed",
    step: "first-chat",
  },
};

const steps: OnboardingStep[] = ["age-gate", "preset", "chat-preview", "starter", "first-chat"];

type CompanionPreset = {
  id: string;
  title: string;
  description: string;
  tone: string;
};

const presets: CompanionPreset[] = [
  {
    id: "soft-start",
    title: "Soft start",
    description: "Gentle check-ins, tiny steps, and no pressure to explain everything perfectly.",
    tone: "Warm and steady",
  },
  {
    id: "focus-buddy",
    title: "Focus buddy",
    description: "Clear next actions, short prompts, and a kind nudge back when the thread gets tangled.",
    tone: "Concrete and calm",
  },
];

export function OnboardingFunnel() {
  const [step, setStep] = useState<OnboardingStep>("age-gate");
  const [selectedPresetId, setSelectedPresetId] = useState(presets[0].id);
  const [quickCreateDraft, setQuickCreateDraft] = useState("");
  const [starterId, setStarterId] = useState(conversationStarters[0].id);
  const [chatInput, setChatInput] = useState("");
  const trackedSteps = useRef(new Set<OnboardingStep>());

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === selectedPresetId) ?? presets[0],
    [selectedPresetId]
  );
  const selectedStarter = useMemo(
    () => conversationStarters.find((starter) => starter.id === starterId) ?? conversationStarters[0],
    [starterId]
  );

  useEffect(() => {
    if (trackedSteps.current.has(step)) {
      return;
    }

    trackedSteps.current.add(step);
    track(stepEvents[step]);
  }, [step]);

  function choosePreset(presetId: string) {
    setSelectedPresetId(presetId);
    setQuickCreateDraft("");
  }

  function sendStarter() {
    setChatInput("");
    setStep("first-chat");
  }

  const currentStepIndex = steps.indexOf(step);

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="mx-auto grid min-h-screen w-full max-w-[1120px] gap-8 px-5 py-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:px-8">
        <aside className="relative hidden min-h-[680px] overflow-hidden rounded-[32px] border border-border bg-surface-inverse p-8 text-primary-foreground shadow-modal lg:block">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
          <div className="absolute -right-20 bottom-16 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <span className="font-eyebrow text-primary-foreground/70">AIRI companion</span>
              <h1 className="mt-6 max-w-sm font-display text-[52px] leading-[0.98]">
                From hello to first chat before the kettle boils.
              </h1>
              <p className="mt-5 max-w-sm text-primary-foreground/75 text-small leading-7">
                A calm onboarding path for getting into conversation quickly: no paywall,
                no maze, no pressure to craft the perfect profile.
              </p>
            </div>

            <div className="grid gap-3 rounded-3xl border border-primary-foreground/10 bg-primary-foreground/8 p-4 backdrop-blur">
              {steps.map((item, index) => (
                <div className="flex items-center gap-3" key={item}>
                  <span
                    className={`flex size-8 items-center justify-center rounded-full border text-caption ${
                      index <= currentStepIndex
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-primary-foreground/20 text-primary-foreground/60"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-small capitalize text-primary-foreground/80">
                    {item.replace("-", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section
          aria-label="AIRI onboarding funnel"
          className="rounded-[28px] border border-border bg-card p-5 shadow-lift sm:p-8"
          data-testid="onboarding-step"
        >
          {step === "age-gate" ? (
            <AgeGateStep onContinue={() => setStep("preset")} />
          ) : null}
          {step === "preset" ? (
            <PresetStep
              draft={quickCreateDraft}
              onContinue={() => setStep("chat-preview")}
              onDraftChange={setQuickCreateDraft}
              onPresetSelect={choosePreset}
              presets={presets}
              selectedPresetId={selectedPresetId}
            />
          ) : null}
          {step === "chat-preview" ? (
            <ChatPreviewStep onContinue={() => setStep("starter")} preset={selectedPreset} />
          ) : null}
          {step === "starter" ? (
            <StarterStep
              onContinue={sendStarter}
              onStarterSelect={setStarterId}
              selectedStarterId={starterId}
            />
          ) : null}
          {step === "first-chat" ? (
            <FirstChatStep
              chatInput={chatInput}
              onChatInputChange={setChatInput}
              preset={selectedPreset}
              starterMessage={selectedStarter.message}
            />
          ) : null}
        </section>
      </section>
    </main>
  );
}

function StepHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4">
      <span className="font-eyebrow text-muted-foreground">{eyebrow}</span>
      <h2 className="font-display text-[40px] leading-tight sm:text-display">{title}</h2>
      <p className="max-w-2xl text-muted-foreground text-small leading-7 sm:text-body">{children}</p>
    </div>
  );
}

function ForwardActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 flex flex-wrap gap-3" data-testid="onboarding-forward-actions">
      {children}
    </div>
  );
}

function AgeGateStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div>
      <StepHeader eyebrow="Step 1 · age gate" title="You made it here.">
        Before AIRI starts a companion chat, please confirm you are 18 or older. This keeps the
        first conversation in the right safety lane.
      </StepHeader>
      <div className="mt-8 rounded-3xl border border-border bg-background p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 size-5 text-moss" aria-hidden="true" />
          <p className="m-0 text-small leading-7">
            If you are not 18 yet, this prototype is not the right place to continue. If you are,
            we can get you into a first low-pressure chat quickly.
          </p>
        </div>
      </div>
      <ForwardActions>
        <Button className="min-h-11 rounded-full px-5" onClick={onContinue}>
          I am 18 or older
          <ArrowRight aria-hidden="true" />
        </Button>
      </ForwardActions>
    </div>
  );
}

function PresetStep({
  draft,
  onContinue,
  onDraftChange,
  onPresetSelect,
  presets,
  selectedPresetId,
}: {
  draft: string;
  onContinue: () => void;
  onDraftChange: (draft: string) => void;
  onPresetSelect: (presetId: string) => void;
  presets: CompanionPreset[];
  selectedPresetId: string;
}) {
  return (
    <div>
      <StepHeader eyebrow="Step 2 · companion shape" title="Choose a starting shape.">
        Pick a preset or write a quick preference. Choosing a preset clears the draft so an
        abandoned quick-create never follows you into chat by accident.
      </StepHeader>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {presets.map((preset) => {
          const selected = selectedPresetId === preset.id;
          return (
            <button
              aria-pressed={selected}
              className={`rounded-3xl border p-5 text-left transition ${
                selected
                  ? "border-primary bg-primary/10 shadow-card"
                  : "border-border bg-background hover:border-primary/60"
              }`}
              key={preset.id}
              onClick={() => onPresetSelect(preset.id)}
              type="button"
            >
              <span className="font-serif text-h3">{preset.title}</span>
              <span className="mt-2 block text-muted-foreground text-small leading-6">
                {preset.description}
              </span>
              <span className="mt-4 inline-flex rounded-full bg-secondary px-3 py-1 text-caption">
                {preset.tone}
              </span>
            </button>
          );
        })}
      </div>

      <label className="mt-6 block text-small font-medium" htmlFor="quick-create">
        Optional quick-create note
      </label>
      <Input
        className="mt-2 min-h-11 rounded-2xl"
        id="quick-create"
        onChange={(event) => onDraftChange(event.currentTarget.value)}
        placeholder="Example: please keep answers short and kind"
        value={draft}
      />

      <ForwardActions>
        <Button className="min-h-11 rounded-full px-5" onClick={onContinue}>
          Use this preset
          <ArrowRight aria-hidden="true" />
        </Button>
      </ForwardActions>
    </div>
  );
}

function ChatPreviewStep({
  onContinue,
  preset,
}: {
  onContinue: () => void;
  preset: CompanionPreset;
}) {
  return (
    <div>
      <StepHeader eyebrow="Step 3 · preview" title="Your first chat is ready.">
        AIRI will start in the <strong>{preset.title}</strong> shape: {preset.description}
      </StepHeader>

      <div className="mt-8 rounded-[28px] border border-border bg-background p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <MessageCircle aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="m-0 font-serif text-h3">AIRI</p>
            <p className="m-0 text-muted-foreground text-small">{preset.tone}</p>
          </div>
        </div>
        <p className="mt-5 rounded-3xl bg-card p-4 text-small leading-7">
          We can begin with one small thing. You do not have to explain the whole day first.
        </p>
      </div>

      <ForwardActions>
        <Button className="min-h-11 rounded-full px-5" onClick={onContinue}>
          Start first chat
          <ArrowRight aria-hidden="true" />
        </Button>
      </ForwardActions>
    </div>
  );
}

function StarterStep({
  onContinue,
  onStarterSelect,
  selectedStarterId,
}: {
  onContinue: () => void;
  onStarterSelect: (starterId: string) => void;
  selectedStarterId: string;
}) {
  return (
    <div>
      <StepHeader eyebrow="Step 4 · opener" title="Pick a gentle opener.">
        These are real first messages, written to make the first turn feel easy instead of blank.
      </StepHeader>

      <div className="mt-8 grid gap-3">
        {conversationStarters.map((starter) => {
          const selected = selectedStarterId === starter.id;
          return (
            <button
              aria-pressed={selected}
              className={`rounded-3xl border p-4 text-left transition ${
                selected
                  ? "border-primary bg-primary/10 shadow-card"
                  : "border-border bg-background hover:border-primary/60"
              }`}
              key={starter.id}
              onClick={() => onStarterSelect(starter.id)}
              type="button"
            >
              <span className="font-serif text-h3">{starter.label}</span>
              <span className="mt-2 block text-muted-foreground text-small">{starter.helper}</span>
            </button>
          );
        })}
      </div>

      <ForwardActions>
        <Button className="min-h-11 min-w-[176px] rounded-full px-5" onClick={onContinue}>
          Send starter
          <ArrowRight aria-hidden="true" />
        </Button>
      </ForwardActions>
    </div>
  );
}

function FirstChatStep({
  chatInput,
  onChatInputChange,
  preset,
  starterMessage,
}: {
  chatInput: string;
  onChatInputChange: (message: string) => void;
  preset: CompanionPreset;
  starterMessage: string;
}) {
  return (
    <div>
      <StepHeader eyebrow="Step 5 · first chat" title="First chat">
        The thread is interactive now. Your starter opened the conversation; add one more line
        only if it feels useful.
      </StepHeader>

      <div
        className="mt-8 grid gap-4 rounded-[28px] border border-border bg-background p-4"
        data-testid="first-chat-thread"
      >
        <div className="max-w-[80%] rounded-3xl bg-card p-4 text-small leading-7 shadow-card">
          <span className="mb-1 block font-eyebrow text-muted-foreground">You</span>
          {starterMessage}
        </div>
        <div className="ml-auto max-w-[80%] rounded-3xl bg-primary p-4 text-primary-foreground text-small leading-7 shadow-card">
          <span className="mb-1 block font-eyebrow text-primary-foreground/70">AIRI</span>
          I can stay with one small next step. With {preset.title.toLowerCase()}, we can begin
          gently and adjust as we go.
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <label className="sr-only" htmlFor="first-chat-input">
          First chat message
        </label>
        <Input
          autoComplete="off"
          data-testid="first-chat-input"
          id="first-chat-input"
          onChange={(event) => onChatInputChange(event.currentTarget.value)}
          placeholder="Add one small detail, or press Send when you are ready"
          spellCheck={false}
          value={chatInput}
        />
      </div>

      <ForwardActions>
        <Button className="min-h-11 rounded-full px-5" data-testid="first-chat-send">
          <Sparkles aria-hidden="true" />
          Send
        </Button>
      </ForwardActions>
    </div>
  );
}
