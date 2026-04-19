/* Tempo Flow — Screens Part 6: Mobile frames (30–31 in spec), Changelog (25), About (26), Credits (27) */

const Phone = ({ children, title = "Today" }) => (
  <div style={{ width: 340, background: "#131312", padding: 10, borderRadius: 44, boxShadow: "var(--shadow-lift)" }}>
    <div style={{ background: "var(--surface-page)", borderRadius: 34, overflow: "hidden", height: 680, position: "relative", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px 20px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="mono caption" style={{ fontWeight: 600 }}>9:41</span>
        <div style={{ width: 100, height: 26, background: "#131312", borderRadius: 99 }}/>
        <span className="caption">⏺ ◉ ●</span>
      </div>
      <div style={{ padding: "var(--space-4) var(--space-4) var(--space-2)" }}>
        <div className="row-apart">
          <div><div className="eyebrow" style={{ marginBottom: 2 }}>Thu · Apr 23</div><h2 style={{ fontSize: 22 }}>{title}</h2></div>
          <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--gradient-tempo)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontFamily: "var(--font-serif)", fontWeight: 600 }}>A</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-2) var(--space-4) var(--space-10)" }}>{children}</div>
      <div style={{ position: "absolute", bottom: 10, left: 14, right: 14, background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 10, display: "flex", justifyContent: "space-around", boxShadow: "var(--shadow-whisper)" }}>
        {[["Home", I.Home, true],["Dump", I.Sparkles],["Coach", I.Mic],["Library", I.Layers],["You", I.User]].map(([k, Ic, a], i) => (
          <button key={i} className="icon-btn" style={{ color: a ? "var(--tempo-orange)" : "var(--fg-muted)" }}><Ic size={20}/></button>
        ))}
      </div>
    </div>
  </div>
);

/* ---- Screen 25: Mobile Today ---- */
const ScreenMobileToday = () => (
  <>
    <Topbar title="Mobile · Today" crumb="Mobile"/>
    <div className="page-tight">
      <div className="page-header"><div className="eyebrow">Mobile · iOS / Android</div><h1>Same language, pocket-sized.</h1><p className="lede">Shared styling via NativeWind. All the same anchors and warmth — just tighter spacing and bigger hit targets.</p></div>
      <div style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap", padding: "var(--space-8)" }}>
        <Phone title="Today">
          <div className="stack-3">
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, lineHeight: 1.5, color: "var(--fg-muted)", padding: "6px 2px" }}>Three things look doable this afternoon.</div>
            {[{ t: "Morning pages", m: "08:00 · 15 min", d: true },{ t: "Draft launch post", m: "09:30 · 60 min", ai: true },{ t: "Ten-minute walk", m: "12:30 · 10 min" },{ t: "Respond to founder Qs", m: "14:00 · 25 min", ai: true }].map((x, i) => (
              <div key={i} className="row" style={{ padding: 10, background: x.d ? "var(--surface-sunken)" : "transparent", border: "1px solid var(--border-soft)", borderRadius: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: 99, border: "1.5px solid var(--border)", background: x.d ? "var(--tempo-orange)" : "transparent" }}/>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 500, textDecoration: x.d ? "line-through" : "none", color: x.d ? "var(--fg-muted)" : "var(--fg)" }}>{x.t}</div><div className="caption">{x.m}</div></div>
                {x.ai && <Pill tone="accent">AI</Pill>}
              </div>
            ))}
            <div style={{ padding: 12, background: "var(--gradient-tempo)", borderRadius: 16, color: "#fff" }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.9, marginBottom: 4 }}>Streak</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 24 }}>5 days of pages.</div>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>Nice.</div>
            </div>
          </div>
        </Phone>
        <Phone title="Brain Dump">
          <div className="stack-3">
            <div style={{ padding: 12, background: "var(--surface-sunken)", borderRadius: 12, fontFamily: "var(--font-serif)", fontSize: 14, lineHeight: 1.5, minHeight: 200 }}>Finish landing copy. Book dentist. Ask Sam about Convex. Pick up groceries. Am I shipping fast enough?</div>
            <div className="row-apart"><span className="caption">42 words · encrypted</span><button className="btn btn-gradient btn-sm"><I.Sparkles size={12}/>Sort</button></div>
            <div className="divider"/>
            <div className="stack-2">
              {[["task","Finish landing copy"],["task","Book dentist"],["worry","Am I shipping fast enough?"]].map((x, i) => (
                <div key={i} className="row-apart" style={{ padding: 8, background: "var(--surface-sunken)", borderRadius: 10 }}>
                  <div className="row-tight"><Pill tone={x[0]==="task"?"accent":"amber"}>{x[0]}</Pill><span style={{ fontSize: 13 }}>{x[1]}</span></div>
                  <button className="btn btn-sm btn-primary" style={{ height: 28, padding: "0 10px" }}>✓</button>
                </div>
              ))}
            </div>
          </div>
        </Phone>
      </div>
    </div>
  </>
);

/* ---- Screen 26: About ---- */
const ScreenAbout = () => (
  <>
    <Topbar title="About" crumb=""/>
    <div className="page-tight">
      <div className="page-header"><div className="eyebrow">About</div><h1>A planner, by one person, for other brains.</h1></div>
      <div className="grid-asym">
        <div className="card">
          <p style={{ fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.65, marginBottom: "var(--space-4)" }}>Tempo Flow was started in the winter of 2024 by Amit Levin, after another productivity app politely shamed him for missing three days of journaling in a row.</p>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.65, marginBottom: "var(--space-4)" }}>It is built for ADHD brains, autistic brains, anxious brains, burned-out brains, and anyone who has ever felt that the calendar was a cathedral they could not enter.</p>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.65 }}>It is open-source, patent-held at the workflow layer, and dogfooded before shipped. The commitment is a dollar. The filter is intention.</p>
        </div>
        <div className="stack">
          <div className="card"><div className="eyebrow" style={{ marginBottom: 10 }}>Facts</div><div className="stack-3"><div className="row-apart"><span>Founded</span><strong>Dec 2024</strong></div><div className="row-apart"><span>Team size</span><strong>1 person</strong></div><div className="row-apart"><span>HQ</span><strong>Tel Aviv</strong></div><div className="row-apart"><span>License</span><strong>BUSL-1.1</strong></div><div className="row-apart"><span>Stack</span><strong>Next.js · Convex · Expo</strong></div></div></div>
          <div className="card sunken flat"><div className="eyebrow" style={{ marginBottom: 6 }}>Why the cream?</div><p style={{ fontSize: 13, color: "var(--fg-muted)" }}>Because paper feels kinder than glass.</p></div>
        </div>
      </div>
    </div>
  </>
);

/* ---- Screen 27: Changelog ---- */
const ScreenChangelog = () => (
  <>
    <Topbar title="Changelog" crumb=""/>
    <div className="page-tight">
      <div className="page-header"><div className="eyebrow">Changelog</div><h1>Quiet shipping notes.</h1></div>
      <div className="stack">
        {[
          { v: "1.0.0", d: "Apr 23", title: "Tempo 1.0 — Foundation", notes: ["All 42 screens live on web PWA + iOS + Android.","$1 seven-day trial via RevenueCat.","Coach warmth dial (0–10), default gentle.","Onboarding now captures pronouns + one wobble."] },
          { v: "0.9.5", d: "Apr 14", title: "Closed beta polish", notes: ["Brain Dump sorts by energy on low-spoons days.","Fixed a case where the streak banner read too sharp.","Added OpenDyslexic as a single toggle."] },
          { v: "0.9.0", d: "Apr 02", title: "Closed beta", notes: ["Thirty users, thirty letters, thirty gentle bug reports.","Journal entries now encrypted at rest.","First weekly recap generation."] },
        ].map((r, i) => (
          <div key={i} className="card">
            <div className="row-apart" style={{ marginBottom: 12 }}><div><div className="caption mono">{r.v} · {r.d}</div><h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22 }}>{r.title}</h3></div></div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15, lineHeight: 1.65, color: "var(--fg-muted)" }}>{r.notes.map((n, j) => <li key={j} style={{ marginBottom: 4 }}>{n}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  </>
);

Object.assign(window, { ScreenMobileToday, ScreenAbout, ScreenChangelog, Phone });
