import { useEffect, useRef, useState } from "react";
import { Mic, PhoneOff, Radio, X } from "lucide-react";
import { BrandMark } from "@tempo-v0/components/tempo/brand";
import { Button } from "@tempo-v0/components/ui/button";
import { coachReply } from "@tempo-v0/lib/tempo/coach-reply";
import { studioStore, useStudio } from "@tempo-v0/lib/tempo/studio";
import { useTempo } from "@tempo-v0/lib/tempo/use-tempo";
import { isOpenTask } from "@tempo-v0/lib/tempo/filters";
import { cn } from "@tempo-v0/lib/utils";

const PHRASES = [
  "Can you remind me what I was stuck on yesterday?",
  "The dump feels heavy. Help me pick three.",
  "I need a lighter warm-up, not the email.",
  "Park the overdue one. I'll look tomorrow.",
];

export function VoiceOverlay() {
  const studio = useStudio();
  if (studio.voiceMode === "closed") return null;
  return studio.voiceMode === "handsfree" ? <HandsFree /> : <Walkie />;
}

function Walkie() {
  const [holding, setHolding] = useState(false);
  const [duration, setDuration] = useState(0);
  const started = useRef<number | null>(null);
  const studio = useStudio();
  const { snapshot } = useTempo();

  useEffect(() => {
    if (!holding) return;
    started.current = Date.now();
    const t = window.setInterval(() => {
      if (started.current) setDuration(Math.floor((Date.now() - started.current) / 1000));
    }, 120);
    return () => window.clearInterval(t);
  }, [holding]);

  function release() {
    const sec = duration;
    setHolding(false);
    setDuration(0);
    if (sec < 1) return;
    const phrase = PHRASES[Math.abs(sec) % PHRASES.length];
    studioStore.pushChat("user", phrase, { via: "voice", durationSec: sec });
    window.setTimeout(() => {
      const overdue = snapshot.tasks.filter((t) => t.dueAt !== undefined && t.dueAt < Date.now() && isOpenTask(t.status));
      const open = snapshot.tasks.filter((t) => isOpenTask(t.status));
      const reply = coachReply({
        message: phrase,
        warmth: studio.warmth,
        overdueTitles: overdue.map((t) => t.title),
        openTitles: open.map((t) => t.title),
      });
      studioStore.pushChat("coach", reply, { via: "voice", durationSec: 4 });
    }, 700);
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-5"
      onClick={() => studioStore.setVoiceMode("closed")}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-[440px] flex-col overflow-hidden rounded-[18px] bg-surface shadow-(--shadow-modal)"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          <span className="grid size-9 place-items-center rounded-full tempo-gradient font-display text-sm font-semibold text-accent-fg">
            T
          </span>
          <div className="flex-1">
            <p className="font-display text-[15px] font-medium">Walkie-talkie</p>
            <p className="font-mono text-[11.5px] text-muted">Hold to speak · release to send</p>
          </div>
          <button type="button" onClick={() => studioStore.setVoiceMode("closed")} className="grid size-9 place-items-center rounded-full hover:bg-surface-2">
            <X className="size-4" />
          </button>
        </header>
        <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-4">
          {studio.chat
            .filter((m) => m.via === "voice" || m === studio.chat[0])
            .slice(-8)
            .map((m) => (
              <div key={m.id} className={cn("max-w-[85%]", m.role === "user" ? "self-end" : "self-start")}>
                <div
                  className={cn(
                    "flex items-center gap-2.5 rounded-[14px] px-3.5 py-2.5",
                    m.role === "user" ? "bg-accent text-accent-fg" : "border border-border bg-surface-2",
                  )}
                >
                  <Radio className="size-3" />
                  <Waveform n={Math.min(20, Math.max(8, (m.durationSec ?? 4) * 2))} invert={m.role === "user"} />
                  <span className="font-mono text-[11px] opacity-85">{m.durationSec ?? 4}s</span>
                </div>
                <p className="px-1 pt-1 text-xs italic text-muted">"{m.text}"</p>
              </div>
            ))}
        </div>
        <div className="border-t border-border bg-surface-2 px-5 py-5">
          <p className={cn("mb-2.5 text-center font-mono text-[11.5px] uppercase tracking-[0.1em]", holding ? "text-accent" : "text-muted")}>
            {holding ? `Recording · ${duration}s` : "Hold the button"}
          </p>
          <WaveBars active={holding} />
          <div className="mt-4 flex items-center justify-center gap-4">
            <Button variant="outline" size="sm" onClick={() => studioStore.setVoiceMode("handsfree")}>
              Hands-free
            </Button>
            <button
              type="button"
              aria-label="Hold to talk"
              onPointerDown={(e) => {
                e.preventDefault();
                (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
                setHolding(true);
              }}
              onPointerUp={release}
              onPointerCancel={release}
              className={cn(
                "grid size-20 place-items-center rounded-full text-accent-fg shadow-(--shadow-lift)",
                holding ? "scale-95 bg-overdue" : "tempo-gradient",
              )}
            >
              <Mic className="size-7" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HandsFree() {
  const [listening, setListening] = useState(true);
  const studio = useStudio();
  const { snapshot } = useTempo();

  useEffect(() => {
    if (!listening) return;
    const t = window.setTimeout(() => {
      const phrase = PHRASES[2];
      studioStore.pushChat("user", phrase, { via: "voice", durationSec: 5 });
      const overdue = snapshot.tasks.filter((t) => t.dueAt !== undefined && t.dueAt < Date.now() && isOpenTask(t.status));
      const open = snapshot.tasks.filter((t) => isOpenTask(t.status));
      const reply = coachReply({
        message: phrase,
        warmth: studio.warmth,
        overdueTitles: overdue.map((t) => t.title),
        openTitles: open.map((t) => t.title),
      });
      window.setTimeout(() => studioStore.pushChat("coach", reply, { via: "voice" }), 800);
    }, 2200);
    return () => window.clearTimeout(t);
  }, [listening, snapshot.tasks, studio.warmth]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-5">
      <div className="w-full max-w-[440px] rounded-[18px] bg-surface p-6 shadow-(--shadow-modal)">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandMark size={22} />
            <p className="font-display text-[15px]">Hands-free</p>
          </div>
          <button type="button" onClick={() => studioStore.setVoiceMode("closed")} className="grid size-9 place-items-center rounded-full hover:bg-surface-2">
            <X className="size-4" />
          </button>
        </div>
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
          {listening ? "Listening · continuous" : "Paused"}
        </p>
        <WaveBars active={listening} />
        <p className="mt-4 font-display text-sm leading-relaxed text-muted">
          Speak naturally. I'll answer, then listen again. Close whenever you want quiet.
        </p>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setListening((v) => !v)}>
            {listening ? "Pause" : "Listen"}
          </Button>
          <Button variant="overdue" className="flex-1" onClick={() => studioStore.setVoiceMode("closed")}>
            <PhoneOff className="size-4" />
            End
          </Button>
        </div>
      </div>
    </div>
  );
}

function WaveBars({ active }: { active: boolean }) {
  const [bars, setBars] = useState(() => Array.from({ length: 40 }, () => 0.15));
  useEffect(() => {
    if (!active) {
      setBars(Array.from({ length: 40 }, () => 0.12));
      return;
    }
    let raf = 0;
    const tick = () => {
      setBars((prev) =>
        prev.map((_, i) => {
          const center = 20;
          const distance = 1 - Math.abs(i - center) / center;
          const pulse = Math.sin(Date.now() / 180 + i * 0.4) * 0.3 + 0.5;
          return Math.max(0.08, Math.min(1, Math.random() * 0.55 + pulse * distance * 0.5));
        }),
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return (
    <div className="flex h-14 w-full items-center gap-0.5">
      {bars.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-full"
          style={{
            height: `${Math.max(8, v * 56)}px`,
            background: active ? "var(--tf-orange)" : "var(--tf-line)",
            opacity: active ? 0.6 + v * 0.4 : 0.7,
          }}
        />
      ))}
    </div>
  );
}

function Waveform({ n, invert }: { n: number; invert?: boolean }) {
  return (
    <div className="flex min-w-20 flex-1 items-center gap-0.5">
      {Array.from({ length: n }).map((_, j) => (
        <div
          key={j}
          className={cn("flex-1 rounded-full", invert ? "bg-accent-fg/70" : "bg-muted")}
          style={{ height: 4 + ((j * 7919) % 16) }}
        />
      ))}
    </div>
  );
}
