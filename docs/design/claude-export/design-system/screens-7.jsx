/* Tempo Flow — Screens Part 7: NotePlan-inspired Daily Note + ADHD widgets
   Three-pane layout: calendar rail · markdown day-note · time-blocked calendar
   Markdown-native, bi-directional links, animated focus ring, gentle confetti.
*/

/* ---------- ADHD-friendly animated widgets ---------- */

// Focus ring — a breathing orbit that marks "we're in a time block"
const FocusRing = ({ minutes = 25, running = true, label = "Draft launch post" }) => {
  const [elapsed, setElapsed] = useState(8 * 60); // seconds in
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed(e => Math.min(minutes * 60, e + 1)), 1000);
    return () => clearInterval(t);
  }, [running, minutes]);
  const pct = elapsed / (minutes * 60);
  const R = 54, C = 2 * Math.PI * R;
  const left = minutes * 60 - elapsed;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="fr-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D97757"/><stop offset="100%" stopColor="#E8A87C"/>
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--border)" strokeWidth="4"/>
        <circle cx="70" cy="70" r={R} fill="none" stroke="url(#fr-g)" strokeWidth="4"
                strokeLinecap="round" strokeDasharray={C}
                strokeDashoffset={C * (1 - pct)}
                style={{ transition: "stroke-dashoffset 1s linear" }}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="mono" style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em" }}>{mm}:{ss}</div>
        <div className="caption" style={{ fontSize: 10 }}>focus · {minutes}m</div>
      </div>
      {/* breathing halo */}
      <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "1px solid var(--tempo-orange-soft)", opacity: 0.4, animation: "tf-breathe 4s ease-in-out infinite" }}/>
      <style>{`
        @keyframes tf-breathe { 0%,100% { transform: scale(1); opacity: .35 } 50% { transform: scale(1.06); opacity: .08 } }
      `}</style>
    </div>
  );
};

// Streak dots — 7-day rhythm with gentle fill
const StreakDots = ({ days = [1,1,1,1,1,0,0] }) => (
  <div style={{ display: "flex", gap: 6 }}>
    {days.map((d, i) => (
      <div key={i} style={{
        width: 20, height: 20, borderRadius: 6,
        background: d ? "var(--moss-600)" : "var(--surface-sunken)",
        border: d ? "none" : "1px dashed var(--border)",
        animation: d ? `tf-pop 380ms ease ${i * 60}ms both` : "none",
      }}/>
    ))}
    <style>{`@keyframes tf-pop { 0% { transform: scale(.6); opacity: 0 } 60% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }`}</style>
  </div>
);

// Breath bubble — 4-7-8 nudge that appears after 45m focus
const BreathBubble = ({ show }) => {
  if (!show) return null;
  return (
    <div style={{ position: "absolute", bottom: 20, right: 20, padding: "12px 16px", background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 99, boxShadow: "var(--shadow-lift)", display: "flex", alignItems: "center", gap: 12, fontSize: 13, animation: "tf-rise 400ms ease" }}>
      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--gradient-tempo)", animation: "tf-inhale 7.5s ease-in-out infinite" }}/>
      <span style={{ color: "var(--fg-muted)" }}>You've been deep for a while. One slow breath?</span>
      <style>{`
        @keyframes tf-inhale { 0%, 100% { transform: scale(0.7) } 40% { transform: scale(1.4) } 60% { transform: scale(1.4) } }
        @keyframes tf-rise { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
};

// Confetti (subtle — 8 particles, terracotta + moss)
const Delight = ({ trigger }) => {
  const [bursts, setBursts] = useState([]);
  useEffect(() => {
    if (!trigger) return;
    const id = Date.now();
    setBursts(b => [...b, id]);
    setTimeout(() => setBursts(b => b.filter(x => x !== id)), 900);
  }, [trigger]);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {bursts.map(id => (
        <div key={id} style={{ position: "absolute", left: "50%", top: "50%" }}>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const dx = Math.cos(a) * 40, dy = Math.sin(a) * 40;
            const c = i % 2 ? "var(--tempo-orange)" : "var(--moss-600)";
            return <div key={i} style={{ position: "absolute", width: 6, height: 6, borderRadius: 2, background: c, transform: `translate(-50%, -50%)`, animation: `tf-burst-${i} 800ms ease-out forwards`, "--dx": `${dx}px`, "--dy": `${dy}px` }}/>;
          })}
        </div>
      ))}
      <style>{Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const dx = Math.cos(a) * 40, dy = Math.sin(a) * 40;
        return `@keyframes tf-burst-${i} { 0% { transform: translate(-50%,-50%) scale(1); opacity: 1 } 100% { transform: translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.3); opacity: 0 } }`;
      }).join("\n")}</style>
    </div>
  );
};

/* ---------- Markdown block renderer ---------- */
const MDBlock = ({ type, children, onToggle, done, tag, link, time, energy }) => {
  if (type === "h1") return <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 500, letterSpacing: "-0.02em", margin: "4px 0 18px" }}>{children}</h1>;
  if (type === "h2") return <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500, letterSpacing: "-0.01em", margin: "28px 0 10px", display: "flex", alignItems: "baseline", gap: 10 }}><span style={{ color: "var(--fg-muted)", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 400 }}>##</span>{children}</h2>;
  if (type === "h3") return <h3 style={{ fontSize: 15, fontWeight: 600, margin: "16px 0 6px", color: "var(--fg-soft)", letterSpacing: "0.02em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>{children}</h3>;
  if (type === "p")   return <p style={{ fontSize: 15, lineHeight: 1.7, margin: "8px 0", color: "var(--fg)", fontFamily: "var(--font-serif)" }}>{children}</p>;
  if (type === "quote") return <blockquote style={{ borderLeft: "3px solid var(--tempo-orange)", paddingLeft: 14, margin: "12px 0", fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--fg-soft)", fontSize: 15, lineHeight: 1.6 }}>{children}</blockquote>;
  if (type === "task") {
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 0", fontSize: 15, cursor: "pointer", position: "relative" }} onClick={onToggle}>
        <span className="mono" style={{ color: "var(--fg-muted)", fontSize: 12, width: 12, lineHeight: "22px" }}>*</span>
        <button style={{
          width: 18, height: 18, borderRadius: 5, border: "1.5px solid " + (done ? "var(--moss-600)" : "var(--border-strong)"),
          background: done ? "var(--moss-600)" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: 2, padding: 0,
          transition: "all 240ms cubic-bezier(.34,1.56,.64,1)",
        }}>
          {done && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>
        <span style={{ flex: 1, color: done ? "var(--fg-muted)" : "var(--fg)", textDecoration: done ? "line-through" : "none", lineHeight: 1.6, transition: "color 200ms" }}>{children}</span>
        {time && <span className="mono caption" style={{ color: "var(--tempo-orange)" }}>{time}</span>}
        {energy && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: energy === "high" ? "var(--amber-100)" : energy === "low" ? "var(--moss-100)" : "var(--surface-sunken)", color: energy === "high" ? "var(--amber-700)" : energy === "low" ? "var(--moss-700)" : "var(--fg-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{energy}</span>}
        {tag && <span className="mono" style={{ fontSize: 11, color: "var(--tempo-orange)" }}>#{tag}</span>}
      </div>
    );
  }
  if (type === "link") return <a style={{ color: "var(--tempo-orange)", textDecoration: "none", borderBottom: "1px dashed var(--tempo-orange-soft)", fontFamily: "var(--font-serif)" }}>[[{children}]]</a>;
  return <>{children}</>;
};

/* ---------- Screen 40: Daily Note (NotePlan-style 3-pane) ---------- */
const ScreenDailyNote = () => {
  const [tasks, setTasks] = useState({ a: false, b: true, c: false, d: false, e: false });
  const [delight, setDelight] = useState(0);
  const [breath, setBreath] = useState(false);
  const [query, setQuery] = useState("");
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBreath(true), 6000);
    return () => clearTimeout(t);
  }, []);

  const toggle = (k) => {
    setTasks(t => {
      const next = { ...t, [k]: !t[k] };
      if (!t[k]) setDelight(d => d + 1);
      return next;
    });
  };

  const doneCount = Object.values(tasks).filter(Boolean).length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 340px", height: "100vh", fontFamily: "var(--font-sans)", background: "var(--surface-page)" }}>

      {/* -------- LEFT: Calendar rail (NotePlan-style) -------- */}
      <aside style={{ borderRight: "1px solid var(--border-soft)", padding: "var(--space-4) var(--space-3)", overflowY: "auto", background: "var(--surface-card)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px 16px" }}>
          <svg width="24" height="20" viewBox="0 0 64 56" fill="none"><defs><linearGradient id="bmd" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#D97757"/><stop offset="100%" stopColor="#E8A87C"/></linearGradient></defs><path d="M14 16 H50" stroke="url(#bmd)" strokeWidth="5" strokeLinecap="round"/><path d="M32 16 V46" stroke="url(#bmd)" strokeWidth="5" strokeLinecap="round"/><circle cx="42" cy="44" r="6" fill="url(#bmd)"/></svg>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 18 }}>Tempo<em style={{ fontStyle: "normal", fontWeight: 600, fontFamily: "var(--font-sans)" }}>Flow</em></span>
        </div>

        {/* Month mini */}
        <div style={{ padding: "4px 6px" }}>
          <div className="row-apart" style={{ marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 500 }}>April 2026</span>
            <div className="row-tight"><button className="icon-btn" style={{ width: 22, height: 22 }}><I.ChevronDown size={14} style={{ transform: "rotate(90deg)" }}/></button><button className="icon-btn" style={{ width: 22, height: 22 }}><I.ChevronDown size={14} style={{ transform: "rotate(-90deg)" }}/></button></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--fg-muted)", marginBottom: 4, textAlign: "center" }}>
            {["M","T","W","T","F","S","S"].map((d, i) => <span key={i}>{d}</span>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {Array.from({ length: 30 }, (_, i) => {
              const d = i + 1, active = d === 23, hasNote = [3,7,14,15,18,20,21,22,23].includes(d);
              return (
                <button key={i} style={{
                  aspectRatio: "1", border: "none",
                  background: active ? "var(--tempo-orange)" : "transparent",
                  color: active ? "#fff" : hasNote ? "var(--fg)" : "var(--fg-muted)",
                  fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: hasNote ? 600 : 400,
                  borderRadius: 6, cursor: "pointer", position: "relative",
                }}>
                  {d}
                  {hasNote && !active && <span style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 3, height: 3, borderRadius: "50%", background: "var(--tempo-orange)" }}/>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Period notes */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", color: "var(--fg-muted)", padding: "6px 10px", textTransform: "uppercase" }}>Period notes</div>
          {[["Today", "2026-04-23", true],["This week", "2026-W17"],["April","2026-04"],["2026","2026"]].map(([l, f, a], i) => (
            <button key={i} className={"nav-item" + (a ? " is-active" : "")} style={{ fontSize: 13 }}>
              <span>{l}</span>
              <span className="mono" style={{ fontSize: 10, color: "var(--fg-muted)", marginLeft: "auto" }}>{f}</span>
            </button>
          ))}
        </div>

        {/* Folders */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", color: "var(--fg-muted)", padding: "6px 10px", textTransform: "uppercase" }}>Folders</div>
          {[["📁","Projects",4],["📁","Meetings",12],["📁","Journal",31],["📁","Inbox",2]].map(([i, l, n], k) => (
            <button key={k} className="nav-item" style={{ fontSize: 13 }}><span style={{ marginRight: 4, fontSize: 12 }}>{i}</span><span>{l}</span><span className="badge">{n}</span></button>
          ))}
        </div>

        {/* Tags */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", color: "var(--fg-muted)", padding: "6px 10px", textTransform: "uppercase" }}>Tags</div>
          {["writing","launch","health","ideas","deep"].map((t, i) => (
            <button key={i} className="nav-item" style={{ fontSize: 13, color: "var(--tempo-orange)" }}><span className="mono">#{t}</span></button>
          ))}
        </div>
      </aside>

      {/* -------- MIDDLE: Markdown editor (day note) -------- */}
      <main style={{ overflowY: "auto", position: "relative" }}>
        {/* Topbar */}
        <div style={{ position: "sticky", top: 0, zIndex: 5, background: "var(--surface-page)", borderBottom: "1px solid var(--border-soft)", padding: "12px 32px", display: "flex", alignItems: "center", gap: 16 }}>
          <div className="row-tight">
            <button className="icon-btn" style={{ width: 28, height: 28 }}><I.ChevronDown size={14} style={{ transform: "rotate(90deg)" }}/></button>
            <button className="icon-btn" style={{ width: 28, height: 28 }}><I.ChevronDown size={14} style={{ transform: "rotate(-90deg)" }}/></button>
          </div>
          <span className="mono caption">2026-04-23.md</span>
          <span style={{ flex: 1 }}/>
          <button onClick={() => setCmdOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface-sunken)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--fg-muted)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
            <I.Search size={13}/> Quick switch… <kbd style={{ marginLeft: 8, fontSize: 10, padding: "1px 6px", background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 4, fontFamily: "var(--font-mono)" }}>⌘K</kbd>
          </button>
          <button className="icon-btn"><I.Share/></button>
          <button className="icon-btn"><I.Settings/></button>
        </div>

        {/* Note body */}
        <article style={{ maxWidth: 720, margin: "0 auto", padding: "32px 32px 140px", position: "relative" }}>
          <Delight trigger={delight}/>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", color: "var(--tempo-orange)", textTransform: "uppercase", marginBottom: 6 }}>Thursday · April 23 · Week 17</div>
          <MDBlock type="h1">☀️ Today</MDBlock>

          <MDBlock type="quote">Three things look doable this afternoon. I pulled them from your dump — the worry I parked for tomorrow.</MDBlock>

          <MDBlock type="h2"><span>Intentions</span></MDBlock>
          <MDBlock type="p">Ship the 1.0 launch post draft by noon. Protect the afternoon for deep work. Don't skip the walk.</MDBlock>

          <MDBlock type="h2"><span>Tasks</span></MDBlock>
          <MDBlock type="task" done={tasks.a} onToggle={() => toggle("a")} time="08:00" energy="low">Morning pages — <MDBlock type="link">Journal</MDBlock></MDBlock>
          <MDBlock type="task" done={tasks.b} onToggle={() => toggle("b")} time="09:30" energy="high" tag="writing">Draft launch post, first pass</MDBlock>
          <MDBlock type="task" done={tasks.c} onToggle={() => toggle("c")} time="12:30" energy="low">Ten-minute walk (non-negotiable)</MDBlock>
          <MDBlock type="task" done={tasks.d} onToggle={() => toggle("d")} time="14:00" energy="med" tag="launch">Respond to founder Qs in <MDBlock type="link">Tempo 1.0</MDBlock></MDBlock>
          <MDBlock type="task" done={tasks.e} onToggle={() => toggle("e")} time="17:00" energy="low">Evening shutdown — close loops, set tomorrow</MDBlock>

          <MDBlock type="h2"><span>Notes</span></MDBlock>
          <MDBlock type="p">Sam replied on Convex — he's bullish, wants a 30-min pairing session this week. Linking: <MDBlock type="link">Convex migration</MDBlock>.</MDBlock>
          <MDBlock type="p">Idea: the brain dump sort accuracy jumps if we include time-of-day as a signal. Worth a small A/B next sprint.</MDBlock>

          <MDBlock type="h2"><span>Linked mentions</span></MDBlock>
          <div style={{ background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 14, fontSize: 13 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", color: "var(--fg-muted)", textTransform: "uppercase", marginBottom: 8 }}>3 backlinks · #writing</div>
            {[
              ["2026-04-22.md","Got the structure for launch post — three sections, intro is hardest."],
              ["Projects/Tempo 1.0.md","Launch post is blocked on copy for the coach section."],
              ["2026-04-18.md","Realized the landing page and launch post share 60% of the argument."],
            ].map(([f, q], i) => (
              <div key={i} style={{ padding: "6px 0", borderTop: i ? "1px solid var(--border-soft)" : "none" }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--tempo-orange)", marginBottom: 2 }}>{f}</div>
                <div style={{ color: "var(--fg-soft)", lineHeight: 1.5 }}>{q}</div>
              </div>
            ))}
          </div>

          <BreathBubble show={breath}/>
        </article>

        {/* Command bar overlay */}
        {cmdOpen && (
          <div onClick={() => setCmdOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)", backdropFilter: "blur(4px)", zIndex: 20, display: "flex", justifyContent: "center", paddingTop: 80 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: 560, height: "fit-content", background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-lift)" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-soft)", display: "flex", gap: 10, alignItems: "center" }}>
                <I.Search size={16}/>
                <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Jump to note, run command, or /summarize…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 15, fontFamily: "var(--font-sans)" }}/>
              </div>
              <div style={{ padding: 6, maxHeight: 320, overflowY: "auto" }}>
                {[
                  { k: "→", t: "Open today's note", m: "2026-04-23.md" },
                  { k: "→", t: "Go to this week", m: "2026-W17.md" },
                  { k: "◎", t: "Start 25-min focus on 'Draft launch post'", m: "pomodoro" },
                  { k: "✨", t: "/summarize this note (AI)", m: "rewrite · summarize · expand" },
                  { k: "#", t: "Search tag #writing", m: "4 notes · 12 tasks" },
                  { k: "[[", t: "Insert link to Convex migration", m: "Projects/" },
                ].map((x, i) => (
                  <div key={i} style={{ padding: "10px 14px", display: "flex", gap: 12, alignItems: "center", borderRadius: 8, cursor: "pointer", fontSize: 14 }} onMouseEnter={e => e.currentTarget.style.background = "var(--surface-sunken)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span className="mono" style={{ width: 20, color: "var(--tempo-orange)" }}>{x.k}</span>
                    <span style={{ flex: 1 }}>{x.t}</span>
                    <span className="mono caption">{x.m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* -------- RIGHT: Calendar + time blocks + ADHD widgets -------- */}
      <aside style={{ borderLeft: "1px solid var(--border-soft)", padding: "var(--space-4)", overflowY: "auto", background: "var(--surface-card)" }}>

        {/* Progress + streak */}
        <div style={{ padding: 14, background: "var(--surface-sunken)", borderRadius: 14, marginBottom: 14 }}>
          <div className="row-apart" style={{ marginBottom: 10 }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 500 }}>Today's rhythm</span>
            <span className="mono caption">{doneCount}/5</span>
          </div>
          <div style={{ height: 6, background: "var(--border-soft)", borderRadius: 99, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", width: `${(doneCount/5)*100}%`, background: "var(--gradient-tempo)", borderRadius: 99, transition: "width 400ms cubic-bezier(.34,1.56,.64,1)" }}/>
          </div>
          <div className="row-apart" style={{ fontSize: 11, color: "var(--fg-muted)" }}>
            <span>5-day streak</span>
            <StreakDots/>
          </div>
        </div>

        {/* Focus ring widget */}
        <div style={{ padding: 16, background: "var(--surface-sunken)", borderRadius: 14, marginBottom: 14, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", color: "var(--fg-muted)", textTransform: "uppercase", marginBottom: 12 }}>In focus · draft launch post</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><FocusRing minutes={25} running={true}/></div>
          <div className="row" style={{ justifyContent: "center", gap: 6 }}>
            <button className="btn btn-sm btn-ghost" style={{ fontSize: 11 }}>− 5m</button>
            <button className="btn btn-sm btn-primary" style={{ fontSize: 11 }}>Pause</button>
            <button className="btn btn-sm btn-ghost" style={{ fontSize: 11 }}>+ 5m</button>
          </div>
        </div>

        {/* Time blocks (NotePlan-style) */}
        <div style={{ marginBottom: 14 }}>
          <div className="row-apart" style={{ marginBottom: 10, padding: "0 4px" }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 500 }}>Time blocks</span>
            <button className="icon-btn" style={{ width: 22, height: 22 }}><I.Plus size={12}/></button>
          </div>
          <div style={{ position: "relative", paddingLeft: 38 }}>
            {[
              { start: 8, end: 8.25, title: "Morning pages", tone: "moss", done: true },
              { start: 9.5, end: 10.5, title: "Draft launch post", tone: "orange", now: true },
              { start: 10.5, end: 11, title: "Break", tone: "soft" },
              { start: 11, end: 12, title: "Coach Q&A", tone: "amber" },
              { start: 12.5, end: 12.75, title: "Walk", tone: "moss" },
              { start: 14, end: 14.5, title: "Founder Qs", tone: "orange" },
              { start: 17, end: 17.5, title: "Shutdown", tone: "soft" },
            ].map((b, i) => {
              const top = (b.start - 8) * 36;
              const h = (b.end - b.start) * 36;
              const toneBg = { moss: "var(--moss-100)", orange: "var(--tempo-orange-soft)", amber: "var(--amber-100)", soft: "var(--surface-sunken)" }[b.tone];
              const toneBar = { moss: "var(--moss-600)", orange: "var(--tempo-orange)", amber: "var(--amber-600)", soft: "var(--border-strong)" }[b.tone];
              const timeLabel = (t) => `${Math.floor(t)}:${String(Math.round((t%1)*60)).padStart(2,"0")}`;
              return (
                <div key={i} style={{ position: "absolute", left: 0, right: 0, top }}>
                  <span className="mono caption" style={{ position: "absolute", left: -38, top: 2, width: 32, textAlign: "right", color: "var(--fg-muted)", fontSize: 10 }}>{timeLabel(b.start)}</span>
                  <div style={{
                    height: h - 2, borderRadius: 8, background: toneBg, paddingLeft: 10, paddingTop: Math.max(2, (h-20)/2),
                    borderLeft: `3px solid ${toneBar}`, fontSize: 12, fontWeight: 500,
                    color: b.done ? "var(--fg-muted)" : "var(--fg)", textDecoration: b.done ? "line-through" : "none",
                    position: "relative", overflow: "hidden",
                  }}>
                    {b.title}
                    {b.now && <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 3, background: toneBar, animation: "tf-pulse 2s ease-in-out infinite" }}/>}
                  </div>
                </div>
              );
            })}
            <div style={{ height: 11 * 36 }}/>
            <style>{`@keyframes tf-pulse { 0%,100% { opacity: 1 } 50% { opacity: .3 } }`}</style>
          </div>
        </div>

        {/* Quick capture */}
        <div style={{ padding: 12, background: "var(--surface-sunken)", border: "1px dashed var(--border)", borderRadius: 12, marginBottom: 14 }}>
          <div className="row-tight" style={{ marginBottom: 8 }}>
            <I.Sparkles size={13} style={{ color: "var(--tempo-orange)" }}/>
            <span style={{ fontSize: 12, fontWeight: 500 }}>Quick dump</span>
          </div>
          <textarea placeholder="brain too full? type it out. we'll sort later." style={{ width: "100%", minHeight: 60, border: "none", background: "transparent", outline: "none", resize: "none", fontSize: 13, fontFamily: "var(--font-serif)", color: "var(--fg)", lineHeight: 1.5 }}/>
        </div>

        {/* Templates */}
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", color: "var(--fg-muted)", padding: "6px 4px", textTransform: "uppercase" }}>Insert template</div>
          {[["☀️","Simple daily"],["🧭","Weekly review"],["🗣","Meeting notes"],["✍️","Journal prompt"]].map(([i, l], k) => (
            <button key={k} style={{ width: "100%", display: "flex", gap: 10, padding: "8px 10px", background: "transparent", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "var(--fg)", textAlign: "left", alignItems: "center" }} onMouseEnter={e => e.currentTarget.style.background = "var(--surface-sunken)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ fontSize: 14 }}>{i}</span><span>{l}</span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
};

Object.assign(window, { ScreenDailyNote, FocusRing, StreakDots, BreathBubble, Delight, MDBlock });
