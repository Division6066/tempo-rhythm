/* ============================================================
   Tempo Flow — Voice chat (walkie-talkie + hands-free)
   Overlays onto the Coach screen. Two modes:
     1) Walkie-talkie  — hold the big button to record, release to send
     2) Voice mode     — continuous listen/respond, hands-free
   ============================================================ */

/* ---------- Fake waveform generator ---------- */
const vcSeed = () => Array.from({length: 64}).map(() => Math.random());
const useWaveform = (active, count = 48) => {
  const [bars, setBars] = useState(() => Array(count).fill(0.15));
  useEffect(() => {
    if (!active) { setBars(Array(count).fill(0.12)); return; }
    let raf;
    const tick = () => {
      setBars(prev => prev.map((_, i) => {
        // Organic-ish envelope biased toward the middle
        const center = count / 2;
        const distance = 1 - Math.abs(i - center) / center;
        const noise = Math.random();
        const pulse = Math.sin((Date.now() / 180) + i * 0.4) * 0.3 + 0.5;
        return Math.max(0.08, Math.min(1, noise * 0.6 + pulse * distance * 0.55));
      }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, count]);
  return bars;
};

/* ---------- Shared waveform renderer ---------- */
const VCWaveform = ({ active, tone = "orange", height = 56, bars = 48 }) => {
  const data = useWaveform(active, bars);
  const color = tone === "orange" ? "var(--tempo-orange)" : tone === "moss" ? "var(--moss)" : "var(--slate-blue)";
  return (
    <div style={{display:"flex", alignItems:"center", gap:2, height, width:"100%"}}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex:1, height: `${Math.max(8, v * height)}px`,
          background: active ? color : "var(--border)",
          borderRadius: 99,
          transition: active ? "none" : "height 220ms ease",
          opacity: active ? 0.6 + v * 0.4 : 0.7,
        }}/>
      ))}
    </div>
  );
};

/* ---------- Rolling transcript line ---------- */
const VCTranscript = ({ who, text, active }) => (
  <div style={{
    padding: "10px 14px", background: who === "user" ? "var(--surface-card)" : "color-mix(in oklab, var(--tempo-orange) 8%, var(--surface-card))",
    border: "1px solid var(--border)",
    borderRadius: 12, fontSize: 14, lineHeight: 1.55,
    opacity: active ? 1 : 0.6,
  }}>
    <div style={{fontSize: 10.5, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--fg-muted)", marginBottom: 4}}>
      {who === "user" ? "You" : "Coach"}
      {active && <span style={{marginLeft: 6, color: "var(--tempo-orange)"}}>● live</span>}
    </div>
    <div style={{color: "var(--fg)"}}>{text}{active && <span style={{opacity: 0.5}}>▊</span>}</div>
  </div>
);

/* ---------- Walkie-Talkie Panel ---------- */
const VCWalkieTalkie = ({ onClose, onSend }) => {
  const [holding, setHolding] = useState(false);
  const [duration, setDuration] = useState(0);
  const startedAt = useRef(null);
  const timer = useRef(null);
  const [history, setHistory] = useState([
    { who: "user", text: "Hey, can you quickly remind me what I was stuck on yesterday?", duration: 4 },
    { who: "coach", text: "The Convex schema for the templates table. You said something about wanting all blocks denormalized. We left it at — try one week with the join table first.", duration: 9 },
  ]);

  useEffect(() => {
    if (holding) {
      startedAt.current = Date.now();
      timer.current = setInterval(() => setDuration(Math.floor((Date.now() - startedAt.current) / 1000)), 100);
    } else {
      clearInterval(timer.current);
      if (duration > 0) {
        // Fake transcription
        setHistory(h => [...h, { who: "user", text: "(voice message)", duration }]);
        setTimeout(() => {
          setHistory(h => [...h, { who: "coach", text: "Got it — I'll draft a response now.", duration: 3 }]);
        }, 900);
        setDuration(0);
      }
    }
    return () => clearInterval(timer.current);
  }, [holding]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "color-mix(in oklab, var(--fg) 50%, transparent)",
      zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 440, background: "var(--surface-card)",
        borderRadius: 18, boxShadow: "var(--shadow-lift)", overflow: "hidden",
        display: "flex", flexDirection: "column", maxHeight: "85vh",
      }}>
        <div style={{padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12}}>
          <div style={{width: 36, height: 36, borderRadius: 99, background: "var(--gradient-tempo)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontSize: 14, fontWeight: 600}}>T</div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 15, fontWeight: 500, fontFamily: "var(--font-serif)"}}>Walkie-talkie</div>
            <div style={{fontSize: 11.5, color: "var(--fg-muted)", fontFamily: "var(--font-mono)"}}>Hold to speak · release to send</div>
          </div>
          <button className="icon-btn" onClick={onClose}><I.X size={14}/></button>
        </div>

        <div style={{flex: 1, padding: "16px 18px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 10}}>
          {history.map((m, i) => (
            <div key={i} style={{alignSelf: m.who === "user" ? "flex-end" : "flex-start", maxWidth: "85%"}}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 14,
                background: m.who === "user" ? "var(--tempo-orange)" : "var(--surface-sunken)",
                color: m.who === "user" ? "white" : "var(--fg)",
                border: m.who === "coach" ? "1px solid var(--border)" : "none",
              }}>
                <I.Play size={12}/>
                <div style={{flex: 1, minWidth: 80, display: "flex", alignItems: "center", gap: 1.5}}>
                  {Array.from({length: Math.min(20, Math.max(8, m.duration * 2))}).map((_, j) => (
                    <div key={j} style={{
                      flex: 1, height: 4 + (j * 7919 % 16),
                      background: m.who === "user" ? "rgba(255,255,255,0.65)" : "var(--fg-muted)",
                      borderRadius: 99,
                    }}/>
                  ))}
                </div>
                <div style={{fontSize: 11, fontFamily: "var(--font-mono)", opacity: 0.85}}>{m.duration}s</div>
              </div>
              {m.text !== "(voice message)" && (
                <div style={{fontSize: 12, color: "var(--fg-muted)", padding: "4px 4px 0", lineHeight: 1.45, fontStyle: "italic"}}>"{m.text}"</div>
              )}
            </div>
          ))}
        </div>

        <div style={{padding: "18px 20px 22px", borderTop: "1px solid var(--border)", background: "var(--surface-sunken)"}}>
          <div style={{textAlign: "center", fontSize: 11.5, fontFamily: "var(--font-mono)", color: holding ? "var(--tempo-orange)" : "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10}}>
            {holding ? `● Recording · ${duration}s` : "Hold the button"}
          </div>
          <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: 14}}>
            <button className="icon-btn" title="Mute"><I.Bell size={14}/></button>
            <button
              onMouseDown={() => setHolding(true)}
              onMouseUp={() => setHolding(false)}
              onMouseLeave={() => holding && setHolding(false)}
              onTouchStart={() => setHolding(true)}
              onTouchEnd={() => setHolding(false)}
              style={{
                width: 84, height: 84, borderRadius: 99,
                background: holding ? "var(--tempo-orange)" : "var(--gradient-tempo)",
                color: "white", border: "none", cursor: "pointer",
                boxShadow: holding
                  ? "0 0 0 8px color-mix(in oklab, var(--tempo-orange) 20%, transparent), var(--shadow-lift)"
                  : "var(--shadow-lift)",
                transform: holding ? "scale(0.96)" : "scale(1)",
                transition: "transform 80ms, box-shadow 120ms",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
              <I.Mic size={30}/>
            </button>
            <button className="icon-btn" title="Switch to voice mode"><I.Volume size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Hands-free Voice Mode ---------- */
const VCVoiceMode = ({ onClose }) => {
  // State machine: "listening" | "thinking" | "speaking" | "idle"
  const [state, setState] = useState("listening");
  const [userText, setUserText] = useState("");
  const [coachText, setCoachText] = useState("");
  const [history, setHistory] = useState([]);
  const [muted, setMuted] = useState(false);

  // Fake conversation script
  const script = useRef([
    { who: "user", text: "I'm feeling a bit overwhelmed with the launch. Can you help me think through it?" },
    { who: "coach", text: "Of course. Let's keep it simple — what's the one thing that's most on your mind right now, and how heavy does it feel on a scale of one to ten?" },
    { who: "user", text: "The launch post. It's at like an eight." },
    { who: "coach", text: "Okay. An eight is real but movable. Have you written a rough draft, or is it still in your head?" },
    { who: "user", text: "Still in my head." },
    { who: "coach", text: "Got it. Want to dump it into the mic right now, unedited? I'll capture it and we can shape it together after." },
  ]);
  const idx = useRef(0);

  useEffect(() => {
    if (muted) return;
    let t;
    const step = () => {
      const item = script.current[idx.current];
      if (!item) { setState("idle"); return; }

      if (item.who === "user") {
        setState("listening");
        setUserText("");
        let i = 0;
        const typeI = setInterval(() => {
          i++;
          setUserText(item.text.slice(0, i));
          if (i >= item.text.length) {
            clearInterval(typeI);
            t = setTimeout(() => {
              setHistory(h => [...h, item]);
              setUserText("");
              setState("thinking");
              t = setTimeout(() => {
                idx.current++;
                step();
              }, 1100);
            }, 600);
          }
        }, 35);
      } else {
        setState("speaking");
        setCoachText("");
        let i = 0;
        const typeI = setInterval(() => {
          i++;
          setCoachText(item.text.slice(0, i));
          if (i >= item.text.length) {
            clearInterval(typeI);
            t = setTimeout(() => {
              setHistory(h => [...h, item]);
              setCoachText("");
              idx.current++;
              step();
            }, 900);
          }
        }, 30);
      }
    };
    const initial = setTimeout(step, 800);
    return () => { clearTimeout(initial); clearTimeout(t); };
  }, [muted]);

  const stateLabel = muted
    ? "Paused"
    : state === "listening" ? "Listening…"
    : state === "thinking"  ? "Thinking…"
    : state === "speaking"  ? "Speaking"
    : "Ready";
  const stateColor = state === "listening" ? "var(--moss)" : state === "speaking" ? "var(--tempo-orange)" : state === "thinking" ? "var(--amber)" : "var(--fg-muted)";

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "color-mix(in oklab, #1a1510 82%, transparent)",
      backdropFilter: "blur(12px)",
      zIndex: 3000,
      display: "flex", flexDirection: "column",
    }}>
      <div style={{padding: "18px 24px", display: "flex", alignItems: "center", gap: 14, color: "white"}}>
        <div style={{width: 8, height: 8, borderRadius: 99, background: stateColor, animation: state === "listening" ? "pulse 1.6s ease-in-out infinite" : "none"}}/>
        <div style={{fontFamily: "var(--font-mono)", fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.75}}>
          Voice mode · {stateLabel}
        </div>
        <div style={{flex: 1}}/>
        <button onClick={onClose} style={{background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "8px 14px", borderRadius: 99, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6}}>
          <I.X size={12}/> Leave
        </button>
      </div>

      <div style={{flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 32px", textAlign: "center", gap: 40, color: "white"}}>
        {/* The orb — expands and contracts based on state */}
        <div style={{position: "relative", width: 240, height: 240, display: "flex", alignItems: "center", justifyContent: "center"}}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: 99,
            background: "radial-gradient(circle, color-mix(in oklab, var(--tempo-orange) 70%, transparent) 0%, transparent 70%)",
            transform: state === "speaking" ? "scale(1.15)" : state === "listening" ? "scale(1.05)" : "scale(0.9)",
            transition: "transform 400ms ease",
            filter: "blur(20px)",
          }}/>
          <div style={{
            position: "absolute", inset: 30, borderRadius: 99,
            background: "var(--gradient-tempo)",
            boxShadow: "0 0 60px color-mix(in oklab, var(--tempo-orange) 60%, transparent)",
            transform: state === "speaking" ? "scale(1.08)" : state === "listening" ? "scale(1.02)" : "scale(0.95)",
            transition: "transform 300ms ease",
          }}/>
          <div style={{
            position: "relative", color: "white", fontSize: 44,
            fontFamily: "var(--font-serif)", fontWeight: 500, letterSpacing: "-0.02em",
          }}>T</div>
        </div>

        {/* Live transcript */}
        <div style={{width: "100%", maxWidth: 560, minHeight: 120, display: "flex", flexDirection: "column", gap: 14}}>
          {userText && (
            <div style={{alignSelf: "flex-end", padding: "12px 18px", background: "rgba(255,255,255,0.12)", borderRadius: 16, maxWidth: "85%", fontSize: 16, lineHeight: 1.5, border: "1px solid rgba(255,255,255,0.15)"}}>
              <div style={{fontSize: 11, fontFamily: "var(--font-mono)", opacity: 0.6, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em"}}>You</div>
              {userText}<span style={{opacity: 0.5}}>▊</span>
            </div>
          )}
          {coachText && (
            <div style={{alignSelf: "flex-start", padding: "12px 18px", background: "color-mix(in oklab, var(--tempo-orange) 20%, transparent)", borderRadius: 16, maxWidth: "85%", fontSize: 16, lineHeight: 1.5, border: "1px solid color-mix(in oklab, var(--tempo-orange) 40%, transparent)"}}>
              <div style={{fontSize: 11, fontFamily: "var(--font-mono)", opacity: 0.75, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em"}}>Coach</div>
              {coachText}<span style={{opacity: 0.5}}>▊</span>
            </div>
          )}
          {!userText && !coachText && state === "thinking" && (
            <div style={{alignSelf: "flex-start", display: "flex", gap: 6, padding: "16px 20px", background: "rgba(255,255,255,0.08)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)"}}>
              {[0,1,2].map(i => <div key={i} style={{width:8, height:8, borderRadius:99, background:"white", opacity: 0.7, animation: `pulse 1.4s ${i*0.2}s ease-in-out infinite`}}/>)}
            </div>
          )}
        </div>

        {/* Live waveform */}
        <div style={{width: "100%", maxWidth: 420, opacity: state === "listening" || state === "speaking" ? 1 : 0.3, transition: "opacity 300ms"}}>
          <VCWaveform active={state === "listening" || state === "speaking"} tone={state === "speaking" ? "orange" : "moss"} height={40} bars={32}/>
        </div>
      </div>

      {/* Controls */}
      <div style={{padding: "22px 24px 28px", display: "flex", justifyContent: "center", alignItems: "center", gap: 14}}>
        <button onClick={() => setMuted(!muted)} title={muted ? "Unmute" : "Mute"}
          style={{width: 52, height: 52, borderRadius: 99, background: muted ? "var(--rust, #c4583a)" : "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"}}>
          {muted ? <I.X size={18}/> : <I.Mic size={18}/>}
        </button>
        <button title="End call" onClick={onClose}
          style={{width: 64, height: 64, borderRadius: 99, background: "#c4583a", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(196,88,58,0.45)"}}>
          <I.X size={22}/>
        </button>
        <button title="Switch mode"
          style={{width: 52, height: 52, borderRadius: 99, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"}}>
          <I.Volume size={18}/>
        </button>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.35); } }
      `}</style>
    </div>
  );
};

/* ---------- Trigger buttons (mounted into the coach input strip) ---------- */
const VCLauncher = ({ className, style }) => {
  const [mode, setMode] = useState(null); // null | "walkie" | "voice"
  return (
    <>
      <div className="row-tight" style={style}>
        <button className="icon-btn" title="Walkie-talkie" onClick={() => setMode("walkie")}>
          <I.Mic size={14}/>
        </button>
        <button className="icon-btn" title="Voice mode (hands-free)" onClick={() => setMode("voice")}
          style={{background:"color-mix(in oklab, var(--tempo-orange) 12%, transparent)", borderColor:"color-mix(in oklab, var(--tempo-orange) 30%, var(--border))"}}>
          <I.Volume size={14}/>
        </button>
      </div>
      {mode === "walkie" && <VCWalkieTalkie onClose={() => setMode(null)}/>}
      {mode === "voice"  && <VCVoiceMode   onClose={() => setMode(null)}/>}
    </>
  );
};

Object.assign(window, { VCLauncher, VCVoiceMode, VCWalkieTalkie, VCWaveform });

/* ---------- Dock-friendly trigger (styled to match Coach input row) ---------- */
const VoiceDockButtons = () => {
  const [mode, setMode] = useState(null);
  const btnStyle = {
    width: 40, height: 40, borderRadius: 99,
    border: "1px solid var(--border, #e3d8c9)",
    background: "var(--surface-page, #f3ebe2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "var(--fg-muted, #6e6458)",
  };
  return (
    <>
      <button title="Walkie-talkie — hold to speak" onClick={() => setMode("walkie")} style={btnStyle}>
        {window.I ? <I.Mic size={16} stroke={1.75}/> : "🎙"}
      </button>
      <button title="Voice mode — hands-free" onClick={() => setMode("voice")}
        style={{...btnStyle, background: "color-mix(in oklab, var(--tempo-orange) 14%, var(--surface-page))", borderColor: "color-mix(in oklab, var(--tempo-orange) 35%, var(--border))", color: "var(--tempo-orange)"}}>
        {window.I ? <I.Volume size={16} stroke={1.75}/> : "🔊"}
      </button>
      {mode === "walkie" && <VCWalkieTalkie onClose={() => setMode(null)}/>}
      {mode === "voice"  && <VCVoiceMode   onClose={() => setMode(null)}/>}
    </>
  );
};
window.VoiceDockButtons = VoiceDockButtons;

/* ---------- Global imperative opener (__vcOpen) ---------- */
/* Mount a root once and let any part of the app say window.__vcOpen("walkie"|"voice") */
const VCGlobalRoot = () => {
  const [mode, setMode] = useState(null);
  useEffect(() => { window.__vcOpen = (m) => setMode(m); window.__vcClose = () => setMode(null); return () => { delete window.__vcOpen; delete window.__vcClose; }; }, []);
  if (!mode) return null;
  return mode === "walkie"
    ? <VCWalkieTalkie onClose={() => setMode(null)}/>
    : <VCVoiceMode onClose={() => setMode(null)}/>;
};
window.VCGlobalRoot = VCGlobalRoot;

/* Auto-mount on document.body when React is ready */
(function mountVCGlobalRoot() {
  const tryMount = () => {
    if (!window.ReactDOM || !window.React) return setTimeout(tryMount, 100);
    let host = document.getElementById("__vc-global-root");
    if (!host) {
      host = document.createElement("div");
      host.id = "__vc-global-root";
      document.body.appendChild(host);
    }
    ReactDOM.createRoot(host).render(<VCGlobalRoot/>);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tryMount);
  else tryMount();
})();
