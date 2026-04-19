/* Tempo Flow — Screens Part 4: Settings, Profile, Integrations, Trial, Accessibility, Ask Founder, Notifications */

/* ---- Screen 32: Settings · Profile ---- */
const ScreenSettingsProfile = () => (
  <>
    <Topbar title="Settings · Profile" crumb="Settings"/>
    <div className="page-narrow">
      <div className="page-header"><div className="eyebrow">Settings</div><h1>Profile.</h1></div>
      <div className="card">
        <div className="row" style={{ marginBottom: "var(--space-6)" }}>
          <div style={{ width: 64, height: 64, borderRadius: 99, background: "var(--gradient-tempo)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 500 }}>A</div>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 500 }}>Amit Levin</div><div className="caption">amitlevin65@protonmail.com · Pro plan</div></div>
          <button className="btn btn-sm btn-outline">Change photo</button>
        </div>
        <div className="stack-4">
          <div className="field"><label>Display name</label><input defaultValue="Amit"/></div>
          <div className="field"><label>Pronouns</label><input defaultValue="he/him"/></div>
          <div className="field"><label>Bio</label><textarea defaultValue="Building Tempo Flow, slowly, on cream paper."/></div>
          <div className="field"><label>One wobble (the thing that overwhelms you)</label><input defaultValue="Shipping feels like a cathedral I can't enter on low-spoons days."/><div className="help">Coach uses this to frame suggestions gently.</div></div>
        </div>
      </div>
    </div>
  </>
);

/* ---- Screen 33: Settings · Preferences (Appearance + Accessibility) ---- */
const ScreenSettingsPreferences = () => {
  const { theme, setTheme, resolvedTheme, dyslexia, setDyslexia, readAloud, setReadAloud } = useApp();
  const [dens, setDens] = useState("default");
  const [font, setFont] = useState(1);
  const [motion, setMotion] = useState(false);
  const [accent, setAccent] = useState("orange");

  const ThemeTile = ({ id, label, icon: Ic, desc, preview }) => {
    const active = theme === id;
    return (
      <button
        onClick={() => setTheme(id)}
        className={active ? "theme-tile is-active" : "theme-tile"}
        style={{
          textAlign:"left", cursor:"pointer", padding:0, border: active ? "2px solid var(--tempo-orange)" : "1px solid var(--border)",
          background:"var(--surface-card)", borderRadius:14, overflow:"hidden",
          boxShadow: active ? "0 0 0 4px color-mix(in oklab, var(--tempo-orange) 15%, transparent)" : "none",
          transition:"all 160ms var(--ease)",
        }}>
        {preview}
        <div style={{padding:"12px 14px", borderTop:"1px solid var(--border-soft)"}}>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <Ic size={15} stroke={1.6}/>
            <div style={{fontWeight:600, fontSize:14}}>{label}</div>
            {active && <div style={{marginLeft:"auto", width:16, height:16, borderRadius:99, background:"var(--tempo-orange)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center"}}><I.Check size={10} stroke={3}/></div>}
          </div>
          <div className="caption" style={{marginTop:4}}>{desc}</div>
        </div>
      </button>
    );
  };

  const MiniPreview = ({ bg, ink, soft, muted, accentColor = "#E07A3B" }) => (
    <div style={{background:bg, height:104, padding:"10px 12px", display:"flex", flexDirection:"column", gap:6, fontFamily:"var(--font-sans)"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{fontFamily:"var(--font-serif)", fontWeight:500, fontSize:12, color:ink, letterSpacing:"-0.01em"}}>Today</div>
        <div style={{width:6, height:6, borderRadius:99, background:accentColor}}/>
      </div>
      <div style={{display:"flex", alignItems:"center", gap:6, background:soft, padding:"4px 7px", borderRadius:5}}>
        <div style={{width:8, height:8, borderRadius:2, border:`1px solid ${muted}`}}/>
        <div style={{height:4, flex:1, borderRadius:99, background:muted, opacity:0.55}}/>
      </div>
      <div style={{display:"flex", alignItems:"center", gap:6, background:soft, padding:"4px 7px", borderRadius:5}}>
        <div style={{width:8, height:8, borderRadius:2, background:accentColor}}/>
        <div style={{height:4, flex:1, borderRadius:99, background:muted, opacity:0.35}}/>
      </div>
      <div style={{height:4, width:"60%", borderRadius:99, background:muted, opacity:0.25, marginTop:2}}/>
    </div>
  );

  return (
    <>
      <Topbar title="Settings · Preferences" crumb="Settings"/>
      <div className="page-narrow">
        <div className="page-header">
          <div className="eyebrow">Settings</div>
          <h1>Preferences.</h1>
          <p className="lede">Tempo Flow adapts to your brain — not the other way around.</p>
        </div>

        <div className="stack">
          {/* Appearance */}
          <div className="card">
            <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:"var(--space-4)"}}>
              <h3 style={{margin:0}}>Appearance</h3>
              <div className="caption">
                {theme === "system"
                  ? <>Following your OS · currently <strong style={{color:"var(--fg)"}}>{resolvedTheme}</strong></>
                  : <>Fixed to <strong style={{color:"var(--fg)"}}>{theme}</strong></>}
              </div>
            </div>

            <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14, marginBottom:"var(--space-5)"}}>
              <ThemeTile id="light" label="Light" icon={I.Sun} desc="Calm paper. Daylight work."
                preview={<MiniPreview bg="#FAF6EF" ink="#1A1614" soft="#F1EADD" muted="#6A655C" accentColor="#E07A3B"/>}/>
              <ThemeTile id="dark" label="Dark" icon={I.Moon} desc="Dim ink. Evenings & focus."
                preview={<MiniPreview bg="#15130F" ink="#F2EEE6" soft="#1F1C18" muted="#8B857A" accentColor="#E07A3B"/>}/>
              <ThemeTile id="system" label="System" icon={I.Laptop} desc="Follow your device."
                preview={
                  <div style={{position:"relative", height:104}}>
                    <div style={{position:"absolute", inset:0, clipPath:"polygon(0 0, 100% 0, 0 100%)"}}>
                      <MiniPreview bg="#FAF6EF" ink="#1A1614" soft="#F1EADD" muted="#6A655C" accentColor="#E07A3B"/>
                    </div>
                    <div style={{position:"absolute", inset:0, clipPath:"polygon(100% 0, 100% 100%, 0 100%)"}}>
                      <MiniPreview bg="#15130F" ink="#F2EEE6" soft="#1F1C18" muted="#8B857A" accentColor="#E07A3B"/>
                    </div>
                  </div>
                }/>
            </div>

            <div className="stack-4">
              <div className="field"><label>Density</label>
                <div className="seg-control">
                  {["compact","default","comfortable"].map(d => <button key={d} className={dens===d?"is-active":""} onClick={() => setDens(d)}>{d}</button>)}
                </div>
              </div>
              <div className="field"><label>Accent</label>
                <div className="row-tight">
                  {[
                    ["orange","var(--tempo-orange)"],
                    ["moss","#4A7C59"],
                    ["slate","#6E88A7"],
                    ["amber","#D4A44C"],
                    ["rust","#C8553D"],
                  ].map(([id,c]) => (
                    <button key={id} onClick={() => setAccent(id)}
                      aria-label={`Accent ${id}`}
                      style={{ width: 32, height: 32, padding:0, borderRadius: 99, background: c,
                               border: accent===id ? "2px solid var(--fg)" : "1px solid var(--border)", cursor:"pointer"}}/>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div className="card">
            <h3 style={{ marginBottom: "var(--space-4)" }}>Accessibility</h3>
            <div className="stack-4">
              <div className="field"><label>Text size</label>
                <div className="row-tight">{[0.9,1,1.15,1.3].map(s => <button key={s} className={"btn btn-sm "+(font===s?"btn-primary":"btn-outline")} onClick={() => setFont(s)}>{Math.round(s*16)}px</button>)}</div>
              </div>
              <div className="row-apart" style={{ padding: "12px 0", borderTop: "1px solid var(--border-soft)" }}>
                <div style={{flex:1, paddingRight:16}}>
                  <div style={{fontWeight:500}}>OpenDyslexic font</div>
                  <div className="caption">Replace all body + heading type with OpenDyslexic. Weighted bottoms anchor letters; wider letter spacing.</div>
                  {dyslexia === "on" && (
                    <div style={{marginTop:10, padding:"10px 12px", background:"var(--surface-sunken)", borderRadius:8, fontSize:13, color:"var(--fg-muted)"}}>
                      The quick brown fox jumps over the lazy dog. <span style={{fontFamily:"var(--font-serif)", color:"var(--fg)"}}>Sunday · 2:14pm</span>
                    </div>
                  )}
                </div>
                <Toggle on={dyslexia === "on"} onChange={(v) => setDyslexia(v ? "on" : "off")}/>
              </div>
              <div className="row-apart" style={{ padding: "12px 0", borderTop: "1px solid var(--border-soft)" }}>
                <div style={{flex:1, paddingRight:16}}>
                  <div style={{fontWeight:500}}>Read aloud on right-click</div>
                  <div className="caption">Select any text, right-click, and Tempo reads it. Works on tasks, notes, journal, chat. Use the speaker icon on any heading to listen too.</div>
                  {readAloud === "on" && (
                    <div style={{marginTop:10, display:"flex", gap:8, alignItems:"center"}}>
                      <button className="btn btn-sm btn-outline" onClick={() => window.TempoTheme?.speak?.("Here is a sample. The coach voice is calm, a bit slower than default, with a gentle pause at commas.")}>
                        <I.Volume size={14} stroke={1.6}/> Preview voice
                      </button>
                      <button className="btn btn-sm btn-ghost" onClick={() => window.TempoTheme?.stopSpeaking?.()}>Stop</button>
                    </div>
                  )}
                </div>
                <Toggle on={readAloud === "on"} onChange={(v) => setReadAloud(v ? "on" : "off")}/>
              </div>
              <div className="row-apart" style={{ padding: "12px 0", borderTop: "1px solid var(--border-soft)" }}>
                <div style={{flex:1, paddingRight:16}}>
                  <div style={{fontWeight:500}}>Reduce motion</div>
                  <div className="caption">Opacity-only transitions. No translate or scale.</div>
                </div>
                <Toggle on={motion} onChange={setMotion}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Toggle = ({ on, onChange }) => (
  <button onClick={() => onChange(!on)} role="switch" aria-checked={on}
    style={{ width: 44, height: 24, borderRadius: 99, background: on ? "var(--tempo-orange)" : "var(--border)", border: 0, position: "relative", cursor: "pointer", transition: "background 220ms var(--ease)" }}>
    <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: 99, background: "#fff", transition: "left 220ms var(--ease)", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}/>
  </button>
);

/* ---- Screen 34: Settings · Integrations ---- */
const ScreenSettingsIntegrations = () => {
  const items = [
    { name: "Google Calendar", desc: "Two-way sync · Tempo 2.0", status: "Coming soon", icon: "Calendar" },
    { name: "Apple Calendar", desc: "Two-way sync · Tempo 2.0", status: "Coming soon", icon: "Calendar" },
    { name: "RevenueCat", desc: "Subscription + trial billing", status: "Connected", icon: "Zap" },
    { name: "PostHog", desc: "Opt-in aggregated analytics", status: "Connected", icon: "Chart" },
    { name: "Sentry", desc: "Error reports (anonymized)", status: "Connected", icon: "Shield" },
    { name: "OpenAI / Anthropic", desc: "Bring your own key · Tempo 1.5", status: "Locked", icon: "Sparkles" },
  ];
  return (
    <>
      <Topbar title="Settings · Integrations" crumb="Settings"/>
      <div className="page-narrow">
        <div className="page-header"><div className="eyebrow">Settings</div><h1>Integrations.</h1><p className="lede">Calendar and bring-your-own-AI-key land in 1.5 and 2.0. Anything you connect is visible here, always.</p></div>
        <div className="card">
          <div className="stack-3">
            {items.map(it => {
              const Ic = I[it.icon];
              const tone = it.status === "Connected" ? "moss" : it.status === "Locked" ? "neutral" : "amber";
              return (
                <div key={it.name} className="row-apart" style={{ padding: 14, background: "var(--surface-sunken)", borderRadius: 10 }}>
                  <div className="row"><div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--surface-card)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--tempo-orange)" }}><Ic size={18}/></div><div><div style={{ fontWeight: 500 }}>{it.name}</div><div className="caption">{it.desc}</div></div></div>
                  <Pill tone={tone}>{it.status}</Pill>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

/* ---- Screen 28: Trial & Billing ---- */
const ScreenBilling = () => (
  <>
    <Topbar title="Trial & billing" crumb="Settings"/>
    <div className="page-narrow">
      <div className="page-header"><div className="eyebrow">Trial & billing</div><h1>Your seven-day walk.</h1><p className="lede">A dollar buys a week. Keep going, pause, or walk away — all are fine.</p></div>
      <div className="card" style={{ background: "var(--gradient-tempo)", color: "#fff", border: 0 }}>
        <div className="row-apart" style={{ marginBottom: "var(--space-6)" }}>
          <div><div style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.85 }}>Trial · day 4 of 7</div><div style={{ fontFamily: "var(--font-serif)", fontSize: 40, fontWeight: 500 }}>3 days left</div></div>
          <I.Pebble size={48} stroke={1.5}/>
        </div>
        <div style={{ background: "rgba(255,255,255,0.22)", borderRadius: 99, height: 8, overflow: "hidden" }}>
          <div style={{ width: "57%", height: "100%", background: "#fff" }}/>
        </div>
        <div className="row-tight" style={{ marginTop: "var(--space-5)" }}>
          <button className="btn btn-outline" style={{ background: "#fff", color: "var(--tempo-orange)", borderColor: "#fff" }}>Keep going · pick a plan</button>
          <button className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>Pause for a month</button>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: "var(--space-8)" }}>
        {[
          { name: "Basic", price: "$6", per: "/mo", desc: "Tasks, notes, journal, habits, routines, goals. Coach at gentle warmth.", cta: "Choose Basic" },
          { name: "Pro", price: "$12", per: "/mo", desc: "Everything in Basic + full Coach scope, templates, weekly AI recaps.", cta: "Choose Pro", featured: true },
          { name: "Max", price: "$24", per: "/mo", desc: "Pro + voice-first dictation, bring-your-own-key, priority founder replies.", cta: "Choose Max" },
        ].map(p => (
          <div key={p.name} className={"card" + (p.featured ? "" : "")} style={p.featured ? { border: "1.5px solid var(--tempo-orange)", background: "var(--cream-raised)" } : {}}>
            <div className="row-apart" style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 500 }}>{p.name}</div>
              {p.featured && <Pill tone="accent">Most picked</Pill>}
            </div>
            <div style={{ marginBottom: 12 }}><span style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 500 }}>{p.price}</span><span style={{ color: "var(--fg-muted)" }}>{p.per}</span></div>
            <p style={{ fontSize: 14, color: "var(--fg-muted)", marginBottom: "var(--space-5)", minHeight: 60 }}>{p.desc}</p>
            <button className={"btn " + (p.featured ? "btn-gradient" : "btn-outline")} style={{ width: "100%" }}>{p.cta}</button>
          </div>
        ))}
      </div>
      <div className="caption" style={{ textAlign: "center", marginTop: "var(--space-6)" }}>Billed via RevenueCat. Annual saves 20%. No free tier — commitment is the filter.</div>
    </div>
  </>
);

/* ---- Screen 29: Trial ended / paywall ---- */
const ScreenTrialEnd = () => (
  <>
    <Topbar title="Your seven days" crumb=""/>
    <div style={{ padding: "80px 24px", display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 520, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, margin: "0 auto var(--space-6)", borderRadius: 99, background: "var(--gradient-tempo)", display: "flex", alignItems: "center", justifyContent: "center" }}><BrandMark size={44}/></div>
        <h1 style={{ fontSize: 44, marginBottom: 16 }}>Your seven days end tomorrow.</h1>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--fg-muted)", lineHeight: 1.55, marginBottom: "var(--space-8)" }}>Keep going, pause, or walk away — all are fine. Your data stays yours either way, exportable as Markdown with a single click.</p>
        <div className="row-tight" style={{ justifyContent: "center" }}>
          <button className="btn btn-gradient btn-lg">Keep going · $12/mo</button>
          <button className="btn btn-outline btn-lg">Pause a month</button>
          <button className="btn btn-ghost btn-lg">Export & walk away</button>
        </div>
      </div>
    </div>
  </>
);

/* ---- Screen 35: Ask the Founder ---- */
const ScreenAskFounder = () => (
  <>
    <Topbar title="Ask the founder" crumb="Settings"/>
    <div className="page-narrow">
      <div className="page-header"><div className="eyebrow">Ask the founder</div><h1>A direct line.</h1><p className="lede">Tempo Flow is built by one person, Amit. Your question lands in his queue. Response time is currently <strong>48 hours</strong>.</p></div>
      <div className="card">
        <div className="field"><label>Your question, feedback, or bug</label><textarea defaultValue="Is there a way to make the brain dump sort tasks by energy instead of by time? I find I plan better that way on low-spoons days." style={{ minHeight: 140 }}/></div>
        <div className="row-apart" style={{ marginTop: "var(--space-4)" }}>
          <label className="row"><input type="checkbox" defaultChecked/><span style={{ fontSize: 14 }}>Share anonymized in the public transcript (opt-in)</span></label>
          <button className="btn btn-primary">Send to Amit</button>
        </div>
      </div>

      <div className="card sunken flat" style={{ marginTop: "var(--space-6)" }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Past replies</div>
        <div className="stack-4">
          {[
            { q: "Will there be a web-clipper?", a: "Not in 1.0. Probably 2.0 — ride-alongs are heavy. Meanwhile, email-in works." },
            { q: "Can I self-host?", a: "Yes, for your own individual use. See the LICENSE for the full grant." },
          ].map((e, i) => (
            <div key={i}>
              <div className="caption" style={{ marginBottom: 4 }}>You asked</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, marginBottom: 10 }}>{e.q}</div>
              <div className="caption" style={{ marginBottom: 4 }}>Amit replied</div>
              <div style={{ fontSize: 14, color: "var(--fg-muted)" }}>{e.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

/* ---- Screen 36: Notifications ---- */
const ScreenNotifications = () => (
  <>
    <Topbar title="Notifications" crumb="Settings"/>
    <div className="page-narrow">
      <div className="page-header"><div className="eyebrow">Settings</div><h1>Notifications.</h1><p className="lede">Fewer, quieter, specific. Quiet hours are on by default.</p></div>
      <div className="card">
        <div className="stack-3">
          {[
            { k: "Daily planning reminder", t: "8:15 AM", ch: ["push","in-app"] },
            { k: "Habit check-in", t: "end of each day", ch: ["push"] },
            { k: "Streak at-risk", t: "before bed", ch: ["in-app"] },
            { k: "Coach follow-up", t: "when they reply", ch: ["push","email"] },
            { k: "Plan review", t: "Friday 3 PM", ch: ["email"] },
            { k: "Overdue task nudge", t: "once, 24h after", ch: ["in-app"] },
            { k: "Ask-the-Founder reply", t: "when Amit replies", ch: ["email","push"] },
          ].map((n, i) => (
            <div key={i} className="row-apart" style={{ padding: "12px 0", borderBottom: i < 6 ? "1px solid var(--border-soft)" : 0 }}>
              <div><div style={{ fontWeight: 500 }}>{n.k}</div><div className="caption">{n.t}</div></div>
              <div className="row-tight">{n.ch.map(c => <Pill key={c} tone="neutral">{c}</Pill>)}<Toggle on={true} onChange={()=>{}}/></div>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ marginTop: "var(--space-6)" }}>
        <div className="row-apart"><div><div style={{ fontWeight: 500 }}>Quiet hours</div><div className="caption">10:00 PM → 7:30 AM · Mon–Sun</div></div><Toggle on={true} onChange={()=>{}}/></div>
      </div>
    </div>
  </>
);

Object.assign(window, { ScreenSettingsProfile, ScreenSettingsPreferences, ScreenSettingsIntegrations, ScreenBilling, ScreenTrialEnd, ScreenAskFounder, ScreenNotifications, Toggle });
