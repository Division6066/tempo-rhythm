"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Sparkles, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const upsertPrefs = useMutation(api.preferences.upsert);

  const [formData, setFormData] = useState({
    adhdMode: true,
    planningStyle: "morning" as "morning" | "reactive" | "evening",
    wakeTime: "07:30",
    sleepTime: "23:30",
    focusSessionMinutes: 25,
    breakMinutes: 5,
  });

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handleComplete = async () => {
    await upsertPrefs({ ...formData, onboardingComplete: true });
    router.push("/");
  };

  const steps = [
    <div key="step-0" className="flex flex-col items-center justify-center text-center space-y-6 mt-12">
      <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(108,99,255,0.3)] animate-pulse">
        <Sparkles className="text-primary w-12 h-12" />
      </div>
      <h1 className="text-4xl font-bold">Welcome to TEMPO</h1>
      <p className="text-xl text-muted-foreground max-w-sm">
        The calm, minimalist AI planner designed for how your brain actually works.
      </p>
      <Button onClick={handleNext} className="mt-8 w-full max-w-xs h-14 text-lg bg-white text-background hover:bg-white/90 rounded-2xl">
        Let&apos;s get started
      </Button>
    </div>,

    <div key="step-1" className="space-y-8 mt-8">
      <div className="text-center space-y-2">
        <BrainCircuit className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold">ADHD-Friendly?</h2>
        <p className="text-muted-foreground">Turn on gentle prompts, visual chunking, and overwhelm reduction.</p>
      </div>
      <div className="grid gap-4">
        <button onClick={() => setFormData({ ...formData, adhdMode: true })} className={cn("p-6 rounded-2xl border transition-all text-left cursor-pointer", formData.adhdMode ? "bg-primary/10 border-primary" : "bg-card border-white/5")}>
          <h3 className="font-bold text-lg mb-1 flex justify-between">Yes, turn it on {formData.adhdMode && <CheckCircle className="text-primary" />}</h3>
          <p className="text-muted-foreground text-sm">Help me break things down and start easily.</p>
        </button>
        <button onClick={() => setFormData({ ...formData, adhdMode: false })} className={cn("p-6 rounded-2xl border transition-all text-left cursor-pointer", !formData.adhdMode ? "bg-primary/10 border-primary" : "bg-card border-white/5")}>
          <h3 className="font-bold text-lg mb-1 flex justify-between">No thanks {!formData.adhdMode && <CheckCircle className="text-primary" />}</h3>
          <p className="text-muted-foreground text-sm">Just standard minimalist planning.</p>
        </button>
      </div>
      <Button onClick={handleNext} className="w-full h-14 bg-primary text-white rounded-2xl text-lg mt-8">Continue</Button>
    </div>,

    <div key="step-2" className="space-y-6 mt-8">
      <div className="text-center space-y-2 mb-8">
        <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold">Your Planning Style</h2>
      </div>
      <div className="grid gap-4">
        {[
          { id: "morning", title: "Morning Planner", desc: "I plan my day with my morning coffee." },
          { id: "evening", title: "Evening Planner", desc: "I set up tomorrow before going to sleep." },
          { id: "reactive", title: "Go With The Flow", desc: "I adapt as things happen." },
        ].map((style) => (
          <button key={style.id} onClick={() => setFormData({ ...formData, planningStyle: style.id as "morning" | "evening" | "reactive" })} className={cn("p-5 rounded-2xl border transition-all text-left flex justify-between items-center cursor-pointer", formData.planningStyle === style.id ? "bg-amber-500/10 border-amber-500" : "bg-card border-white/5")}>
            <div>
              <h3 className="font-bold text-lg">{style.title}</h3>
              <p className="text-muted-foreground text-sm">{style.desc}</p>
            </div>
            {formData.planningStyle === style.id && <CheckCircle className="text-amber-500" />}
          </button>
        ))}
      </div>
      <div className="flex gap-3 pt-4">
        <Button variant="ghost" onClick={handleBack} className="h-14 px-6 rounded-2xl">Back</Button>
        <Button onClick={handleNext} className="h-14 flex-1 bg-primary text-white rounded-2xl text-lg">Continue</Button>
      </div>
    </div>,

    <div key="step-3" className="flex flex-col items-center justify-center text-center space-y-6 mt-16">
      <div className="w-24 h-24 bg-teal-500/20 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="text-teal-400 w-12 h-12" />
      </div>
      <h2 className="text-3xl font-bold">You&apos;re all set!</h2>
      <p className="text-muted-foreground max-w-sm">
        We&apos;ve tuned TEMPO to your brain. You can adjust the fine details in settings later.
      </p>
      <Button onClick={handleComplete} className="mt-8 w-full max-w-xs h-14 text-lg bg-teal-500 hover:bg-teal-400 text-white rounded-2xl shadow-lg shadow-teal-500/20">
        Go to Dashboard
      </Button>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 items-center pt-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
      <div className="w-full max-w-md">{steps[step]}</div>
    </div>
  );
}
