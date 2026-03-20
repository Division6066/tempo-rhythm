import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrainCircuit, Sparkles, Clock, Zap, ArrowRight, CheckCircle, Sun, Moon, Timer, Battery } from "lucide-react";
import clsx from "clsx";

const ENERGY_OPTIONS = [
  { id: "early_morning", label: "Early Morning", desc: "6–9 AM", icon: "🌅" },
  { id: "late_morning", label: "Late Morning", desc: "9–12 PM", icon: "☀️" },
  { id: "early_afternoon", label: "Early Afternoon", desc: "12–3 PM", icon: "🌤" },
  { id: "late_afternoon", label: "Late Afternoon", desc: "3–6 PM", icon: "🌇" },
  { id: "evening", label: "Evening", desc: "6–9 PM", icon: "🌙" },
  { id: "night", label: "Night", desc: "9 PM+", icon: "🦉" },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [, setLocation] = useLocation();
  const [completing, setCompleting] = useState(false);

  const [formData, setFormData] = useState({
    adhdMode: true,
    planningStyle: "morning" as "morning" | "reactive" | "evening",
    wakeTime: "07:30",
    sleepTime: "23:30",
    energyPeaks: [] as string[],
    prepBufferMinutes: 30,
    focusSessionMinutes: 25,
    breakMinutes: 5,
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => Math.max(0, s - 1));

  const toggleEnergyPeak = (id: string) => {
    setFormData(prev => ({
      ...prev,
      energyPeaks: prev.energyPeaks.includes(id)
        ? prev.energyPeaks.filter(e => e !== id)
        : [...prev.energyPeaks, id],
    }));
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
      const token = localStorage.getItem("tempo_token");
      const res = await fetch(`${apiUrl}/auth/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Onboarding failed");
      setLocation("/");
    } catch (e) {
      console.error("Failed to complete onboarding", e);
    } finally {
      setCompleting(false);
    }
  };

  const steps = [
    <div key="step-0" className="flex flex-col items-center justify-center text-center space-y-6 mt-12">
      <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(201,100,66,0.3)] animate-pulse">
        <Sparkles className="text-primary w-12 h-12" />
      </div>
      <h1 className="text-4xl font-display font-bold">Welcome to TEMPO</h1>
      <p className="text-xl text-muted-foreground max-w-sm">
        The calm, minimalist AI planner designed for how your brain actually works.
      </p>
      <Button onClick={handleNext} className="mt-8 w-full max-w-xs h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl">
        Let's get started
      </Button>
    </div>,

    <div key="step-1" className="space-y-8 mt-8">
      <div className="text-center space-y-2">
        <BrainCircuit className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-display font-bold">ADHD-Friendly?</h2>
        <p className="text-muted-foreground">Turn on gentle prompts, visual chunking, and overwhelm reduction.</p>
      </div>
      <div className="grid gap-4">
        <button 
          onClick={() => setFormData({...formData, adhdMode: true})}
          className={clsx("p-6 rounded-2xl border transition-all text-left", formData.adhdMode ? "bg-primary/10 border-primary" : "bg-card border-border")}
        >
          <h3 className="font-bold text-lg mb-1 flex justify-between">Yes, turn it on {formData.adhdMode && <CheckCircle className="text-primary"/>}</h3>
          <p className="text-muted-foreground text-sm">Help me break things down and start easily.</p>
        </button>
        <button 
          onClick={() => setFormData({...formData, adhdMode: false})}
          className={clsx("p-6 rounded-2xl border transition-all text-left", !formData.adhdMode ? "bg-primary/10 border-primary" : "bg-card border-border")}
        >
          <h3 className="font-bold text-lg mb-1 flex justify-between">No thanks {!formData.adhdMode && <CheckCircle className="text-primary"/>}</h3>
          <p className="text-muted-foreground text-sm">Just standard minimalist planning.</p>
        </button>
      </div>
      <Button onClick={handleNext} className="w-full h-14 bg-primary text-white rounded-2xl text-lg mt-8">Continue</Button>
    </div>,

    <div key="step-2" className="space-y-6 mt-8">
      <div className="text-center space-y-2 mb-8">
        <Clock className="w-12 h-12 text-warning mx-auto mb-4" />
        <h2 className="text-3xl font-display font-bold">Your Planning Style</h2>
      </div>
      <div className="grid gap-4">
        {[
          { id: "morning", title: "Morning Planner", desc: "I plan my day with my morning coffee." },
          { id: "evening", title: "Evening Planner", desc: "I set up tomorrow before going to sleep." },
          { id: "reactive", title: "Go With The Flow", desc: "I adapt as things happen." }
        ].map(style => (
          <button 
            key={style.id}
            onClick={() => setFormData({...formData, planningStyle: style.id as any})}
            className={clsx("p-5 rounded-2xl border transition-all text-left flex justify-between items-center", formData.planningStyle === style.id ? "bg-warning/10 border-warning" : "bg-card border-border")}
          >
            <div>
              <h3 className="font-bold text-lg">{style.title}</h3>
              <p className="text-muted-foreground text-sm">{style.desc}</p>
            </div>
            {formData.planningStyle === style.id && <CheckCircle className="text-warning"/>}
          </button>
        ))}
      </div>
      <div className="flex gap-3 pt-4">
        <Button variant="ghost" onClick={handleBack} className="h-14 px-6 rounded-2xl">Back</Button>
        <Button onClick={handleNext} className="h-14 flex-1 bg-primary text-white rounded-2xl text-lg">Continue</Button>
      </div>
    </div>,

    <div key="step-3" className="space-y-6 mt-8">
      <div className="text-center space-y-2 mb-4">
        <Sun className="w-12 h-12 text-warning mx-auto mb-4" />
        <h2 className="text-3xl font-display font-bold">Your Schedule</h2>
        <p className="text-muted-foreground">When does your day start and end?</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <div className="flex items-center gap-2 text-warning">
            <Sun size={18} />
            <span className="font-semibold">Wake up</span>
          </div>
          <Input
            type="time"
            value={formData.wakeTime}
            onChange={e => setFormData({ ...formData, wakeTime: e.target.value })}
            className="bg-background border-border text-lg h-12"
          />
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <div className="flex items-center gap-2 text-info">
            <Moon size={18} />
            <span className="font-semibold">Sleep</span>
          </div>
          <Input
            type="time"
            value={formData.sleepTime}
            onChange={e => setFormData({ ...formData, sleepTime: e.target.value })}
            className="bg-background border-border text-lg h-12"
          />
        </div>
      </div>
      <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
        <div className="flex items-center gap-2 text-success">
          <Timer size={18} />
          <span className="font-semibold">Focus session length</span>
        </div>
        <div className="flex items-center gap-4">
          {[15, 25, 45, 60].map(mins => (
            <button
              key={mins}
              onClick={() => setFormData({ ...formData, focusSessionMinutes: mins })}
              className={clsx(
                "flex-1 py-3 rounded-xl text-center font-bold transition-all",
                formData.focusSessionMinutes === mins
                  ? "bg-success/20 border border-success text-success"
                  : "bg-muted border border-transparent text-muted-foreground"
              )}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button variant="ghost" onClick={handleBack} className="h-14 px-6 rounded-2xl">Back</Button>
        <Button onClick={handleNext} className="h-14 flex-1 bg-primary text-white rounded-2xl text-lg">Continue</Button>
      </div>
    </div>,

    <div key="step-4" className="space-y-6 mt-8">
      <div className="text-center space-y-2 mb-4">
        <Battery className="w-12 h-12 text-success mx-auto mb-4" />
        <h2 className="text-3xl font-display font-bold">Energy Peaks</h2>
        <p className="text-muted-foreground">When do you feel most focused? Pick all that apply.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ENERGY_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => toggleEnergyPeak(opt.id)}
            className={clsx(
              "p-4 rounded-2xl border transition-all text-left",
              formData.energyPeaks.includes(opt.id)
                ? "bg-success/10 border-success"
                : "bg-card border-border"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl">{opt.icon}</span>
              {formData.energyPeaks.includes(opt.id) && <CheckCircle size={16} className="text-success" />}
            </div>
            <h3 className="font-bold text-sm">{opt.label}</h3>
            <p className="text-xs text-muted-foreground">{opt.desc}</p>
          </button>
        ))}
      </div>
      <div className="flex gap-3 pt-4">
        <Button variant="ghost" onClick={handleBack} className="h-14 px-6 rounded-2xl">Back</Button>
        <Button onClick={handleNext} className="h-14 flex-1 bg-primary text-white rounded-2xl text-lg">Continue</Button>
      </div>
    </div>,

    <div key="step-5" className="flex flex-col items-center justify-center text-center space-y-6 mt-16">
      <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="text-success w-12 h-12" />
      </div>
      <h2 className="text-3xl font-display font-bold">You're all set!</h2>
      <p className="text-muted-foreground max-w-sm">
        We've tuned TEMPO to your brain. You can adjust the fine details in settings later.
      </p>
      <div className="w-full max-w-xs space-y-3 bg-card rounded-2xl border border-border p-5 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">ADHD Mode</span>
          <span className="font-medium">{formData.adhdMode ? "On" : "Off"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Style</span>
          <span className="font-medium capitalize">{formData.planningStyle}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Schedule</span>
          <span className="font-medium">{formData.wakeTime} – {formData.sleepTime}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Focus</span>
          <span className="font-medium">{formData.focusSessionMinutes} min</span>
        </div>
        {formData.energyPeaks.length > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Peaks</span>
            <span className="font-medium">{formData.energyPeaks.length} selected</span>
          </div>
        )}
      </div>
      <Button 
        onClick={handleComplete} 
        disabled={completing}
        className="mt-4 w-full max-w-xs h-14 text-lg bg-success hover:bg-success text-white rounded-2xl shadow-lg shadow-success/20"
      >
        {completing ? "Saving..." : "Go to Dashboard"}
      </Button>
    </div>
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 items-center pt-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-border">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>
      
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
