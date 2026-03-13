import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const finish = () => {
    setLocation("/");
  };

  return (
    <Layout hideNavFooter>
      <div className="min-h-screen bg-background flex flex-col pt-12">
        {/* Progress Bar */}
        <div className="max-w-2xl w-full mx-auto px-6 mb-12">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="mt-2 text-sm text-muted-foreground font-medium text-right">
            Step {step} of {totalSteps}
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center px-6 pb-20">
          <div className="max-w-xl w-full">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <Step1 key="step1" onNext={nextStep} />
              )}
              {step === 2 && (
                <Step2 key="step2" onNext={nextStep} />
              )}
              {step === 3 && (
                <Step3 key="step3" onNext={nextStep} />
              )}
              {step === 4 && (
                <Step4 key="step4" onFinish={finish} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Step1({ onNext }: { onNext: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const options = [
    "I get overwhelmed by large tasks",
    "I forget to check my to-do list",
    "I overcommit and schedule too much",
    "I struggle to start without pressure"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-serif">What's your biggest challenge?</h1>
        <p className="text-muted-foreground text-lg">This helps Tempo personalize its daily suggestions.</p>
      </div>
      
      <div className="space-y-3">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={cn(
              "w-full text-left p-5 rounded-2xl border transition-all text-lg",
              selected === i 
                ? "border-primary bg-primary/5 text-foreground shadow-sm" 
                : "border-border bg-white text-muted-foreground hover:border-primary/50 hover:bg-secondary"
            )}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={selected === null}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}

function Step2({ onNext }: { onNext: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-serif">When do you focus best?</h1>
        <p className="text-muted-foreground text-lg">We'll try to schedule your deep work blocks during this time.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: "morning", label: "Morning", emoji: "🌅" },
          { id: "afternoon", label: "Afternoon", emoji: "☀️" },
          { id: "evening", label: "Evening", emoji: "🌙" }
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={cn(
              "flex flex-col items-center justify-center p-8 rounded-2xl border transition-all gap-4",
              selected === opt.id 
                ? "border-primary bg-primary/5 text-foreground shadow-sm" 
                : "border-border bg-white text-muted-foreground hover:border-primary/50"
            )}
          >
            <span className="text-4xl">{opt.emoji}</span>
            <span className="font-medium text-lg">{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={selected === null}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}

function Step3({ onNext }: { onNext: () => void }) {
  const [val, setVal] = useState(5);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-serif">How many tasks a day?</h1>
        <p className="text-muted-foreground text-lg">Be realistic. Tempo works best when we don't overstuff the day.</p>
      </div>
      
      <div className="px-8">
        <div className="text-center font-serif text-6xl text-primary mb-8">
          {val}
        </div>
        <input 
          type="range" 
          min="1" 
          max="15" 
          value={val}
          onChange={(e) => setVal(parseInt(e.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-4">
          <span>1 (Deep Focus)</span>
          <span>15 (Lots of tiny tasks)</span>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}

function Step4({ onFinish }: { onFinish: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-8 bg-white p-12 rounded-[3rem] border border-border shadow-xl shadow-black/5"
    >
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
        <Sparkles size={40} />
      </div>
      
      <div className="space-y-3">
        <h1 className="text-4xl font-serif">You're all set!</h1>
        <p className="text-muted-foreground text-lg">We've customized Tempo based on your workflow.</p>
      </div>

      <ul className="text-left space-y-4 max-w-sm mx-auto bg-accent/50 p-6 rounded-2xl">
        <li className="flex items-center gap-3">
          <Check className="text-primary" size={20} />
          <span>Personalized AI planner configured</span>
        </li>
        <li className="flex items-center gap-3">
          <Check className="text-primary" size={20} />
          <span>Focus blocks aligned to your rhythm</span>
        </li>
        <li className="flex items-center gap-3">
          <Check className="text-primary" size={20} />
          <span>Smart inbox ready for brain dumps</span>
        </li>
      </ul>

      <div className="pt-4">
        <button
          onClick={onFinish}
          className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30"
        >
          Go to Dashboard
        </button>
      </div>
    </motion.div>
  );
}
