/* ============================================================
   Tempo Flow — Template system (v2)
   Screens:
     - ScreenTemplatesV2    (gallery + my templates)
     - ScreenTemplateBuilder (visual block editor)   [next chunk]
     - ScreenTemplateRun    (guided run flow)        [next chunk]

   Built on top of tokens.css (soft editorial) and the I icon map
   from components.jsx.
   ============================================================ */

/* ---------- Starter template catalog ---------- */
const TF_STARTERS = [
  {
    id: "weekly-review",
    title: "Weekly Review",
    kicker: "Every Friday · 15 min",
    desc: "Nine questions that turn the week into a plan for the next one.",
    icon: "Calendar",
    tone: "amber",
    cadence: "Weekly",
    blocks: 9,
    emoji: "🗓",
    author: "Amit · Tempo",
  },
  {
    id: "morning-pages",
    title: "Morning Pages",
    kicker: "Daily · 10 min",
    desc: "Three long-form pages before the inbox. No prompts, just the blinking cursor.",
    icon: "Sun",
    tone: "orange",
    cadence: "Daily",
    blocks: 3,
    emoji: "☀",
    author: "Julia Cameron style",
  },
  {
    id: "builder-shutdown",
    title: "Builder Shutdown",
    kicker: "End of workday · 8 min",
    desc: "Close the loops. Park the next thread. Put the laptop down with a clean room.",
    icon: "Moon",
    tone: "slate",
    cadence: "Daily",
    blocks: 6,
    emoji: "🌙",
    author: "Cal Newport style",
  },
  {
    id: "sunday-reset",
    title: "Sunday Reset",
    kicker: "Weekly · 20 min",
    desc: "Recap · clear · re-aim. The single most-forked template in the library.",
    icon: "Repeat",
    tone: "moss",
    cadence: "Weekly",
    blocks: 11,
    emoji: "🌿",
    author: "Community · 2.4k forks",
    starred: true,
  },
  {
    id: "monthly-retro",
    title: "Monthly Retrospective",
    kicker: "Last day of month · 30 min",
    desc: "Wins, misses, what changed, what's next. Feeds the yearly review.",
    icon: "Chart",
    tone: "rust",
    cadence: "Monthly",
    blocks: 7,
    emoji: "📊",
    author: "Amit · Tempo",
  },
  {
    id: "yearly-review",
    title: "Yearly Review",
    kicker: "December 28 · 90 min",
    desc: "Big one. Twelve monthly retros compressed into the shape of a year.",
    icon: "Target",
    tone: "tempo",
    cadence: "Yearly",
    blocks: 14,
    emoji: "🎯",
    author: "Amit · Tempo",
  },
  {
    id: "energy-checkin",
    title: "Energy Check-in",
    kicker: "Anytime · 90 sec",
    desc: "Mood, body, sleep, spoons. Runs in under two minutes so you actually do it.",
    icon: "Flame",
    tone: "orange",
    cadence: "Ad-hoc",
    blocks: 4,
    emoji: "🔥",
    author: "Amit · Tempo",
  },
  {
    id: "project-kickoff",
    title: "Project Kickoff",
    kicker: "Once per project · 25 min",
    desc: "Why, who, what shippable looks like, what would make this fail. Ten questions.",
    icon: "Zap",
    tone: "amber",
    cadence: "Ad-hoc",
    blocks: 10,
    emoji: "⚡",
    author: "Shape Up style",
  },
  {
    id: "daily-standup",
    title: "Daily Standup (solo)",
    kicker: "Daily · 3 min",
    desc: "Yesterday · today · blockers. The PM script, for people with no PM.",
    icon: "CheckSquare",
    tone: "moss",
    cadence: "Daily",
    blocks: 3,
    emoji: "✅",
    author: "Community · 812 forks",
  },
  {
    id: "reading-session",
    title: "Reading Session",
    kicker: "Before + after reading · 5 min",
    desc: "Capture the question you came with and the sentence that stayed.",
    icon: "BookOpen",
    tone: "slate",
    cadence: "Ad-hoc",
    blocks: 5,
    emoji: "📖",
    author: "Community · 431 forks",
  },
  {
    id: "deep-work",
    title: "Deep Work Block",
    kicker: "Before a 90-min block · 4 min",
    desc: "Phone away. One sentence about what done looks like. Timer on.",
    icon: "Clock",
    tone: "rust",
    cadence: "Ad-hoc",
    blocks: 5,
    emoji: "⏱",
    author: "Cal Newport style",
  },
  {
    id: "therapy-prep",
    title: "Therapy Prep",
    kicker: "Day before session · 10 min",
    desc: "What happened, what patterns, what to actually bring. Private by default.",
    icon: "Leaf",
    tone: "moss",
    cadence: "Weekly",
    blocks: 6,
    emoji: "🌱",
    author: "Amit · Tempo",
    private: true,
  },
];

/* ---------- "My templates" mock ---------- */
const TF_MY_TEMPLATES = [
  { id: "my-shipping", title: "Shipping-day routine", kicker: "Last run · Tue", blocks: 7, cadence: "Ad-hoc", emoji: "🚢", author: "You", lastRun: "2d ago" },
  { id: "my-weekly", title: "Weekly Review — my version", kicker: "Every Friday 4pm", blocks: 12, cadence: "Weekly", emoji: "🗓", author: "You · forked from Amit", lastRun: "Fri" },
  { id: "my-reset", title: "Sunday Reset", kicker: "Every Sunday", blocks: 11, cadence: "Weekly", emoji: "🌿", author: "Community · forked", lastRun: "Sun" },
];

/* ---------- Tone helper ---------- */
const TF_TONE = {
  tempo: { bg: "linear-gradient(145deg, #F4A261, #E07A3B)", fg: "#fff" },
  orange:{ bg: "linear-gradient(145deg, #F4A261, #D97742)", fg: "#fff" },
  amber: { bg: "linear-gradient(145deg, #E8C07D, #D4A44C)", fg: "#3A2F15" },
  moss:  { bg: "linear-gradient(145deg, #6B9B78, #4A7C59)", fg: "#fff" },
  slate: { bg: "linear-gradient(145deg, #8FA4BC, #6E88A7)", fg: "#fff" },
  rust:  { bg: "linear-gradient(145deg, #D97768, #C8553D)", fg: "#fff" },
};

/* ---------- Template card ---------- */
const TemplateCard = ({ t, compact = false, onOpen, onRun }) => {
  const Ic = I[t.icon] || I.Layers;
  const tone = TF_TONE[t.tone] || TF_TONE.tempo;
  return (
    <div className="card" style={{
      display:"flex", flexDirection:"column", gap:"var(--space-3)",
      padding: compact ? 16 : 20,
      cursor:"pointer", transition:"transform 160ms var(--ease), box-shadow 160ms var(--ease)",
      position:"relative", overflow:"hidden",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "var(--shadow-lift)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    onClick={onOpen}>
      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12}}>
        <div style={{
          width: compact ? 42 : 52, height: compact ? 42 : 52, borderRadius: 12,
          background: tone.bg, color: tone.fg,
          display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink:0, fontSize: compact ? 20 : 24,
        }}>
          {t.emoji || <Ic size={compact ? 18 : 22}/>}
        </div>
        {t.starred && (
          <div title="Community favorite" style={{color:"var(--amber)", fontSize:14}}>★</div>
        )}
        {t.private && (
          <div title="Private by default" style={{color:"var(--fg-muted)", fontSize:11, display:"flex", alignItems:"center", gap:4}}>
            <I.Lock size={11} stroke={1.6}/> private
          </div>
        )}
      </div>
      <div>
        <div style={{fontFamily:"var(--font-serif)", fontSize: compact ? 17 : 20, fontWeight:500, letterSpacing:"-0.01em", marginBottom:2}}>
          {t.title}
        </div>
        <div style={{fontSize:11, color:"var(--fg-muted)", fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.06em"}}>
          {t.kicker}
        </div>
      </div>
      {!compact && (
        <p style={{color:"var(--fg-muted)", fontSize:13.5, lineHeight:1.5, margin:0}}>{t.desc}</p>
      )}
      <div style={{display:"flex", alignItems:"center", gap:8, marginTop:"auto", paddingTop:"var(--space-2)"}}>
        <span style={{fontSize:11, color:"var(--fg-muted)", fontFamily:"var(--font-mono)"}}>{t.blocks} blocks</span>
        <span style={{fontSize:11, color:"var(--fg-subtle)"}}>·</span>
        <span style={{fontSize:11, color:"var(--fg-muted)", fontFamily:"var(--font-mono)"}}>{t.cadence}</span>
        {t.lastRun && (<>
          <span style={{fontSize:11, color:"var(--fg-subtle)"}}>·</span>
          <span style={{fontSize:11, color:"var(--moss-600)", fontFamily:"var(--font-mono)"}}>ran {t.lastRun}</span>
        </>)}
        <div style={{marginLeft:"auto", display:"flex", gap:6}}>
          <button className="btn btn-sm btn-ghost" onClick={(e) => { e.stopPropagation(); onOpen?.(); }}>Open</button>
          <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); onRun?.(); }}>
            Run
          </button>
        </div>
      </div>
      {t.author && !compact && (
        <div style={{fontSize:11, color:"var(--fg-subtle)", borderTop:"1px solid var(--border-soft)", paddingTop:10, marginTop:4}}>
          {t.author}
        </div>
      )}
    </div>
  );
};

/* ---------- Gallery screen ---------- */
const ScreenTemplatesV2 = () => {
  const { setScreen } = useApp();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("gallery"); // "gallery" | "mine"

  const cadences = ["all", "Daily", "Weekly", "Monthly", "Yearly", "Ad-hoc"];
  const list = (tab === "gallery" ? TF_STARTERS : TF_MY_TEMPLATES).filter(t => {
    if (filter !== "all" && t.cadence !== filter) return false;
    if (query && !t.title.toLowerCase().includes(query.toLowerCase()) && !(t.desc || "").toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const openBuilder = (t) => {
    try { localStorage.setItem("tf-current-template", t ? t.id : "new"); } catch {}
    setScreen("template-builder");
  };
  const openRun = (t) => {
    try { localStorage.setItem("tf-current-template", t.id); } catch {}
    setScreen("template-run");
  };

  return (
    <>
      <Topbar title="Templates" crumb="You"
        right={
          <button className="btn btn-primary" onClick={() => openBuilder(null)}>
            <I.Plus size={14}/> New template
          </button>
        }/>
      <div className="page">
        <div className="page-header">
          <div className="eyebrow">Templates</div>
          <h1>Starts, not stencils.</h1>
          <p className="lede">Fork a starter, tweak a block, or build your own from scratch. Every template runs as a guided flow — not a page you have to remember to fill out.</p>
        </div>

        {/* Tab switcher + search + filters */}
        <div style={{display:"flex", gap:12, alignItems:"center", marginBottom:"var(--space-5)", flexWrap:"wrap"}}>
          <div className="seg-control" style={{flexShrink:0}}>
            <button className={tab==="gallery"?"is-active":""} onClick={() => setTab("gallery")}>Gallery · {TF_STARTERS.length}</button>
            <button className={tab==="mine"?"is-active":""} onClick={() => setTab("mine")}>My templates · {TF_MY_TEMPLATES.length}</button>
          </div>
          <div style={{position:"relative", flex:"1 1 280px", maxWidth:420}}>
            <I.Search size={15} stroke={1.6} style={{position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--fg-muted)"}}/>
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "gallery" ? "Search the starter library…" : "Search your templates…"}
              style={{width:"100%", padding:"10px 14px 10px 38px", borderRadius:10, border:"1px solid var(--border)", background:"var(--surface-card)", color:"var(--fg)", fontSize:13.5, fontFamily:"var(--font-sans)"}}/>
          </div>
          <div className="row-tight" style={{marginLeft:"auto"}}>
            {cadences.map(c => (
              <button key={c}
                className={"btn btn-sm " + (filter===c ? "btn-primary" : "btn-ghost")}
                onClick={() => setFilter(c)}>
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
        </div>

        {/* Featured row — only on gallery tab, no filter */}
        {tab === "gallery" && filter === "all" && !query && (
          <div className="card" style={{
            marginBottom:"var(--space-6)", padding:0, overflow:"hidden",
            background:"linear-gradient(145deg, #F5EADF 0%, #EBD9C7 100%)",
            border:"1px solid var(--border)",
          }}>
            <div style={{display:"grid", gridTemplateColumns:"1.1fr 1fr", gap:0}}>
              <div style={{padding:"32px 36px"}}>
                <div className="eyebrow" style={{color:"var(--tempo-orange)"}}>Featured</div>
                <h2 style={{fontFamily:"var(--font-serif)", fontSize:32, lineHeight:1.15, marginTop:8, marginBottom:12, color:"var(--ink)", letterSpacing:"-0.015em"}}>
                  Build a template from a sentence.
                </h2>
                <p style={{color:"var(--ink)", opacity:0.75, fontSize:14.5, lineHeight:1.55, marginBottom:20, maxWidth:460}}>
                  Tell Tempo what the routine is in plain language. <span style={{fontFamily:"var(--font-mono)", fontSize:13, background:"rgba(0,0,0,0.06)", padding:"2px 6px", borderRadius:4}}>/= a Friday review with a 1–10 week rating, three wins, one thing I dodged</span> — and the blocks appear, ready to tweak.
                </p>
                <div className="row-tight">
                  <button className="btn btn-primary" onClick={() => openBuilder(null)}>
                    <I.Sparkles size={14}/> Describe a template
                  </button>
                  <button className="btn btn-outline" onClick={() => setScreen("template-sketch")}>
                    <I.Image size={14}/> From a sketch
                  </button>
                </div>
              </div>
              <div style={{padding:"28px 32px 28px 0", display:"flex", alignItems:"center", justifyContent:"center"}}>
                <div style={{
                  width:"100%", maxWidth:360, background:"#FAF6EF", borderRadius:12,
                  padding:"18px 20px", boxShadow:"0 12px 32px -16px rgba(19,19,18,0.2)", border:"1px solid rgba(19,19,18,0.06)",
                  fontFamily:"var(--font-mono)", fontSize:12.5, color:"var(--ink)",
                }}>
                  <div style={{color:"var(--fg-muted)", marginBottom:8}}>&gt; /= Friday review, week rating 1–10, 3 wins, 1 thing dodged</div>
                  <div style={{borderTop:"1px solid var(--border-soft)", paddingTop:10, fontFamily:"var(--font-sans)", fontSize:13, lineHeight:1.7}}>
                    <div style={{display:"flex", alignItems:"center", gap:8}}><span style={{color:"var(--tempo-orange)"}}>▸</span><strong>Heading</strong> Friday review</div>
                    <div style={{display:"flex", alignItems:"center", gap:8}}><span style={{color:"var(--moss)"}}>●</span><strong>Rating 1–10</strong> How did the week feel?</div>
                    <div style={{display:"flex", alignItems:"center", gap:8}}><span style={{color:"var(--amber)"}}>●</span><strong>List × 3</strong> Wins</div>
                    <div style={{display:"flex", alignItems:"center", gap:8}}><span style={{color:"var(--slate)"}}>●</span><strong>Prompt</strong> What I dodged</div>
                    <div style={{color:"var(--moss-600)", marginTop:8, fontSize:11}}>4 blocks · generated in 1.2s · tweak anything</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {list.length === 0 ? (
          <div style={{textAlign:"center", padding:"80px 24px", color:"var(--fg-muted)"}}>
            <div style={{fontSize:32, marginBottom:12}}>∅</div>
            <div style={{fontFamily:"var(--font-serif)", fontSize:22, color:"var(--fg)", marginBottom:6}}>Nothing matches.</div>
            <div style={{fontSize:14}}>Try a different filter, or <button className="btn-link" onClick={() => {setFilter("all"); setQuery("");}}>clear</button>.</div>
          </div>
        ) : (
          <div className="grid-3" style={{gap:"var(--space-4)"}}>
            {/* First card in "mine" tab = create new */}
            {tab === "mine" && (
              <div className="card" onClick={() => openBuilder(null)}
                style={{
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  minHeight:240, cursor:"pointer", gap:10,
                  background:"var(--surface-sunken)", borderStyle:"dashed", borderColor:"var(--border)",
                }}>
                <div style={{width:44, height:44, borderRadius:99, background:"var(--surface-card)", color:"var(--tempo-orange)", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid var(--border)"}}>
                  <I.Plus size={20} stroke={1.8}/>
                </div>
                <div style={{fontFamily:"var(--font-serif)", fontSize:17}}>New template</div>
                <div style={{fontSize:12, color:"var(--fg-muted)", textAlign:"center", maxWidth:220}}>
                  Start from a sentence, a sketch, or a blank block canvas.
                </div>
              </div>
            )}
            {list.map(t => (
              <TemplateCard key={t.id} t={t} onOpen={() => openBuilder(t)} onRun={() => openRun(t)}/>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

Object.assign(window, {
  ScreenTemplatesV2, TemplateCard,
  TF_STARTERS, TF_MY_TEMPLATES, TF_TONE,
  ScreenTemplateBuilder: () => (
    <>
      <Topbar title="Template · builder" crumb="Templates"/>
      <div className="page">
        <div className="page-header">
          <div className="eyebrow">Template builder</div>
          <h1>Builder coming in chunk 3b.</h1>
          <p className="lede">The visual block editor (palette · canvas · inspector) lands next. Placeholder so the route works.</p>
        </div>
      </div>
    </>
  ),
  ScreenTemplateRun: () => (
    <>
      <Topbar title="Template · run" crumb="Templates"/>
      <div className="page">
        <div className="page-header">
          <div className="eyebrow">Run mode</div>
          <h1>Guided run flow coming in chunk 3d.</h1>
          <p className="lede">This is where a template executes one block at a time, with coach nudges and auto-filled variables.</p>
        </div>
      </div>
    </>
  ),
});
