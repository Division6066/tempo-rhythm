/* Tempo Flow — Screens Part 5: Onboarding + Auth + Empty states */

/* ---- Screen 1: Sign in / Sign up ---- */
const ScreenSignIn = () => (
  <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--surface-page)" }}>
    <div style={{ padding: "var(--space-16) var(--space-12)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div className="row" style={{ gap: 10 }}><BrandMark size={28}/><Wordmark size={18}/></div>
      <div style={{ maxWidth: 420 }}>
        <h1 className="display" style={{ fontSize: 48, marginBottom: "var(--space-4)" }}>Welcome back.</h1>
        <p className="lede" style={{ marginBottom: "var(--space-8)" }}>Your brain's operating system, where you left it.</p>
        <div className="stack-4">
          <div className="field"><label>Email</label><input defaultValue="amit@tempoflow.app"/></div>
          <button className="btn btn-gradient btn-lg" style={{ width: "100%" }}><I.Mail size={16}/> Send magic link</button>
          <div className="row" style={{ gap: 12, margin: "var(--space-2) 0" }}>
            <div className="divider" style={{ flex: 1 }}/><span className="caption">or</span><div className="divider" style={{ flex: 1 }}/>
          </div>
          <button className="btn btn-outline btn-lg" style={{ width: "100%" }}><I.Shield size={16}/> Sign in with passkey</button>
        </div>
      </div>
      <div className="caption">By signing in, you agree to a seven-day, $1 trial. Cancel any time.</div>
    </div>
    <div style={{ background: "var(--gradient-tempo)", padding: "var(--space-16) var(--space-12)", display: "flex", flexDirection: "column", justifyContent: "center", color: "#fff" }}>
      <div className="eyebrow" style={{ color: "rgba(255,255,255,0.8)", marginBottom: "var(--space-4)" }}>A letter, not a form</div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 36, lineHeight: 1.25, letterSpacing: "-0.01em", marginBottom: "var(--space-6)" }}>"10 minute walk" beats "some movement." Small, gentle, specific — that's the whole planner.</div>
      <div className="row" style={{ gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: 99, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontWeight: 600 }}>A</div><div><div style={{ fontWeight: 500 }}>Amit Levin</div><div style={{ fontSize: 13, opacity: 0.8 }}>Founder · dogfooding Tempo 1.0</div></div></div>
    </div>
  </div>
);

/* ---- Screens 37–41: Onboarding (stepper, deep) ---- */
const ONB_STEPS = ["Welcome","Personalization","Template","Brain Dump","First Plan"];

const ScreenOnboarding = () => {
  const [step, setStep] = useState(() => parseInt(localStorage.getItem("tf-onb") || "0"));
  const [tags, setTags] = useState(["ADHD","Burnout"]);
  const [energy, setEnergy] = useState("morning");
  const [work, setWork] = useState("mixed");
  const [tpl, setTpl] = useState("Builder");
  const [dump, setDump] = useState("Finish the landing copy. Book dentist. Walk at noon. Worry: am I shipping fast enough?");
  const toggleTag = t => setTags(ts => ts.includes(t) ? ts.filter(x => x !== t) : [...ts, t]);
  useEffect(() => { localStorage.setItem("tf-onb", step); }, [step]);

  const next = () => setStep(s => Math.min(4, s+1));
  const prev = () => setStep(s => Math.max(0, s-1));

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "var(--space-5) var(--space-8)", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
        <div className="row" style={{ gap: 10 }}><BrandMark size={24}/><Wordmark size={16}/></div>
        <div className="row-tight">
          {ONB_STEPS.map((s, i) => (
            <div key={s} className="row-tight">
              <div style={{ width: 20, height: 20, borderRadius: 99, background: i <= step ? "var(--tempo-orange)" : "var(--border)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600 }}>{i+1}</div>
              {i < 4 && <div style={{ width: 28, height: 1, background: i < step ? "var(--tempo-orange)" : "var(--border)" }}/>}
            </div>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm">Skip</button>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-12) var(--space-8)" }}>
        <div style={{ width: "100%", maxWidth: 720 }}>
          {step === 0 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 96, height: 96, margin: "0 auto var(--space-6)", borderRadius: 24, background: "var(--gradient-tempo)", display: "flex", alignItems: "center", justifyContent: "center" }}><BrandMark size={56}/></div>
              <div className="eyebrow" style={{ marginBottom: "var(--space-2)" }}>Welcome</div>
              <h1 className="display" style={{ marginBottom: "var(--space-4)" }}>Your brain's operating system.</h1>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--fg-muted)", lineHeight: 1.55, maxWidth: 520, margin: "0 auto var(--space-8)" }}>A planner that feels like a letter from a thoughtful friend, not a form to fill. Tasks, notes, journal, calendar, habits — and a quiet coach who only moves things when you say yes.</p>
              <button className="btn btn-gradient btn-lg" onClick={next}>Get started<I.ArrowRight size={16}/></button>
              <div className="caption" style={{ marginTop: "var(--space-4)" }}>Takes four minutes. You can walk away any time.</div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Personalization · 1 of 5</div>
              <h1 style={{ fontSize: 40, marginBottom: "var(--space-2)" }}>Who does this need to work for?</h1>
              <p className="lede" style={{ marginBottom: "var(--space-8)" }}>Pick any that describe you. I'll tune the coach and the UI to match. Nothing is public.</p>
              <div className="grid-3" style={{ marginBottom: "var(--space-8)" }}>
                {["ADHD","Autism","Anxiety","Dyslexia","Burnout","Executive dysfunction","CPTSD","Low spoons / chronic","None — just a better system"].map(t => (
                  <button key={t} className="card" onClick={() => toggleTag(t)}
                    style={{ cursor: "pointer", textAlign: "left", border: tags.includes(t) ? "1.5px solid var(--tempo-orange)" : "1px solid var(--border)", background: tags.includes(t) ? "rgba(217,119,87,0.06)" : "var(--surface-card)", padding: "var(--space-4)" }}>
                    <div className="row-apart"><span style={{ fontWeight: 500 }}>{t}</span>{tags.includes(t) && <I.Check size={16} stroke={2}/>}</div>
                  </button>
                ))}
              </div>
              <div className="grid-2">
                <div className="card">
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Energy</div>
                  <div className="stack-2">{[["morning","Morning person"],["evening","Evening person"],["variable","Unpredictable"]].map(([k,v]) => <button key={k} className="row" onClick={() => setEnergy(k)} style={{ padding: 10, borderRadius: 8, background: energy===k?"var(--surface-sunken)":"transparent", border: energy===k?"1px solid var(--tempo-orange)":"1px solid transparent", cursor: "pointer", textAlign: "left" }}><div style={{ width: 18, height: 18, borderRadius: 99, border: "1.5px solid var(--border)", background: energy===k?"var(--tempo-orange)":"transparent" }}/>{v}</button>)}</div>
                </div>
                <div className="card">
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Work style</div>
                  <div className="stack-2">{[["deep","Deep focus, long blocks"],["sprint","Lots of short tasks"],["mixed","Mixed, depends on the day"]].map(([k,v]) => <button key={k} className="row" onClick={() => setWork(k)} style={{ padding: 10, borderRadius: 8, background: work===k?"var(--surface-sunken)":"transparent", border: work===k?"1px solid var(--tempo-orange)":"1px solid transparent", cursor: "pointer", textAlign: "left" }}><div style={{ width: 18, height: 18, borderRadius: 99, border: "1.5px solid var(--border)", background: work===k?"var(--tempo-orange)":"transparent" }}/>{v}</button>)}</div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Template · 2 of 5</div>
              <h1 style={{ fontSize: 40, marginBottom: "var(--space-2)" }}>Pick a starting shape.</h1>
              <p className="lede" style={{ marginBottom: "var(--space-8)" }}>You can change this any time, or mix them. I'll pre-populate your first planning session.</p>
              <div className="grid-3">
                {[
                  { k: "Student", d: "Courses, assignments, exam blocks. Weekly review on Sunday.", ic: "Book" },
                  { k: "Builder", d: "Projects with code context. Deep work anchors. Shutdown routine.", ic: "Zap" },
                  { k: "Daily Life", d: "Habits, chores, small joys. Gentle pacing for variable days.", ic: "Leaf" },
                ].map(c => {
                  const Ic = I[c.ic];
                  return (
                    <button key={c.k} className="card" onClick={() => setTpl(c.k)}
                      style={{ textAlign: "left", cursor: "pointer", border: tpl===c.k?"1.5px solid var(--tempo-orange)":"1px solid var(--border)", background: tpl===c.k?"rgba(217,119,87,0.06)":"var(--surface-card)", padding: "var(--space-6)" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--gradient-tempo)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--space-4)" }}><Ic size={22}/></div>
                      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, marginBottom: 6 }}>{c.k}</h3>
                      <p style={{ color: "var(--fg-muted)", fontSize: 14 }}>{c.d}</p>
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: "var(--space-6)" }}><button className="btn-link">Start blank instead</button></div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Brain Dump · 3 of 5</div>
              <h1 style={{ fontSize: 40, marginBottom: "var(--space-2)" }}>Tell me everything.</h1>
              <p className="lede" style={{ marginBottom: "var(--space-6)" }}>Don't organize it. Just type. I'll sort it after.</p>
              <div className="card">
                <textarea value={dump} onChange={e => setDump(e.target.value)} style={{ width: "100%", minHeight: 200, border: 0, background: "transparent", fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.65, resize: "vertical" }}/>
                <div className="row-apart" style={{ marginTop: 12 }}>
                  <span className="caption">{dump.split(/\s+/).length} words · encrypted</span>
                  <button className="btn btn-sm btn-outline"><I.Mic size={14}/>Dictate</button>
                </div>
              </div>
              <CoachBubble>Good. I'll sort this on the next screen and show you what I think goes where. You approve each one.</CoachBubble>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>First plan · 4 of 5</div>
              <h1 style={{ fontSize: 40, marginBottom: "var(--space-2)" }}>Three things for today.</h1>
              <p className="lede" style={{ marginBottom: "var(--space-8)" }}>Small and doable. The rest is parked — we'll revisit tomorrow.</p>
              <div className="card">
                <div className="stack-3">
                  {[
                    { title: "Finish the landing copy", time: "09:30", est: 45 },
                    { title: "Book dentist", time: "11:45", est: 5 },
                    { title: "Ten-minute walk", time: "12:30", est: 10 },
                  ].map((t, i) => (
                    <div key={i} className="row" style={{ padding: 14, background: "var(--surface-sunken)", borderRadius: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 99, background: "var(--gradient-tempo)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontSize: 14, fontWeight: 600 }}>{i+1}</div>
                      <div style={{ flex: 1 }}><div style={{ fontWeight: 500 }}>{t.title}</div><div className="caption">{t.time} · {t.est} min</div></div>
                      <button className="icon-btn"><I.Edit size={14}/></button>
                      <button className="icon-btn"><I.X size={14}/></button>
                    </div>
                  ))}
                </div>
                <AcceptStrip text="Looks small on purpose. You can add more after — but let's start here."/>
              </div>
              <div style={{ marginTop: "var(--space-6)", padding: "var(--space-4)", border: "1px solid var(--border)", borderRadius: 12 }}>
                <div className="row-apart"><span style={{ fontWeight: 500 }}>Create your account to save this</span><button className="btn btn-gradient">Continue · $1 trial<I.ArrowRight size={14}/></button></div>
                <div className="caption" style={{ marginTop: 6 }}>Magic link or passkey. Seven days for a dollar. Cancel in two taps.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer style={{ padding: "var(--space-5) var(--space-8)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
        <button className="btn btn-ghost" onClick={prev} disabled={step === 0}><I.ArrowLeft size={16}/>Back</button>
        <div className="caption mono">{step+1} / 5</div>
        <button className="btn btn-primary" onClick={next} disabled={step === 4}>Continue<I.ArrowRight size={16}/></button>
      </footer>
    </div>
  );
};

/* ---- Screen 24: Empty state gallery (meta) ---- */
const ScreenEmptyStates = () => (
  <>
    <Topbar title="Empty states" crumb="System"/>
    <div className="page">
      <div className="page-header"><div className="eyebrow">System · Empty states</div><h1>Gentle, never pressuring.</h1></div>
      <div className="grid-2">
        {[
          { t: "Tasks", h: "Nothing planned yet.", s: "Want me to suggest three things based on yesterday?", cta: "Suggest three", ic: "CheckSquare" },
          { t: "Notes", h: "A clean cream page.", s: "Start a note, or paste from anywhere. Markdown works.", cta: "New note", ic: "Notebook" },
          { t: "Journal", h: "No entries yet.", s: "Two minutes, three sentences. That counts.", cta: "Two minutes", ic: "BookOpen" },
          { t: "Habits", h: "No habits yet.", s: "Pebbles, not trophies. Start with one small thing.", cta: "Add a pebble", ic: "Pebble" },
        ].map(e => {
          const Ic = I[e.ic];
          return (
            <div key={e.t} className="card" style={{ padding: "var(--space-10)", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 99, background: "var(--surface-sunken)", color: "var(--tempo-orange)", margin: "0 auto var(--space-4)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic size={24}/></div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>{e.t}</div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, marginBottom: 6 }}>{e.h}</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: 14, marginBottom: "var(--space-5)" }}>{e.s}</p>
              <button className="btn btn-primary btn-sm">{e.cta}</button>
            </div>
          );
        })}
      </div>
    </div>
  </>
);

Object.assign(window, { ScreenSignIn, ScreenOnboarding, ScreenEmptyStates, ONB_STEPS });
